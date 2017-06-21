const utils = () => {
    // type checks
    const isDefined = (value) => value !== undefined;
    const isNull = (value) => value === null;
    const isArray = (value) => Array.isArray(value);
    const isFunction = (value) => typeof value === 'function';
    const isString = (value) => typeof value === 'string';
    const isObject = (value) => (!!value) && (value.constructor === Object);
    const isNode = (value) => !!(value && value.tagName && value.nodeName && value.ownerDocument && value.removeAttribute);

    // creates a deep copy of an object (can only copy basic objects/arrays/primitives)
    const deepCopy = (obj) => {
        if (isArray(obj)) {
            return obj.map((element) => {
                return deepCopy(element);
            });
        }
        if (typeof obj === 'object' && obj) {
            const keys = Object.keys(obj);
            const temp = {};
            keys.forEach((key) => {
                temp[key] = deepCopy(obj[key]);
            });
            return temp;
        }
        return obj;
    };

    // displays error message
    const err = (message) => {
        throw(new Error(`gooErr:: ${message}`));
    };

    // throw errors when assertion fails
    const assert = (result, message, culprit) => {
        const print = (obj) => {
            return JSON.stringify(obj, (key, value) => {
                return (typeof value === 'function')
                    ? value.toString()
                    : value;
            }, 4);
        };
        if (!result) {
            err(message + (culprit?('\n>>>' + print(culprit)):'') || 'assertion has failed');
        }
    };

    // wait queue (ex. async middlware during blob changes)
    const makeQueue = () => {
        const queue = [];
        const run = () => {
            const func = queue[0];
            if (isDefined(func)) {
                func();
            }
        };
        const add = (func) => {
            assert(isFunction(func), '@goo.utils.makeQueue.add : added objects must be a function');
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

    // handle common blob logic
    const blobNames = {};
    const blobHandler = (blobs, blob = {}, queue) => {
        assert(isObject(blob), '@goo.utils.blobHandler : blob is not an object', blob);
        if (isDefined(blob.name)) {
            assert(isString(blob.name), '@goo.utils.blobHandler : a blob name must be a string', blob);
            if (blobNames[blob.name] === true) {
                return null;
            } else {
                blobNames[blob.name] = true;
            }
        }
        return Object.keys(blob).map((key) => {
            let blobObject = blob[key];
            if (!isArray(blobObject)) {
                blobObject = [blobObject];
            }
            if (!isDefined(blobs[key])) {
                return blobObject.map(() => null);
            }
            return blobObject.map((drop) => {
                if (isDefined(queue)) {
                    queue.add(() => {
                        blobs[key](drop);
                        queue.done();
                    });
                    return null;
                } else {
                    return blobs[key](drop);
                }
            });
        });
    };

    // public interface
    return {deepCopy, err, assert, isDefined, isNull, isArray, isFunction, isString, isObject, isNode, makeQueue, blobHandler};
};

module.exports = utils;
