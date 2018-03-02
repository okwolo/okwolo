'use strict';

// @fires blob.draw   [view]
// @fires blob.update [view]

const {
    assert,
    diff,
    longestChain,
    isDefined,
    isNode,
} = require('../utils');

module.exports = ({send}, global) => {
    // recursively travels vdom to create rendered nodes. after being rendered,
    // all vdom objects have a "DOM" key which references the created node. this
    // can be used in the update process to manipulate the real dom nodes.
    const render = (vnode) => {
        // the text key will only be present for text nodes.
        if (isDefined(vnode.text)) {
            vnode.DOM = global.document.createTextNode(vnode.text);
            return vnode;
        }

        const node = global.document.createElement(vnode.tagName);

        // attributes are added onto the node.
        Object.assign(node, vnode.attributes);

        // all children are rendered and immediately appended into the parent node.
        for (let i = 0; i < vnode.childOrder.length; ++i) {
            const key = vnode.childOrder[i];
            const {DOM} = render(vnode.children[key]);
            node.appendChild(DOM);
        }

        vnode.DOM = node;

        return vnode;
    };

    // initial draw to target will wipe the contents of the container node.
    const draw = (target, newVDOM) => {
        // the target's type is not enforced by the module and it needs to be
        // done at this point. this is done to decouple the dom module from
        // the browser (but cannot be avoided in this module).
        assert(isNode(target), 'view.dom.draw : target is not a DOM node', target);

        // render modifies the vdom tree in place.
        render(newVDOM);

        global.requestAnimationFrame(() => {
            target.innerHTML = '';
            target.appendChild(newVDOM.DOM);
        });

        return newVDOM;
    };

    // recursive function to update an node according to new state. the
    // parent and the node's parent index must be passed in order to make
    // modifications to the vdom object in place.
    const updateNode = (DOMChanges, original, successor, parent, parentKey) => {
        // lack of original node implies the successor is a new node.
        if (!isDefined(original)) {
            parent.children[parentKey] = render(successor);
            const parentNode = parent.DOM;
            const node = parent.children[parentKey].DOM;
            DOMChanges.push(() => {
                parentNode.appendChild(node);
            });
            return;
        }

        // lack of successor node implies the original is being removed.
        if (!isDefined(successor)) {
            const parentNode = parent.DOM;
            const node = original.DOM;
            DOMChanges.push(() => {
                parentNode.removeChild(node);
            });
            delete parent.children[parentKey];
            return;
        }

        original.componentIdentity = successor.componentIdentity;

        // if the node's tagName has changed, the whole node must be
        // replaced. this will also capture the case where an html node is
        // being transformed into a text node since the text node's vdom
        // object will not contain a tagName.
        if (original.tagName !== successor.tagName) {
            const oldDOM = original.DOM;
            const newVDOM = render(successor);
            const parentNode = parent.DOM;
            const node = newVDOM.DOM;
            DOMChanges.push(() => {
                parentNode.replaceChild(node, oldDOM);
            });
            // this technique is used to modify the vdom object in place.
            // both the text node and the tag node props are reset
            // since the original's type is not explicit.
            Object.assign(original, {
                DOM: undefined,
                text: undefined,
                tagName: undefined,
                attributes: undefined,
                children: undefined,
                childOrder: undefined,
            }, newVDOM);
            return;
        }

        // at this point in the function it has been established that the
        // original and successor nodes are of the same type. this block
        // handles the case where two text nodes are compared.
        if (original.text !== undefined) {
            const text = successor.text;
            if (original.text !== text) {
                const node = original.DOM;
                DOMChanges.push(() => {
                    node.nodeValue = text;
                });
                original.text = text;
            }
            return;
        }

        // nodes' attributes are updated to the successor's values.
        const attributesDiff = diff(original.attributes, successor.attributes);
        for (let i = 0; i < attributesDiff.length; ++i) {
            const key = attributesDiff[i];
            const value = successor.attributes[key];
            original.attributes[key] = value;
            const node = original.DOM;
            DOMChanges.push(() => {
                node[key] = value;
            });
        }

        // list representing the actual order of children in the dom. it is
        // used later to rearrange nodes to match the desired child order.
        const childOrder = original.childOrder.slice();

        original.childOrder = successor.childOrder;

        // accumulate all child keys from both the original node and the
        // successor node. each child is then recursively updated.
        const childKeys = Object.keys(Object.assign({}, original.children, successor.children));
        for (let i = 0; i < childKeys.length; ++i) {
            const key = childKeys[i];
            // new nodes are moved to the end of the list.
            if (!original.children[key]) {
                childOrder.push(key);
            // deleted nodes are removed from the list.
            } else if (!successor.children[key]) {
                childOrder.splice(childOrder.indexOf(key), 1);
            }
            updateNode(DOMChanges, original.children[key], successor.children[key], original, key);
        }

        if (!childOrder.length) {
            return;
        }

        // the remainder of this function handles the reordering of the
        // node's children. current order in the dom is diffed against the
        // correct order. as an optimization, only the longest common chain
        // of keys is kept in place and the nodes that are supposed to be
        // before and after are moved into position. this solution was
        // chosen because it is a relatively cheap computation, can be
        // implemented concisely and is compatible with the restriction that
        // dom nodes can only be moved one at a time.
        const {start, end} = longestChain(childOrder, successor.childOrder);

        // elements before the "correct" chain are prepended to the parent.
        // another important consideration is that dom nodes can only exist
        // in one position in the dom. this means that moving a node
        // implicitly removes it from its original position.
        const startKeys = successor.childOrder.slice(0, start);
        for (let i = startKeys.length - 1; i >= 0; --i) {
            const key = startKeys[i];
            const parentNode = original.DOM;
            const node = original.children[key].DOM;
            DOMChanges.push(() => {
                parentNode.insertBefore(node, parentNode.firstChild);
            });
        }

        // elements after the "correct" chain are appended to the parent.
        const endKeys = successor.childOrder.slice(end + 1, Infinity);
        for (let i = 0; i < endKeys.length; ++i) {
            const key = endKeys[i];
            const parentNode = original.DOM;
            const node = original.children[key].DOM;
            DOMChanges.push(() => {
                parentNode.appendChild(node);
            });
        }
    };

    // updates the existing vdom object and its html nodes to be consistent with
    // the new vdom object.
    const update = (target, successor, address = [], VDOM, identity) => {
        // responsibility of checking the target's type is deferred to the blobs.
        assert(isNode(target), 'view.dom.update : target is not a DOM node', target);

        // node update function's arguments are scoped down the VDOM tree
        // according to the supplied address.
        let parent = {DOM: target, children: {root: VDOM}, childOrder: ['root']};
        let parentKey = 'root';
        let original = VDOM;
        for (let i = 0; i < address.length; ++i) {
            parentKey = address[i];
            parent = original;
            original = original.children[parentKey];
        }

        // if a matching identity is requested, the vdom node at the specified
        // address is checked for equality.
        if (identity) {
            const identityMatch = original.componentIdentity === identity;
            assert(identityMatch, 'view.dom.update : target of update has incorrect identity (this is generally caused by a component update being called on a component that no longer exists)');
        }

        // node update function adds all DOM changes to the array while it is
        // updating the vdom. these changes are safe to be executed later in an
        // animation frame, as long as the order is respected.
        const DOMChanges = [];
        updateNode(DOMChanges, original, successor, parent, parentKey);

        global.requestAnimationFrame(() => {
            try {
                for (let i = 0; i < DOMChanges.length; ++i) {
                    DOMChanges[i]();
                }
            } catch (e) {
                console.error('view.dom.update : ' + e);
            }
        });

        return VDOM;
    };

    send('blob.draw', draw);
    send('blob.update', update);
};
