'use strict';

// @fires blob.register [router]

// this is the same library that is used in by express to match routes.
const pathToRegexp = require('path-to-regexp');

module.exports = ({send}) => {
    // the type of store is not enforced by the okwolo-router module. this means
    // that it needs to be created when the first path is registered.
    const register = (store = [], path, handler) => {
        const keys = [];
        let pattern;
        if (path === '**') {
            pattern = /.*/g;
        } else {
            pattern = pathToRegexp(path, keys, {strict: true});
        }
        store.push({
            pattern,
            keys,
            handler,
        });
        return store;
    };

    send('blob.register', register);
};
