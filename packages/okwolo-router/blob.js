'use strict';

const pathToRegexp = require('path-to-regexp');

const {assert, isArray} = require('@okwolo/utils')();

const blob = (_window = window) => {
    const register = (store = [], path, callback) => {
        if (!isArray(store)) {
            store = [];
        }
        store.push({
            pattern: pathToRegexp(path, [], {strict: true}),
            callback,
        });
        return store;
    };

    const fetch = (store = [], path, params = {}) => {
        assert(isArray(store), 'router.fetch : store is not an array', store);
        let found = false;
        store.find((registeredPath) => {
            let test = registeredPath.pattern.exec(path);
            if (test === null) {
                return;
            }
            found = true;
            test.shift();
            registeredPath.pattern.keys.forEach((key, i) => {
                params[key.name] = test[i];
            });
            registeredPath.callback(params);
            return found;
        });
        return found;
    };

    return {name: '@okwolo/router', register, fetch};
};

module.exports = blob;
