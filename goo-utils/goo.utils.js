const utils = () => {
    // type checks
    const isDefined = (value) => value !== undefined;
    const isArray = (value) => Array.isArray(value);
    const isFunction = (value) => typeof value === 'function';
    const isString =(value) => typeof value === 'string';
    const isNode = (value) => value instanceof Node;

    // creates a deep copy of an object (can only copy basic objects/arrays/primitives)
    const deepCopy = function(obj) {
        if (isArray(obj)) {
            return obj.map(function(element) {
                return deepCopy(element);
            });
        }
        if (typeof obj === 'object') {
            const keys = Object.keys(obj);
            const temp = {};
            keys.forEach(function(key) {
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
    const assert = (result, message) => {
        if (result === false) {
            err(message || 'assertion has failed');
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
            assert(isFunction(func));
            queue.push(func);
            if (queue.length === 1) {
                run();
            }
        };
        const done = () => {
            queue.shift();
            run();
        };
        return {} = {add, done};
    };

    // handle common blob logic
    const blobHandler = (blobs, blob, queue) => {
        Object.keys(blob).forEach((key) => {
            if (isDefined(blobs[key])) {
                let blobObject = blob[key];
                if (!isArray(blobObject)) {
                    blobObject = [blobObject];
                }
                blobObject.forEach((drop) => {
                    if (isDefined(queue)) {
                        queue.add(() => {
                            blobs[key](drop);
                            queue.done();
                        });
                    } else {
                        blobs[key](drop);
                    }
                });
            }
        });
    };

    // public interface
    return {} = {deepCopy, err, assert, isDefined, isArray, isFunction, isString, isNode, makeQueue, blobHandler};
};

module.exports = utils();
