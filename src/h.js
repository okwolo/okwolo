'use strict';

const {assert, isString, isObject, isFunction} = require('./utils')();

module.exports = (tagName, attributes, ...children) => {
    assert(isString(tagName) || isFunction(tagName), 'dom.h : tagName is not a string or a function', tagName);
    if (!attributes) {
        attributes = {};
    } else {
        assert(isObject(attributes), 'dom.h : attributes is not an object', attributes);
    }
    return [tagName, attributes, children];
};
