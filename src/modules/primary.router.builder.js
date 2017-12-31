'use strict';

// @fires   blob.primary [core]
// @fires   blob.route   [router]
// @fires   blob.builder [view]

const {
    isFunction,
} = require('../utils');

module.exports = ({on, send}) => {
    // first argument can be a path string to register a route handler
    // or a function to directly use a builder.
    send('blob.primary', (path, builder) => {
        if (isFunction(path)) {
            send('blob.builder', path());
            return;
        }
        send('blob.route', {
            path,
            handler: (params) => {
                send('blob.builder', builder(params));
            },
        });
    });
};
