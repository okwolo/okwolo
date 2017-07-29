'use strict';

const {assert, isDefined, isNull, isArray, isString, isNode, isObject, isFunction, makeQueue} = require('@okwolo/utils')();

const blob = (_window = window) => {
    // recursively creates DOM elements from vdom object
    const render = (velem) => {
        if (isDefined(velem.text)) {
            velem.DOM = _window.document.createTextNode(velem.text);
            return velem;
        }
        const element = _window.document.createElement(velem.tagName);
        Object.keys(velem.attributes).forEach((attribute) => {
            element[attribute] = velem.attributes[attribute];
        });
        Object.keys(velem.children).forEach((key) => {
            velem.children[key] = render(velem.children[key]);
            element.appendChild(velem.children[key].DOM);
        });
        velem.DOM = element;
        return velem;
    };

    // initial draw to container
    const draw = (target, vdom) => {
        assert(isNode(target), 'dom.draw : target is not a DOM node', target);
        if (!isDefined(vdom)) {
            vdom = {text: ''};
        }
        vdom = render(vdom);
        _window.requestAnimationFrame(() => {
            target.innerHTML = '';
            target.appendChild(vdom.DOM);
        });
        return vdom;
    };

    /* shallow diff of two objects which returns an array of the
        modified keys (functions always considered different)*/
    const diff = (original, successor) => {
        return Object.keys(Object.assign({}, original, successor)).filter((key) => {
            const valueOriginal = original[key];
            const valueSuccessor = successor[key];
            return !((valueOriginal !== Object(valueOriginal)) &&
                    (valueSuccessor !== Object(valueSuccessor)) &&
                    (valueOriginal === valueSuccessor));
        });
    };

    // update vdom and real DOM to new state
    const update = (target, newVdom, vdom) => {
        assert(isNode(target), 'dom.update : target is not a DOM node', target);
        // using a queue to clean up deleted nodes after diffing finishes
        let queue = makeQueue();
        _window.requestAnimationFrame(() => {
            queue.add(() => {
                _update(vdom, newVdom, {DOM: target, children: [vdom]}, 0);
                queue.done();
            });
        });
        // recursive function to update an element according to new state
        const _update = (original, successor, originalParent, parentIndex) => {
            if (!isDefined(original) && !isDefined(successor)) {
                return;
            }
            const shouldUpdate = successor && successor.attributes && successor.attributes.shouldUpdate;
            if (shouldUpdate === false) {
                return;
            }
            // add
            if (!isDefined(original)) {
                originalParent.children[parentIndex] = render(successor);
                originalParent.DOM.appendChild(originalParent.children[parentIndex].DOM);
                return;
            }
            // remove
            if (!isDefined(successor)) {
                originalParent.DOM.removeChild(original.DOM);
                queue.add(() => {
                    delete originalParent.children[parentIndex];
                    queue.done();
                });
                return;
            }
            // replace
            if (original.tagName !== successor.tagName) {
                const oldDOM = original.DOM;
                const newVDOM = render(successor);
                originalParent.DOM.replaceChild(newVDOM.DOM, oldDOM);
                /* need to manually delete to preserve reference to past object */
                if (isDefined(newVDOM.text)) {
                    originalParent.children[parentIndex].DOM = newVDOM.DOM;
                    originalParent.children[parentIndex].text = newVDOM.text;
                    delete originalParent.children[parentIndex].tagName;
                    delete originalParent.children[parentIndex].attributes;
                    delete originalParent.children[parentIndex].children;
                } else {
                    originalParent.children[parentIndex].DOM = newVDOM.DOM;
                    delete originalParent.children[parentIndex].text;
                    originalParent.children[parentIndex].tagName = newVDOM.tagName;
                    originalParent.children[parentIndex].attributes = newVDOM.attributes;
                    originalParent.children[parentIndex].children = newVDOM.children;
                }
                return;
            }
            // edit
            if (original.DOM.nodeType === 3) {
                if (original.text !== successor.text) {
                    original.DOM.nodeValue = successor.text;
                    original.text = successor.text;
                }
            } else {
                const attributesDiff = diff(original.attributes, successor.attributes);
                if (attributesDiff.length !== 0) {
                    attributesDiff.forEach((key) => {
                        original.attributes[key] = successor.attributes[key];
                        original.DOM[key] = successor.attributes[key];
                    });
                }
            }
            const keys = (Object.keys(original.children || {}).concat(Object.keys(successor.children || {})));
            const visited = {};
            keys.forEach((key) => {
                if (visited[key] === undefined) {
                    visited[key] = true;
                    _update(original.children[key], successor.children[key], original, key);
                }
            });
        };
        return vdom;
    };

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

    // build vdom from builder output
    const build = (element) => {
        if (isNull(element)) {
            return {text: ''};
        }
        if (isString(element)) {
            return {text: element};
        }
        assert(isArray(element), 'dom.build : vdom object is not an array or string', element);
        if (isFunction(element[0])) {
            let props = element[1] || {};
            assert(isObject(props), 'dom.build : component\'s props is not an object', element, props);
            let children = element[2] || [];
            assert(isArray(children), 'dom.build : component\'s children is not an array', element, children);
            return build(element[0](Object.assign({}, props, {children})));
        }
        let [tagType, attributes, children] = element;
        assert(isString(tagType), 'dom.build : tag property is not a string', element, tagType);
        // capture groups: tagName, id, className, style
        const match = /^ *(\w+) *(?:#([-\w\d]+))? *((?:\.[-\w\d]+)*)? *(?:\|\s*([^\s]{1}[^]*?))? *$/.exec(tagType);
        assert(isArray(match), 'dom.build : tag property cannot be parsed', tagType);
        let [, tagName, id, className, style] = match;
        if (attributes == null) {
            attributes = {};
        }
        assert(isObject(attributes), 'dom.build : attributes is not an object', element, attributes);
        if (isDefined(id) && !isDefined(attributes.id)) {
            attributes.id = id.trim();
        }
        if (isDefined(attributes.className) || isDefined(className)) {
            attributes.className = classnames(
                attributes.className,
                className,
            ).replace(/\./g, ' ').replace(/  +/g, ' ').trim();
        }
        if (isDefined(style)) {
            if (!isDefined(attributes.style)) {
                attributes.style = style;
            } else {
                attributes.style += ';' + style;
                attributes.style = attributes.style.replace(/;;/g, ';');
            }
        }
        if (isDefined(children)) {
            assert(isArray(children), 'dom.build : children of vdom object is not an array', element, children);
        } else {
            children = [];
        }
        return {
            tagName,
            attributes,
            children: children.map(build),
        };
    };

    return {draw, update, build};
};

module.exports = blob;
