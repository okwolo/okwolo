'use strict';

const core = require('../core');

const createPattern = (path) => {
    const pattern = path
        // escape special characters
        .replace(/([^\w:])/g, '\\$1')
        // replace tags with a matching group
        .replace(/:(\w+)/g, '([^/]*)');
    return new RegExp(`^${pattern}$`);
};

const liteRouter = {
    name: 'okwolo-lite-router',
    register: (store = [], path, callback) => {
        if (!isArray(store)) {
            store = [];
        }
        store.push({
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
            const keys = registeredPath.toString().match(/:\w+/g);
            keys.forEach((key, i) => {
                params[key.name] = test[i];
            });
            registeredPath.callback(params);
            return found;
        });
        return found;
    },
};

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
