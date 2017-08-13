'use strict';

const pathToRegexp = require('path-to-regexp');

const blob = (_window = window) => {
    const store = [];

    const register = (path, callback) => {
        store.push({
            pattern: pathToRegexp(path, [], {strict: true}),
            callback,
        });
    };

    const fetch = (path, params = {}) => {
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
