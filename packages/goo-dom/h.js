'use strict';

const {assert, isString, isObject, isFunction} = require('goo-utils')();

const h = (tagName, attributes, ...children) => {
    assert(isString(tagName) || isFunction(tagName), 'dom.h : tagName is not a string or a function', tagName);
    if (!attributes) {
        attributes = {};
    } else {
        assert(isObject(attributes), 'dom.h : attributes is not an object', attributes);
    }
    return [tagName, attributes, children];
};

module.exports = h;
