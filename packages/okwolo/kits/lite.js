'use strict';

const core = require('../core');
const {isArray, isString, isObject, isFunction, isRegExp} = require('@okwolo/utils')();

// creates a regex pattern from an input path string. all tags are replaced by a
// capture group and special characters are escaped.
const createPattern = (path) => {
    const pattern = path
        // the colon character is not escaped since it is used to denote tags.
        .replace(/([^\w:])/g, '\\$1')
        .replace(/:(\w+)/g, '([^/]*)');
    // adds a condition to ignore the contents of the query string.
    return new RegExp(`^${pattern}(:?\\?.*)?$`);
};

// blob generating function that is expected in the configuration object.
const liteRouter = () => ({
    name: 'okwolo-lite-router',
    // the type of store is not enforced by the okwolo-router module. this means
    // that it will need to be created when the first path is registered. it is
    // also good practice to check the type of this value since a different blob
    // handler might have been using a different technique to write paths to the
    // store before this register handler is added/used.
    register: (store = [], path, callback) => {
        if (!isArray(store)) {
            store = [];
        }
        // the keys are extracted from the path string and stored to properly
        // assign the url's values to the right keys in the params.
        let keys = (path.match(/:\w+/g) || [])
            .map((key) => key.replace(/^:/g, ''));
        store.push({
            keys,
            pattern: createPattern(path),
            callback,
        });
        return store;
    },
    // the store's default value is undefined. this is the value that should
    // be expected before a path is registered by the register handler. there
    // should also be typechecks for the structure of this store for the same
    // reasons as above. this function should also be the one doing the action
    // defined in the route since it's return value is expected to be a boolean.
    fetch: (store = [], path, params = {}) => {
        if (!isArray(store)) {
            return false;
        }
        let found = false;
        store.find((registeredPath) => {
            const isRegisteredPathValid = isObject(registeredPath)
                && isArray(registeredPath.keys)
                && isRegExp(registeredPath.pattern)
                && isFunction(registeredPath.callback);
            if (!isRegisteredPathValid) {
                return;
            }
            let test = registeredPath.pattern.exec(path);
            if (test === null) {
                return;
            }
            // a non null value on the result of executing the query on the path
            // is considered a successful hit.
            found = true;
            // the first element of the result array is the entire matched string.
            // this value is not useful and the following capture group results
            // are more relevant.
            test.shift();
            // the order of the keys and their values in the matched result is the
            // same and their index is now shared. note that there is no protection
            // against param values being overwritten or tags to share the same key.
            registeredPath.keys.forEach((key, i) => {
                if (isString(key)) {
                    params[key] = test[i];
                }
            });
            registeredPath.callback(params);
            return found;
        });
        return found;
    },
});

module.exports = core({
    modules: [
        require('@okwolo/dom'),
        require('@okwolo/router'),
    ],
    blobs: [
        require('@okwolo/dom/blob'),
        liteRouter,
    ],
    options: {
        kit: 'lite',
        browser: true,
        modules: {
            state: false,
            history: false,
            dom: true,
            router: true,
        },
    },
});
