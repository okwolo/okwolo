'use strict';

// @fires   redirect     [router]
// @fires   show         [router]
// @fires   blob.api     [core]
// @listens redirect
// @listens show
// @listens blob.base
// @listens blob.fetch
// @listens blob.register
// @listens blob.route

const {assert, is, makeQueue} = require('../utils');

module.exports = ({on, send}, global) => {
    // keeps track of all the registered routes. the format/type of this variable
    // is not enforced by this module and it is left to the register and fetch
    // functions to validate the values.
    let store;

    let baseUrl = '';
    let register;
    let fetch;

    // if the router has not yet found a match, every new path might be the
    // the current location and needs to be checked. however, after this initial
    // match, any new routes do not need to be verified against the current url.
    let hasMatched = false;

    let currentPath = global.location.pathname;

    // will check if the code is being ran from the filesystem or is hosted.
    // this information is used to correctly displaying routes in the former case.
    const isHosted = global.window.origin !== null && global.window.origin !== 'null';
    if (!isHosted) {
        currentPath = '';
    }

    const queue = makeQueue();

    let removeBaseUrl = (path) => {
        // base url is only removed if it is at the start of the path string.
        // characters that may cause unintended behavior are escaped when
        // converting from a string to a regular expression.
        const escapedBaseUrl = baseUrl.replace(/([^\w])/g, '\\$1');
        return path.replace(new RegExp('\^' + escapedBaseUrl), '') || '';
    };

    // react to browser's back/forward events.
    global.onpopstate = () => {
        queue.add(() => {
            currentPath = removeBaseUrl(global.location.pathname);
            fetch(store, currentPath);
            queue.done();
        });
    };

    on('blob.route', ({path, handler} = {}) => {
        assert(is.string(path) || is.regExp(path), 'on.blob.route : path is not a string or a regular expression', path);
        assert(is.function(handler), 'on.blob.route : handler is not a function', path, handler);
        assert(is.function(register), 'on.blob.route : register is not a function', register);
        queue.add(() => {
            store = register(store, path, handler);
            if (!hasMatched) {
                hasMatched = !!fetch(store, currentPath);
            }
            queue.done();
        });
    });

    on('blob.base', (base) => {
        assert(is.string(base), 'on.blob.base : base url is not a string', base);
        queue.add(() => {
            baseUrl = base;
            currentPath = removeBaseUrl(currentPath);
            fetch(store, currentPath);
            queue.done();
        });
    });

    on('blob.register', (_register) => {
        assert(is.function(_register), 'on.blob.register : register is not a function', register);
        queue.add(() => {
            register = _register;
            queue.done();
        });
    });

    on('blob.fetch', (_fetch) => {
        assert(is.function(_fetch), 'on.blob.fetch : fetch is not a function', fetch);
        queue.add(() => {
            fetch = _fetch;
            queue.done();
        });
    });

    // fetch wrapper that makes the browser aware of the url change
    on('redirect', (path, params = {}) => {
        assert(is.string(path), 'on.redirect : path is not a string', path);
        assert(is.object(params), 'on.redirect : params is not an object', params);
        // queue used so that route handlers that call other route handlers
        // behave as expected. (sequentially)
        queue.add(() => {
            currentPath = path;
            if (isHosted) {
                // edge doesn't care that the file is local and will allow pushState.
                // it also includes "/C:" in the location.pathname, but adds it to
                // the path given to pushState. which means it needs to be removed here.
                global.history.pushState({}, '', (baseUrl + currentPath).replace(/^\/C\:/, ''));
            } else {
                console.log(`@okwolo : path changed to\n>>> ${currentPath}`);
            }
            fetch(store, currentPath, params);
            queue.done();
        });
    });

    // show acts like a redirect, but will not change the browser's url.
    on('show', (path, params = {}) => {
        assert(is.string(path), 'on.show : path is not a string', path);
        assert(is.object(params), 'on.show : params is not an object', params);
        // queue used so that route handlers that call other route handlers
        // behave as expected. (sequentially)
        queue.add(() => {
            fetch(store, path, params);
            queue.done();
        });
    });

    // expose module's features to the app.
    send('blob.api', {
        redirect: (path, params) => send('redirect', path, params),
        show: (path, params) => send('show', path, params),
    });
};
