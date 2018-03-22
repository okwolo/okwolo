'use strict';

// @fires blob.register [router]

// this is the same library that is used by express to match routes.
const pathToRegexp = require('path-to-regexp');

const {is} = require('../utils');

module.exports = ({send}) => {
    // the type of store is not enforced by the okwolo-router module. this means
    // that it needs to be created when the first path is registered.
    const register = (store = [], path, handler) => {
        if (path === '**') {
            store.push({
                keys: [],
                pattern: /.*/g,
                handler,
            });
            return store;
        }

        if (is.regExp(path)) {
            let numGroups = new RegExp(path.toString() + '|').exec('').length - 1;
            store.push({
                keys: Array(numGroups).fill(0).map((_, i) => ({name: i})),
                pattern: path,
                handler,
            });
            return store;
        }

        const keys = [];
        store.push({
            keys,
            pattern: pathToRegexp(path, keys, {strict: true}),
            handler,
        });
        return store;
    };

    send('blob.register', register);
};
