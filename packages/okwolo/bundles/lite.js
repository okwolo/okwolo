'use strict';

const core = require('../core');

const createPattern = () => /\w*/gi;

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
