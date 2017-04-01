let utils = () => {
    // creates a deep copy of a json object
    let jsonCopy = (obj) => {
        return JSON.parse(JSON.stringify(obj));
    };

    // creates a deep copy of an object
    let deepCopy = (obj) => {
        // temporary solution
        return jsonCopy(obj);
    };

    // displays error message
    let err = (message) => {
        throw(new Error(`gooErr:: ${message}`));
    };

    // throw errors when assertion fails
    let assert = (result, message) => {
        if (result === false) {
            err(message || 'assertion has failed');
        }
    };

    // type checks
    let isDefined = (value) => value !== undefined;
    let isArray = (value) => Array.isArray(value);
    let isFunction = (value) => typeof value === 'function';
    let isString =(value) => typeof value === 'string';
    let isNode = (value) => value instanceof Node;

    // wait queue (ex. async actions during blob changes)
    let makeQueue = () => {
        let queue = [];

        let run = () => {
            let func = queue[0];
            if (isDefined(func)) {
                func();
            }
        };

        let add = (func) => {
            assert(isFunction(func));
            queue.push(func);
            if (queue.length === 1) {
                run();
            }
        };

        let done = () => {
            queue.shift();
            run();
        };

        return {} = {add, done};
    };

    // public interface
    return {} = {jsonCopy, deepCopy, err, assert, isDefined, isArray, isFunction, isString, isNode, makeQueue};
};

module.exports = utils();
