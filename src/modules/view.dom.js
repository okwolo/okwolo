'use strict';

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

module.exports = ({use}, _window) => {
    // recursively travels vdom to create rendered elements. after being rendered,
    // all vdom objects have a "DOM" key which references the created node. this
    // can be used in the update process to manipulate the real dom nodes.
    const render = (velem) => {
        // the text key will only be present for text elements.
        if (isDefined(velem.text)) {
            velem.DOM = _window.document.createTextNode(velem.text);
            return velem;
        }
        const element = _window.document.createElement(velem.tagName);
        // attributes are added onto the node.
        Object.assign(element, velem.attributes);
        // all children are rendered and immediately appended into the parent node
        // in the same order that they appear in the children array.
        Object.keys(velem.children).forEach((key) => {
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
        _window.requestAnimationFrame(() => {
            target.innerHTML = '';
            target.appendChild(vdom.DOM);
        });
        return vdom;
    };

    // updates the existing vdom object and its html nodes to be consistent with
    // the new vdom object.
    const update = (target, newVdom, vdom) => {
        // responsibility of checking the target's type is deferred to the blobs.
        assert(isNode(target), 'view.dom.update : target is not a DOM node', target);

        // recursive function to update an element according to new state. the
        // parent and the element's parent index must be passed in order to make
        // modifications to the vdom object in place.
        const _update = (original, successor, originalParent, parentIndex) => {
            // covers an uncommon edge case.
            if (!isDefined(original) && !isDefined(successor)) {
                return;
            }

            // lack of original element implies the successor is a new element.
            if (!isDefined(original)) {
                originalParent.children[parentIndex] = render(successor);
                originalParent.DOM.appendChild(originalParent.children[parentIndex].DOM);
                return;
            }

            // lack of successor element implies the original is being removed.
            if (!isDefined(successor)) {
                originalParent.DOM.removeChild(original.DOM);
                delete originalParent.children[parentIndex];
                return;
            }

            // if the element's tagName has changed, the whole element must be
            // replaced. this will also capture the case where an html node is
            // being transformed into a text node since the text node's vdom
            // object will not contain a tagName.
            if (original.tagName !== successor.tagName) {
                const oldDOM = original.DOM;
                const newVDOM = render(successor);
                originalParent.DOM.replaceChild(newVDOM.DOM, oldDOM);
                // this technique is used to modify the vdom object in place.
                // both the text element and the tag element props are reset
                // since the types are not recorded.
                Object.assign(original, {
                    DOM: undefined,
                    text: undefined,
                    tagName: undefined,
                    attributes: undefined,
                    children: undefined,
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

            const max = Math.max(original.children.length, successor.children.length);
            for (let i = 0; i < max; ++i) {
                _update(original.children[i], successor.children[i], original, i);
            }
        };

        _window.requestAnimationFrame(() => {
            _update(vdom, newVdom, {DOM: target, children: [vdom]}, 0);
        });

        // TODO vdom object is modified after being returned.
        return vdom;
    };

    use({
        draw,
        update,
    });
};
