'use strict';

const utils = () => {
    // all typechecks must always return a boolean value.
    const isDefined = (value) => value !== undefined;
    const isNull = (value) => value === null;
    const isArray = (value) => Array.isArray(value);
    const isFunction = (value) => typeof value === 'function';
    const isString = (value) => typeof value === 'string';
    const isNumber = (value) => typeof value === 'number';
    const isBoolean = (value) => typeof value === 'boolean';
    const isObject = (value) => (!!value) && (value.constructor === Object);
    const isNode = (value) => !!(value && value.tagName && value.nodeName && value.ownerDocument && value.removeAttribute);
    const isRegExp = (value) => value instanceof RegExp;

    // there cannot be any assumptions about the environment globals so
    // node's process should not be used.
    const isBrowser = () => typeof window !== 'undefined';

    const deepCopy = (obj) => {
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
    const assert = (assertion, message, ...culprits) => {
        const print = (obj) => {
            // formatted printing of any culript value. it uses a custom
            // replacer function to handle functions and print them instead
            // of ignoring them. the output is also formatted and indented
            // to four spaces from the left.
            return '\n>>> ' + String(JSON.stringify(obj, (key, value) => {
                return (typeof value === 'function')
                    ? value.toString()
                    : value;
            }, 2)).replace(/\n/g, '\n    ');
        };
        if (!assertion) {
            throw new Error(`@okwolo.${message}${culprits.map(print).join('')}`);
        }
    };

    // this function will create a queue object which can be used to defer
    // the execution of functions.
    const makeQueue = () => {
        const queue = [];

        // runs the first function in the queue if it exists. this specifically
        // does not call done or remove the function from the queue since there
        // is no knowledge about whether or not the function has completed. this
        // means that the queue will wait for a done signal before running any
        // other element.
        const run = () => {
            const func = queue[0];
            if (isDefined(func)) {
                func();
            }
        };

        // adds a function to the queue and calls run if the queue was empty.
        const add = (func) => {
            assert(isFunction(func), 'utils.makeQueue.add : added objects must be a function', func);
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

    // a bus construct created by this function is exposed by the use interface.
    // in this context, the term event is used instead of blob.
    const makeBus = () => {
        // stores arrays of handlers for each event key.
        const handlers = {};
        // stores names from named events to enforce uniqueness.
        const names = {};

        // attaches a handler to a specific event key.
        const on = (type, handler) => {
            assert(isString(type), 'utils.bus : handler type is not a string', type);
            assert(isFunction(handler), 'utils.bus : handler is not a function', handler);
            if (!isDefined(handlers[type])) {
                handlers[type] = [];
            }
            handlers[type].push(handler);
        };

        // accepts events and invokes the appropriate handlers for each key.
        const handle = (event) => {
            assert(isObject(event), 'utils.bus : event is not an object', event);
            const {name} = event;
            if (isDefined(name)) {
                assert(isString(name), 'utils.bus : event name is not a string', name);
                // early return if the name has been used before.
                if (isDefined(names[name])) {
                    return;
                }
                names[name] = true;
            }
            Object.keys(event).forEach((key) => {
                if (!isDefined(handlers[key])) {
                    return;
                }
                handlers[key].forEach((handler) => handler(event[key]));
            });
        };

        return Object.assign(handle, {on});
    };

    return {
        deepCopy,
        assert,
        isDefined,
        isNull,
        isArray,
        isFunction,
        isString,
        isNumber,
        isBoolean,
        isObject,
        isNode,
        isRegExp,
        isBrowser,
        makeQueue,
        makeBus,
    };
};

module.exports = utils;
