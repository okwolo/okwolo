'use strict';

const {
    assert,
    is,
} = require('./utils');

module.exports = (tagName, attributes, ...children) => {
    assert(is.string(tagName) || is.function(tagName), 'h : tagName is not a string or a function', tagName);
    if (!attributes) {
        attributes = {};
    } else {
        assert(is.object(attributes), 'h : attributes is not an object', attributes);
    }

    // flattens child items produced by spreading an array into an object.
    // ex. `<div>{...items.map((item) => ...)}</div>` will result in a child
    // of the form `{0: ..., 1: ...}` after babel's transpilation.
    const normalizedChildren = [];
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (is.object(child) && !is.array(child)) {
            const nested = Object.keys(child);
            for (let j = 0; j < nested.length; j++) {
                normalizedChildren.push(child[nested[j]]);
            }
        } else {
            normalizedChildren.push(child);
        }
    }

    return [tagName, attributes, normalizedChildren];
};
