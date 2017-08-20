'use strict';

const utils = () => {
    const isDefined = (value) => value !== undefined;
    const isNull = (value) => value === null;
    const isArray = (value) => Array.isArray(value);
    const isFunction = (value) => typeof value === 'function';
    const isString = (value) => typeof value === 'string';
    const isObject = (value) => (!!value) && (value.constructor === Object);
    const isNode = (value) => !!(value && value.tagName && value.nodeName && value.ownerDocument && value.removeAttribute);

    const isBrowser = () => {
        if (typeof window !== 'undefined') {
            return true;
        }
    };

    const deepCopy = (obj) => {
        if (!isDefined(obj)) {
            return undefined;
        }
        return JSON.parse(JSON.stringify(obj));
    };

    const assert = (assertion, message, ...culprits) => {
        const print = (obj) => {
            return '\n>>> ' + String(JSON.stringify(obj, (key, value) => {
                return (typeof value === 'function')
                    ? value.toString()
                    : value;
            }, 2)).replace(/\n/g, '\n    ');
        };
        if (!assertion) {
            if (culprits.length > 0) {
                message += culprits.map(print).join('');
            }
            throw new Error(`@okwolo.${message}`);
        }
    };

    const makeQueue = () => {
        const queue = [];
        const run = () => {
            const func = queue[0];
            if (isDefined(func)) {
                func();
            }
        };
        const add = (func) => {
            assert(isFunction(func), 'utils.makeQueue.add : added objects must be a function', func);
            queue.push(func);
            if (queue.length === 1) {
                run();
            }
        };
        const done = () => {
            queue.shift();
            run();
        };
        return {add, done};
    };

    const bus = (queue) => {
        const handlers = {};
        const names = {};

        const on = (type, handler) => {
            assert(isString(type), 'utils.bus : handler type is not a string', type);
            assert(isFunction(handler), 'utils.bus : handler is not a function', handler);
            if (!isDefined(handlers[type])) {
                handlers[type] = [];
            }
            handlers[type].push(handler);
        };

        const handle = (event) => {
            assert(isObject(event), 'utils.bus : event is not an object', event);
            const {name} = event;
            if (isDefined(name)) {
                assert(isString(name), 'utils.bus : event name is not a string', name);
                if (isDefined(names[name])) {
                    return;
                }
                names[name] = true;
            }
            Object.keys(event).forEach((key) => {
                if (!isDefined(handlers[key])) {
                    return;
                }
                if (queue) {
                    queue.add(() => {
                        handlers[key].forEach((handler) => handler(event[key]));
                        queue.done();
                    });
                    return;
                }
                handlers[key].forEach((handler) => handler(event[key]));
            });
        };

        return Object.assign(handle, {on});
    };

    return {deepCopy, assert, isDefined, isNull, isArray, isFunction, isString, isObject, isNode, isBrowser, makeQueue, bus};
};

module.exports = utils;
