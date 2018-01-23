'use strict';

// @fires blob.register [router]

const keyPattern = /:\w+/g;

// creates a regex pattern from an input path string. all tags are replaced by a
// capture group and special characters are escaped.
const createPattern = (path) => {
    const pattern = path
        // the colon character is not escaped since it is used to denote tags.
        .replace(/([^\w:])/g, '\\$1')
        .replace(keyPattern, '([^/]*)');
    // adds a condition to ignore the contents of the query string.
    return new RegExp(`^${pattern}(:?\\?.*)?$`);
};

module.exports = ({send}) => {
    // the type of store is not enforced by the router module. this means
    // that it needs to be created when the first path is registered.
    const register = (store = [], path, handler) => {
        // the keys are extracted from the path string and stored to properly
        // assign the url's values to the right keys in the params.
        const keys = (path.match(keyPattern) || [])
            .map((key) => ({
                name: key.replace(/^:/g, ''),
            }));
        let pattern;
        // exception for catch-all syntax
        if (path === '**') {
            pattern = /.*/g;
        } else {
            pattern = createPattern(path);
        }
        store.push({
            keys,
            pattern,
            handler,
        });
        return store;
    };

    send('blob.register', register);
};
