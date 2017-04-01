const utils = require('goo-utils');

// creates a DOM controller
let dom = (target, build, parsers, initialState, options) => {
    // passes new state through builder and parsers
    let buildAndParse = (state) => {
        return parsers.reduce((intermediateVdom, parser) => {
            return parser(intermediateVdom);
        }, build(state));
    };

    // parses attribute's value to detect and replace string functions
    let parseAttribute = (attributeValue) => {
        let actionPattern = String(attributeValue).match(/^\(\s*([^\n,\s]+?)\s*(?:,\s*([^\s]+)\s*)?\)$/);
        if (actionPattern === null) {
            return attributeValue;
        } else {
            let action = actionPattern[1];
            let param = null;
            try {
                param = JSON.parse(actionPattern[2]);
            } catch (e) {
                param = actionPattern[2] || {};
            }
            return () => {
                act(action, param);
            };
        }
    };

    // recursively creates DOM elements from vdom object
    let render = (velem) => {
        if (!velem.tagName) {
            if (velem.text === undefined) {
                utils.err('invalid vdom output: tagName or text property missing');
            }
            velem.DOM = document.createTextNode(velem.text);
            return velem;
        }
        let element = document.createElement(velem.tagName);
        if (velem.attributes) {
            Object.keys(velem.attributes).forEach((attribute) => {
                element[attribute] = parseAttribute(velem.attributes[attribute]);
            });
        }
        if (velem.style) {
            Object.keys(velem.style).forEach((attribute) => {
                element.style[attribute] = velem.style[attribute];
            });
        }
        if (velem.children && velem.tagName !== undefined) {
            Object.keys(velem.children).forEach((key) => {
                velem.children[key] = render(velem.children[key]);
                element.appendChild(velem.children[key].DOM);
            });
        }
        velem.DOM = element;
        return velem;
    };

    // shallow diff of two objects which returns an array of the modified keys
    let diff = (original, successor) => {
        const typeOriginal = typeof original;
        const typeSuccessor = typeof successor;
        if (typeOriginal !== 'object' && typeSuccessor !== 'object') {
            return [];
        }
        const keysOriginal = Object.keys(original);
        const keysSuccessor = Object.keys(successor);
        if (typeof successor !== 'object') {
            return keysOriginal;
        }
        if (typeof original !== 'object') {
            return keysSuccessor;
        }
        return Object.keys(Object.assign(Object.assign({}, original), successor)).filter((key) => {
            let valueOriginal = original[key];
            let valueSuccessor = successor[key];
            return !((valueOriginal !== Object(valueOriginal)) &&
                    (valueSuccessor !== Object(valueSuccessor)) &&
                    (valueOriginal === valueSuccessor));
        });
    };

    // update vdom and real DOM to new state
    let update = (newState) => {
        window.requestAnimationFrame(() => _update(vdom, buildAndParse(newState), {}));
        // recursive function to update an element according to new state
        let _update = (original, successor, originalParent, parentIndex) => {
            if (original === null) {
                original = undefined;
            }
            if (successor === null) {
                successor = undefined;
            }
            if (original === undefined && successor === undefined) {
                return;
            }
            if (original === undefined) {
                // add
                originalParent.children[parentIndex] = render(successor);
                originalParent.DOM.appendChild(originalParent.children[parentIndex].DOM);
            } else if (successor === undefined) {
                // remove
                originalParent.DOM.removeChild(original.DOM);
                originalParent.children[parentIndex] = undefined;
            } else {
                if (original.tagName !== successor.tagName) {
                    // replace
                    let oldDOM = original.DOM;
                    originalParent.children[parentIndex] = render(successor);
                    originalParent.DOM.replaceChild(originalParent.children[parentIndex].DOM, oldDOM);
                } else {
                    // edit
                    if (original.DOM.nodeType === 3) {
                        if (original.text !== successor.text) {
                            original.DOM.nodeValue = successor.text;
                            original.text = successor.text;
                        }
                    } else {
                        let styleDiff = diff(original.style, successor.style);
                        let attributesDiff = diff(original.attributes, successor.attributes);
                        if (styleDiff.length !== 0) {
                            original.DOM.style.cssText = null;
                            Object.keys(successor.style).forEach((key) => {
                                original.style[key] = successor.style[key];
                                original.DOM.style[key] = successor.style[key];
                            });
                        }
                        if (attributesDiff.length !== 0) {
                            attributesDiff.forEach((key) => {
                                original.attributes[key] = successor.attributes[key];
                                original.DOM[key] = parseAttribute(successor.attributes[key]);
                            });
                        }
                    }
                }
                let keys = (Object.keys(original.children || {}).concat(Object.keys(successor.children || {})));
                let visited = {};
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
    let vdom = render(buildAndParse(initialState));

    // first render to DOM
    window.requestAnimationFrame(() => {
        target.innerHTML = '';
        target.appendChild(vdom.DOM);
    });

    return {} = {update};
};

module.exports = dom;
