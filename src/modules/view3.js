'use strict';

const pp = (obj) => {
    // uses a custom replacer to correctly handle functions
    const stringified = JSON.stringify(obj, (key, value) => {
        return (typeof value === 'function')
            ? value.toString()
            : value;
    }, 2);

    // stringified value is passed through the String constructor to
    // correct for the "undefined" case. each line is then indented.
    const indented = String(stringified)
        .replace(/\n/g, '\n    ');

    console.log(`\n>>> ${indented}`);
};

const {
    isArray,
    isFunction,
    isString,
} = require('../utils');

const Component1 = () => () => (
    ['div', {}, [
        [Component2, {}, []],
        'test',
    ]]
);

const Component2 = () => () => (
    [Component3, {}, []]
);

const Component3 = () => () => (
    ['span', {}, [
        'test',
    ]]
);

const build = (element, ancestry = []) => {
    if (isString(element)) {
        return {
            ancestry,
            text: element,
        };
    }

    if (!isArray(element)) {
        throw new Error('test');
    }

    if (isFunction(element[0])) {
        return build(element[0](Object.assign(element[1], {
            children: element[2],
        }))(), ancestry);
    }

    return {
        ancestry,
        tag: element[0],
        attributes: element[1],
        children: element[2].map((e, i) => build(e, ancestry.concat(i))),
    };
};

pp(build(
    ['div', {}, [
        [Component1, {}, []],
    ]],
));

const m = ({on, send}) => {
    on('builder', (builder) => {

    });

    on('state', (state) => {

    });
};

const core = require('../core');

const app = core({
    modules: [
        m,
    ],
})(
    window.document.body,
    window,
);
