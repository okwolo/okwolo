'use strict';

const {assert, isDefined, isNull, isArray, isString, isNumber, isBoolean, isNode, isObject, isFunction, makeQueue} = require('@okwolo/utils')();

// simulates the behavior of the classnames npm package. strings are concatenated,
// arrays are spread and objects keys are included if their value is truthy.
const classnames = (...args) => {
    return args
        .map((arg) => {
            if (isString(arg)) {
                return arg;
            } else if (isArray(arg)) {
                return classnames(...arg);
            } else if (isObject(arg)) {
                return classnames(
                    Object.keys(arg)
                        .map((key) => arg[key] && key)
                );
            }
        })
        .filter(Boolean)
        .join(' ');
};

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

// will build a vdom structure from the output of the app's builder funtions. this
// output must be valid element syntax, or an expception will be thrown.
const build = (element) => {
    // boolean values will produce no visible output to make it easier to use inline
    // logical expressions without worrying about unexpected strings on the page.
    if (isBoolean(element)) {
        element = null;
    }
    // null elements will produce no visible output. undefined is intentionally not
    // handled since it is often produced as a result of an unexpected builder output
    // and it should be made clear that something went wrong.
    if (isNull(element)) {
        return {text: ''};
    }
    // in order to simplify type checking, numbers are stringified.
    if (isNumber(element)) {
        element = String(element);
    }
    // strings will produce textNodes when rendered to the browser.
    if (isString(element)) {
        return {text: element};
    }

    // the only remaining element types are formatted as arrays.
    assert(isArray(element), 'dom.build : vdom object is not a recognized type', element);

    // early recursive return when the element is seen to be have the component syntax.
    if (isFunction(element[0])) {
        // leaving the props and children items undefined should not throw an error.
        let [component, props = {}, children = []] = element;
        assert(isObject(props), 'dom.build : component\'s props is not an object', element, props);
        assert(isArray(children), 'dom.build : component\'s children is not an array', element, children);
        // the component function is called with an object containing the props
        // and an extra key with the children of this element.
        return build(component(Object.assign({}, props, {children})));
    }

    let [tagType, attributes = {}, children = []] = element;
    assert(isString(tagType), 'dom.build : tag property is not a string', element, tagType);
    assert(isObject(attributes), 'dom.build : attributes is not an object', element, attributes);
    assert(isArray(children), 'dom.build : children of vdom object is not an array', element, children);

    // regular expression to capture values from the shorthand element tag syntax.
    // it allows each section to be seperated by any amount of spaces, but enforces
    // the order of the capture groups (tagName #id .className | style)
    const match = /^ *(\w+) *(?:#([-\w\d]+))? *((?:\.[-\w\d]+)*)? *(?:\|\s*([^\s]{1}[^]*?))? *$/.exec(tagType);
    assert(isArray(match), 'dom.build : tag property cannot be parsed', tagType);
    // first element is not needed since it is the entire matched string. default
    // values are not used to avoid adding blank attributes to the nodes.
    let [, tagName, id, className, style] = match;

    // priority is given to the id defined in the attributes.
    if (isDefined(id) && !isDefined(attributes.id)) {
        attributes.id = id.trim();
    }

    // class names from both the tag and the attributes are used.
    if (isDefined(attributes.className) || isDefined(className)) {
        attributes.className = classnames(attributes.className, className)
            .replace(/\./g, ' ')
            .replace(/  +/g, ' ')
            .trim();
    }

    if (isDefined(style)) {
        if (!isDefined(attributes.style)) {
            attributes.style = style;
        } else {
            // extra semicolon is added if not present to prevent conflicts.
            style = (style + ';').replace(/;;$/g, ';');
            // styles defined in the attributes are given priority by being
            // placed after the ones from the tag.
            attributes.style += style + attributes.style;
        }
    }

    return {
        tagName,
        attributes,
        children: children.map(build),
    };
};

const blob = (_window) => {
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
        assert(isNode(target), 'dom.draw : target is not a DOM node', target);
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
        assert(isNode(target), 'dom.update : target is not a DOM node', target);

        _window.requestAnimationFrame(() => {
            _update(vdom, newVdom, {DOM: target, children: [vdom]}, 0);
        });

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
        return vdom;
    };

    return {name: '@okwolo/dom', draw, update, build};
};

module.exports = blob;
