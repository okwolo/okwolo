'use strict';

// @fires use #draw   [view]
// @fires use #update [view]

const {assert, isDefined, isNode, isFunction} = require('../utils')();

// shallow diff of two objects which returns an array of keys where the value is
// different. differences include keys who's values have been deleted or added.
// since there is no reliable way to compare function equality, they are always
// considered to be different.
const diff = (original, successor) => {
    return Object.keys(Object.assign({}, original, successor)).filter((key) => {
        const valueOriginal = original[key];
        const valueSuccessor = successor[key];
        if (isFunction(valueOriginal) || isFunction(valueSuccessor)) {
            return true;
        }
        return valueOriginal !== valueSuccessor;
    });
};

module.exports = ({use}, global) => {
    // recursively travels vdom to create rendered elements. after being rendered,
    // all vdom objects have a "DOM" key which references the created node. this
    // can be used in the update process to manipulate the real dom nodes.
    const render = (velem) => {
        // the text key will only be present for text elements.
        if (isDefined(velem.text)) {
            velem.DOM = global.document.createTextNode(velem.text);
            return velem;
        }
        const element = global.document.createElement(velem.tagName);
        // attributes are added onto the node.
        Object.assign(element, velem.attributes);
        // all children are rendered and immediately appended into the parent node.
        velem.childOrder.forEach((key) => {
            const {DOM} = render(velem.children[key]);
            element.appendChild(DOM);
        });
        velem.DOM = element;
        return velem;
    };

    // initial draw to target will wipe the contents of the container node.
    const draw = (target, vdom) => {
        // the target's type is not enforced by the module and it needs to be
        // done at this point. this is done to decouple the dom module from
        // the browser (but cannot be avoided in this blob).
        assert(isNode(target), 'view.dom.draw : target is not a DOM node', target);
        render(vdom);
        global.requestAnimationFrame(() => {
            target.innerHTML = '';
            target.appendChild(vdom.DOM);
        });
        return vdom;
    };

    // updates the existing vdom object and its html nodes to be consistent with
    // the new vdom object.
    const update = (target, newVDOM, VDOM) => {
        // responsibility of checking the target's type is deferred to the blobs.
        assert(isNode(target), 'view.dom.update : target is not a DOM node', target);

        // recursive function to update an element according to new state. the
        // parent and the element's parent index must be passed in order to make
        // modifications to the vdom object in place.
        const _update = (original, successor, parent, parentKey) => {
            // lack of original element implies the successor is a new element.
            if (!isDefined(original)) {
                parent.children[parentKey] = render(successor);
                const parentPosition = parent.childOrder.indexOf(parentKey);
                const nextElement = parent.children[parent.childOrder[parentPosition + 1]];
                parent.DOM.insertBefore(
                    parent.children[parentKey].DOM,
                    nextElement ? nextElement.DOM : null,
                );
                return;
            }

            // lack of successor element implies the original is being removed.
            if (!isDefined(successor)) {
                parent.DOM.removeChild(original.DOM);
                delete parent.children[parentKey];
                return;
            }

            // TODO rearrange children
            original.childOrder = successor.childOrder;

            // if the element's tagName has changed, the whole element must be
            // replaced. this will also capture the case where an html node is
            // being transformed into a text node since the text node's vdom
            // object will not contain a tagName.
            if (original.tagName !== successor.tagName) {
                const oldDOM = original.DOM;
                const newVDOM = render(successor);
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
            attributesDiff.forEach((key) => {
                original.attributes[key] = successor.attributes[key];
                original.DOM[key] = successor.attributes[key];
            });

            // accumulate all child keys from both the original node and the
            // successor node. each child is then recursively updated.
            const childKeys = Object.keys(Object.assign({}, original.children, successor.children));
            childKeys.forEach((key) => {
                _update(original.children[key], successor.children[key], original, key);
            });
        };

        global.requestAnimationFrame(() => {
            _update(VDOM, newVDOM, {DOM: target, children: {root: VDOM}}, 'root');
        });

        // TODO vdom object is modified after being returned.
        return VDOM;
    };

    use({
        draw,
        update,
    });
};
