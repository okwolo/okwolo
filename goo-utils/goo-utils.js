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
            err(message);
        }
    };

    // type checks
    let isDefined = () => value !== undefined;
    let isArray = () => Array.isArray(value);
    let isFunction = () => typeof value === 'function';
    let isString =() => typeof myVar === 'string';
    let isNode = () => value instanceof Node;

    // public interface
    return {
        jsonCopy: jsonCopy,
        deepCopy: deepCopy,
        err: err,
        assert: assert,
        isDefined: isDefined,
        isArray: isArray,
        isFunction: isFunction,
        isString: isString,
        isNode: isNode,
    };
};

module.exports = utils();
