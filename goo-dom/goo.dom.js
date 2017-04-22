const {assert, isDefined, isNull, isArray, isString, isNode, isObject, isFunction, blobHandler} = require('../goo-utils/goo.utils');

// creates a DOM controller
const createController = (window, target, builder, initialState) => {
    // build vdom from state
    const build = (state) => {
        const parse = (element) => {
            if (isNull(element)) {
                return {text: ''};
            }
            if (isString(element)) {
                return {text: element};
            }
            assert(isArray(element), `vdom object is not an array or string\n${element}`);
            assert(isString(element[0]), `tag property is not a string\n${element}`);
            // capture groups: tagName, id, className, style
            const match = /^ *(\w+) *(?:#([^#\s.]+))? *((?:\.[^#\s.]+)*)? *(?:\|\s*([^\s]{1}[^\n]*?))? *$/.exec(element[0]);
            assert(isArray(match), `tag property cannot be parsed\n"${element[0]}"`);
            if (!isObject(element[1])) {
                element[1] = {};
            }
            if (isDefined(match[2]) && !isDefined(element[1].id)) {
                element[1].id = match[2].trim();
            }
            if (isDefined(match[3])) {
                if (!isDefined(element[1].className)) {
                    element[1].className = '';
                }
                element[1].className += match[3].replace(/\./g, ' ');
                element[1].className = element[1].className.trim();
            }
            if (isDefined(match[4])) {
                if (!isDefined(element[1].style)) {
                    element[1].style = '';
                }
                element[1].style += ';' + match[4];
                element[1].style = element[1].style.replace(/^;/g, '');
            }
            if (isDefined(element[2])) {
                assert(isArray(element[2]), `children of vdom object is not an array\n${element}`);
            } else {
                element[2] = [];
            }
            return {
                tagName: match[1],
                attributes: element[1],
                children: element[2].map((c) => parse(c)),
            };
        };
        return parse(builder(state));
    };

    // recursively creates DOM elements from vdom object
    const render = (velem) => {
        if (isDefined(velem.text)) {
            velem.DOM = window.document.createTextNode(velem.text);
            return velem;
        }
        const element = window.document.createElement(velem.tagName);
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
    const update = (newState) => {
        window.requestAnimationFrame(() => _update(vdom, build(newState), {}));
        // recursive function to update an element according to new state
        const _update = (original, successor, originalParent, parentIndex) => {
            if (!isDefined(original) && !isDefined(successor)) {
                return;
            }
            if (!isDefined(original)) {
                // add
                originalParent.children[parentIndex] = render(successor);
                originalParent.DOM.appendChild(originalParent.children[parentIndex].DOM);
            } else if (!isDefined(successor)) {
                // remove
                originalParent.DOM.removeChild(original.DOM);
                originalParent.children[parentIndex] = undefined;
            } else {
                if (original.tagName !== successor.tagName) {
                    // replace
                    const oldDOM = original.DOM;
                    if (isDefined(originalParent.children)) {
                        originalParent.children[parentIndex] = render(successor);
                        originalParent.DOM.replaceChild(originalParent.children[parentIndex].DOM, oldDOM);
                    } else { // case when replaced element is root
                        vdom = render(successor);
                        target.innerHTML = '';
                        target.appendChild(vdom.DOM);
                    }
                } else {
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
                                original.DOM[key] = parseAttribute(successor.attributes[key]);
                            });
                        }
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
            }
        };
    };

    // storing initial vdom
    let vdom = render(build(initialState));

    // first render to DOM
    window.requestAnimationFrame(() => {
        target.innerHTML = '';
        target.appendChild(vdom.DOM);
    });

    return update;
};

const dom = (_window = window) => {
    const controllerBlobHandler = ({target, builder, initialState, update}) => {
        assert(isNode(target), `target is not a dom node\n${target}`);
        assert(isFunction(builder), `builder is not a function\n${builder}`);
        assert(isDefined(initialState), `initialState is not defined\n${initialState}`);
        return createController(_window, target, builder, initialState);
    };

    const use = (blob) => {
        return blobHandler({
            controller: controllerBlobHandler,
        }, blob);
    };

    return {} = {use};
};

module.exports = dom;
