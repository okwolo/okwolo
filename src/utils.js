'use strict';

// internal function that wraps JSON.stringify
const prettyPrint = (obj) => {
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

    return `\n>>> ${indented}`;
};

// all typechecks should only return bools.
module.exports.isDefined = (value) => {
    return value !== undefined;
};

module.exports.isNull = (value) => {
    return value === null;
};

module.exports.isArray = (value) => {
    return Array.isArray(value);
};

module.exports.isFunction = (value) => {
    return typeof value === 'function';
};

module.exports.isString = (value) => {
    return typeof value === 'string';
};

module.exports.isNumber = (value) => {
    return typeof value === 'number';
};

module.exports.isBoolean = (value) => {
    return typeof value === 'boolean';
};

module.exports.isObject = (value) => {
    return (!!value) && (value.constructor === Object);
};

module.exports.isNode = (value) => {
    return !!(value && value.tagName && value.nodeName && value.ownerDocument && value.removeAttribute);
};

module.exports.isRegExp = (value) => {
    return value instanceof RegExp;
};

// there cannot be any assumptions about the environment globals so
// node's process should not be used.
module.exports.isBrowser = () => typeof window !== 'undefined';

module.exports.deepCopy = (obj) => {
    // undefined value would otherwise throw an error at parsing time.
    if (!isDefined(obj)) {
        return undefined;
    }
    return JSON.parse(JSON.stringify(obj));
};

// will throw an error containing the message and the culprits if the
// assertion is falsy. the message is expected to contain information
// about the location of the error followed by a meaningful error message.
// (ex. "router.redirect : url is not a string")
module.exports.assert = (assertion, message, ...culprits) => {
    if (!assertion) {
        throw new Error(`@okwolo.${message}${culprits.map(prettyPrint).join('')}`);
    }
};

// this function will create a queue object which can be used to defer
// the execution of functions.
module.exports.makeQueue = () => {
    const queue = [];

    // runs the first function in the queue if it exists. this specifically
    // does not call done or remove the function from the queue since there
    // is no knowledge about whether or not the function has completed. this
    // means that the queue will wait for a done signal before running any
    // other element.
    const run = () => {
        const func = queue[0];
        if (func) {
            func();
        }
    };

    // adds a function to the queue and calls run if the queue was empty.
    const add = (func) => {
        queue.push(func);
        if (queue.length === 1) {
            run();
        }
    };

    // removes the first element from the queue and calls run. note that
    // it is not possible to pre-call done in order to have multiple
    // functions execute immediately.
    const done = () => {
        // calling shift on an empty array does nothing.
        queue.shift();
        run();
    };

    return {add, done};
};
