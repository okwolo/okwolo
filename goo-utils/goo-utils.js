module.exports = () => {
    // creates a deep copy of an object
    let deepCopy = (obj) => {
        return JSON.parse(JSON.stringify(obj));
    };

    // displays error message
    let err = (message) => {
        throw(new Error(`** ${message}`));
    };

    // public interface
    return {
        deepCopy: deepCopy,
        err: err,
    };
};
