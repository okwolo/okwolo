'use strict';

const {
    assert,
    isFunction,
    isObject,
    isString,
} = require('./utils');

module.exports = (tagName, attributes, ...children) => {
    assert(isString(tagName) || isFunction(tagName), 'h : tagName is not a string or a function', tagName);
    if (!attributes) {
        attributes = {};
    } else {
        assert(isObject(attributes), 'h : attributes is not an object', attributes);
    }
    return [tagName, attributes, children];
};
