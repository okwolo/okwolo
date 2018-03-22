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
    return [tagName, attributes, children];
};
