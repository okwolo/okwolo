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
        throw(new Error(`** ${message}`));
    };

    let checkThat = (value) => {
        let isDefined = () => value !== undefined;

        let isArray = () => Array.isArray(value);

        let isFunction = () => typeof value === 'function';

        let isNode = () => value instanceof Node;

        return {
            isDefined: isDefined,
            isArray: isArray,
            isFunction: isFunction,
            isNode: isNode,
        };
    };

    // public interface
    return {
        jsonCopy: jsonCopy,
        deepCopy: deepCopy,
        err: err,
        checkThat: checkThat,
    };
};

module.exports = utils();
