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

    // public interface
    return {
        jsonCopy: jsonCopy,
        deepCopy: deepCopy,
        err: err,
    };
};

module.exports = utils();
