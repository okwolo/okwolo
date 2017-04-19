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
        if (typeof obj === 'object') {
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
    const assert = (result, message) => {
        if (!result) {
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
        const returnValues = [];
        Object.keys(blob).forEach((key, i) => {
            returnValues.push([]);
            if (isDefined(blobs[key])) {
                let blobObject = blob[key];
                if (!isArray(blobObject)) {
                    blobObject = [blobObject];
                }
                blobObject.forEach((drop, j) => {
                    if (isDefined(queue)) {
                        queue.add(() => {
                            returnValues[i][j] = blobs[key](drop);
                            queue.done();
                        });
                    } else {
                        returnValues[i][j] = blobs[key](drop);
                    }
                });
            }
        });
        return returnValues;
    };

    // public interface
    return {} = {deepCopy, err, assert, isDefined, isNull, isArray, isFunction, isString, isObject, isNode, makeQueue, blobHandler};
};

module.exports = utils();
