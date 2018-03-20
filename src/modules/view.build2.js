'use strict';

const u = require('../utils');
const a = u.assert;

const build = (element, childAdder, componentHandler) => {
    if (u.isNull(element) || u.isBoolean(element)) {
        element = '';
    }
    if (u.isNumber(element)) {
        element = element + '';
    }
    if (u.isString(element)) {
        return {
            text: element,
        };
    }

    a(u.isArray(element), 'bad element type');

    if (u.isFunction(element[0])) {
        const children = component[2] || [];
        a(u.isArray(children), 'component children not array');
        const params = component[1] || {};
        a(u.isObject(params), 'component params is not object');
        params.children = children;
        return componentHandler(element[0](params));
    }

    a(u.isString(element[0]) && element[0] !== '', 'tag not string');
    a(u.isObject(element[1]) || {}, 'attributes not object');
    a(u.isArray(element[2]) || [], 'children not array');

    return childAdder({
        tagName: element[0],
        attributes: element[1] || {},
        key: (element[1] || {}).key,
    }, element[2] || []);
};

const childAdder = (element, children) => {
    return Object.assign({}, element, {
        children: children.map((c) => build(c, childAdder, componentHandler)),
        childOrder: children.map((_, i) => i),
    });
};

const componentHandler = (element) => {
    return build(element, childAdder, componentHandler);
};

module.exports = (element) => {
    return build(element, childAdder, componentHandler);
};
