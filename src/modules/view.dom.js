'use strict';

// @fires blob.draw   [view]
// @fires blob.update [view]

const {
    assert,
    isDefined,
    isFunction,
    isNode,
} = require('../utils');

// finds the longest commmon of equal items between two input arrays.
// this function can make some optimizations by assuming that both
// arrays are of equal length, that all keys are unique and that all
// keys are found in both arrays.
const longestChain = (original, successor) => {
    const count = successor.length;
    const half = count / 2;
    // current longest chain reference is saved to compare against new
    // contenders. the chain's index in the second argument is also kept.
    let longest = 0;
    let chainStart = 0;
    for (let i = 0; i < count; ++i) {
        const startInc = original.indexOf(successor[i]);
        const maxInc = Math.min(count - startInc, count - i);
        // start looking after the current index since it is already
        // known to be equal.
        let currentLength = 1;
        // loop through all following values until either array is fully
        // read or the chain of identical values is broken.
        for (let inc = 1; inc < maxInc; ++inc) {
            if (successor[i + inc] !== original[startInc + inc]) {
                break;
            }
            currentLength += 1;
        }
        if (currentLength > longest) {
            longest = currentLength;
            chainStart = i;
        }
        // quick exit if a chain is found that is longer or equal to half
        // the length of the input arrays since it means there can be no
        // longer chains.
        if (longest >= half) {
            break;
        }
    }
    return {
        start: chainStart,
        end: chainStart + longest - 1,
    };
};

// shallow diff of two objects which returns an array of keys where the value is
// different. differences include keys who's values have been deleted or added.
// since there is no reliable way to compare function equality, they are always
// considered to be different.
const diff = (original, successor) => {
    const keys = Object.keys(Object.assign({}, original, successor));
    const modifiedKeys = [];
    for (let i = 0; i < keys.length; ++i) {
        const key = keys[i];
        const valueOriginal = original[key];
        const valueSuccessor = successor[key];
        if (isFunction(valueOriginal) || isFunction(valueSuccessor)) {
            modifiedKeys.push(key);
        }
        if (valueOriginal !== valueSuccessor) {
            modifiedKeys.push(key);
        }
    }
    return modifiedKeys;
};

// recursively travels vdom to create rendered elements. after being rendered,
// all vdom objects have a "DOM" key which references the created node. this
// can be used in the update process to manipulate the real dom nodes.
const render = (global) => (velem) => {
    // the text key will only be present for text elements.
    if (isDefined(velem.text)) {
        velem.DOM = global.document.createTextNode(velem.text);
        return velem;
    }
    const element = global.document.createElement(velem.tagName);
    // attributes are added onto the node.
    Object.assign(element, velem.attributes);
    // all children are rendered and immediately appended into the parent node.
    for (let i = 0; i < velem.childOrder.length; ++i) {
        const key = velem.childOrder[i];
        const {DOM} = render(global)(velem.children[key]);
        element.appendChild(DOM);
    }
    velem.DOM = element;
    return velem;
};

// initial draw to target will wipe the contents of the container node.
const draw = (global) => (target, vdom) => {
    // the target's type is not enforced by the module and it needs to be
    // done at this point. this is done to decouple the dom module from
    // the browser (but cannot be avoided in this blob).
    assert(isNode(target), 'view.dom.draw : target is not a DOM node', target);
    render(global)(vdom);
    global.requestAnimationFrame(() => {
        target.innerHTML = '';
        target.appendChild(vdom.DOM);
    });
    return vdom;
};

// updates the existing vdom object and its html nodes to be consistent with
// the new vdom object.
const update = (global) => (target, newVDOM, VDOM) => {
    // responsibility of checking the target's type is deferred to the blobs.
    assert(isNode(target), 'view.dom.update : target is not a DOM node', target);

    // recursive function to update an element according to new state. the
    // parent and the element's parent index must be passed in order to make
    // modifications to the vdom object in place.
    const _update = (original, successor, parent, parentKey) => {
        // lack of original element implies the successor is a new element.
        if (!isDefined(original)) {
            parent.children[parentKey] = render(global)(successor);
            parent.DOM.appendChild(parent.children[parentKey].DOM);
            return;
        }

        // lack of successor element implies the original is being removed.
        if (!isDefined(successor)) {
            parent.DOM.removeChild(original.DOM);
            delete parent.children[parentKey];
            return;
        }

        // if the element's tagName has changed, the whole element must be
        // replaced. this will also capture the case where an html node is
        // being transformed into a text node since the text node's vdom
        // object will not contain a tagName.
        if (original.tagName !== successor.tagName) {
            const oldDOM = original.DOM;
            const newVDOM = render(global)(successor);
            parent.DOM.replaceChild(newVDOM.DOM, oldDOM);
            // this technique is used to modify the vdom object in place.
            // both the text element and the tag element props are reset
            // since the types are not recorded.
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

        // nodeType of three indicates that the HTML node is a textNode.
        // at this point in the function it has been estblished that the
        // original and successor nodes are of the same type.
        if (original.DOM.nodeType === 3) {
            if (original.text !== successor.text) {
                original.DOM.nodeValue = successor.text;
                original.text = successor.text;
            }
            return;
        }

        const attributesDiff = diff(original.attributes, successor.attributes);
        for (let i = 0; i < attributesDiff.length; ++i) {
            const key = attributesDiff[i];
            original.attributes[key] = successor.attributes[key];
            original.DOM[key] = successor.attributes[key];
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
            // new elements are moved to the end of the list.
            if (!original.children[key]) {
                childOrder.push(key);
            // deleted elements are removed from the list.
            } else if (!successor.children[key]) {
                childOrder.splice(childOrder.indexOf(key), 1);
            }
            _update(original.children[key], successor.children[key], original, key);
        }

        if (!childOrder.length) {
            return;
        }

        // the remainder of this function handles the reordering of the
        // node's children. current order in the dom is diffed agains the
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
            original.DOM.insertBefore(original.children[key].DOM, original.DOM.firstChild);
        }

        // elements after the "correct" chain are appended to the parent.
        const endKeys = successor.childOrder.slice(end + 1, Infinity);
        for (let i = 0; i < endKeys.length; ++i) {
            const key = endKeys[i];
            original.DOM.appendChild(original.children[key].DOM);
        }
    };

    global.requestAnimationFrame(() => {
        try {
            _update(VDOM, newVDOM, {DOM: target, children: {root: VDOM}}, 'root');
        } catch (e) {
            console.error('view.dom.update : ' + e);
        }
    });

    // TODO vdom object is modified after being returned.
    return VDOM;
};

module.exports = ({send}, global) => {
    send('blob.draw', draw(global));
    send('blob.update', update(global));
};
