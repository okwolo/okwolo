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

const {
    assert,
    isFunction,
    isObject,
    isString,
    makeQueue,
} = require('../utils');

module.exports = ({on, send}, global) => {
    // will check is the code is being ran from the filesystem or is hosted.
    // this information is used to correctly displaying routes in the former case.
    const isHosted = global.document.origin !== null && global.document.origin !== 'null';

    let baseUrl = '';

    // keeps track of all the registered routes. the format/type of this variable
    // is not enforced by this module and it is left to the regisiter and fetch
    // to validate the values.
    let store;

    let register;
    let fetch;

    // if the router has not yet found a match, every new path might be the
    // the current location and needs to be called. however, after this initial
    // match, any new routes do not need to be verified against the current url.
    let hasMatched = false;

    const queue = makeQueue();

    const safeFetch = (...args) => {
        assert(isFunction(fetch), 'router : fetch is not a function', fetch);
        fetch(store, ...args);
    };

    let removeBaseUrl = (path) => {
        // escapes characters that may cause unintended behavior when converted
        // from a string to a regular expression.
        const escapedBaseUrl = baseUrl.replace(/([^\w])/g, '\\$1');
        return path.replace(new RegExp('\^' + escapedBaseUrl), '') || '';
    };

    let currentPath = global.location.pathname;
    if (!isHosted) {
        currentPath = '';
    }

    // handle back/forward events
    global.onpopstate = () => {
        queue.add(() => {
            currentPath = removeBaseUrl(global.location.pathname);
            safeFetch(currentPath);
            queue.done();
        });
    };

    on('blob.route', ({path, handler} = {}) => {
        assert(isString(path), 'on.blob.route : path is not a string', path);
        assert(isFunction(handler), 'on.blob.route : handler is not a function', path, handler);
        assert(isFunction(register), 'on.blob.route : register is not a function', register);
        queue.add(() => {
            store = register(store, path, handler);
            if (!hasMatched) {
                hasMatched = !!safeFetch(currentPath);
            }
            queue.done();
        });
    });

    on('blob.base', (base) => {
        assert(isString(base), 'on.blob.base : base url is not a string', base);
        queue.add(() => {
            baseUrl = base;
            currentPath = removeBaseUrl(currentPath);
            safeFetch(currentPath);
            queue.done();
        });
    });

    on('blob.register', (_register) => {
        assert(isFunction(_register), 'on.blob.register : register is not a function', register);
        queue.add(() => {
            register = _register;
            queue.done();
        });
    });

    on('blob.fetch', (_fetch) => {
        assert(isFunction(_fetch), 'on.blob.fetch : fetch is not a function', fetch);
        queue.add(() => {
            fetch = _fetch;
            queue.done();
        });
    });

    // fetch wrapper that makes the browser aware of the url change
    on('redirect', (path, params = {}) => {
        assert(isString(path), 'on.redirect : path is not a string', path);
        assert(isObject(params), 'on.redirect : params is not an object', params);
        // queue used so that route handlers that call route handlers behave
        // as expected. (sequentially)
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
            safeFetch(currentPath, params);
            queue.done();
        });
    });

    // show acts like a redirect, but will not change the browser's url.
    on('show', (path, params = {}) => {
        assert(isString(path), 'on.show : path is not a string', path);
        assert(isObject(params), 'on.show : params is not an object', params);
        // queue used so that route handlers that call route handlers behave
        // as expected. (sequentially)
        queue.add(() => {
            safeFetch(path, params);
            queue.done();
        });
    });

    // expose module's features to the app.
    send('blob.api', {
        redirect: (path, params) => send('redirect', path, params),
        show: (path, params) => send('show', path, params),
    });
};
