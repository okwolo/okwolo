'use strict';

const core = require('../core');
const {isArray} = require('@okwolo/utils')();

const createPattern = (path) => {
    const pattern = path
        // escape special characters
        .replace(/([^\w:])/g, '\\$1')
        // replace tags with a matching group
        .replace(/:(\w+)/g, '([^/]*)');
    return new RegExp(`^${pattern}(\\?.*)?$`);
};

const liteRouter = () => ({
    name: 'okwolo-lite-router',
    register: (store = [], path, callback) => {
        if (!isArray(store)) {
            store = [];
        }
        store.push({
            string: path,
            pattern: createPattern(path),
            callback,
        });
        return store;
    },
    fetch: (store = [], path, params = {}) => {
        let found = false;
        store.find((registeredPath) => {
            let test = registeredPath.pattern.exec(path);
            if (test === null) {
                return;
            }
            found = true;
            test.shift();
            const keys = registeredPath.string.match(/:\w+/g);
            if (isArray(keys)) {
                keys.forEach((key, i) => {
                    params[key.replace(/^:/, '')] = test[i];
                });
            }
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
        bundle: 'lite',
        browser: true,
        modules: {
            state: false,
            history: false,
            dom: true,
            router: true,
        },
    },
});
