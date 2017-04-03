const utils = () => {
    // type checks
    const isDefined = (value) => value !== undefined;
    const isArray = (value) => Array.isArray(value);
    const isFunction = (value) => typeof value === 'function';
    const isString =(value) => typeof value === 'string';
    const isNode = (value) => value instanceof Node;

    // creates a deep copy of a json object
    const jsonCopy = (obj) => {
        obj = JSON.stringify(obj);
        if (!isDefined(obj)) {
            return {};
        }
        return JSON.parse(obj);
    };

    // creates a deep copy of an object
    const deepCopy = (obj) => {
        // temporary solution
        return jsonCopy(obj);
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
    const blobHandler = (blobs, blob) => {
        Object.keys(blob).forEach((key) => {
            if (isDefined(blobs[key])) {
                let blobObject = blob[key];
                if (!isArray(blobObject)) {
                    blobObject = [blobObject];
                }
                blobObject.forEach((element) => {
                    queue.add(() => {
                        blobs[key](element);
                    });
                });
            }
        });
    };

    // public interface
    return {} = {jsonCopy, deepCopy, err, assert, isDefined, isArray, isFunction, isString, isNode, makeQueue, blobHandler};
};

module.exports = utils();
