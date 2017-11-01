'use strict';

const {assert, isString, isObject, isFunction, makeQueue} = require('../utils')();

module.exports = ({emit, use}, _window) => {
    // will check is the code is being ran from the filesystem or is hosted.
    // this information is used to correctly displaying routes in the former case.
    const isHosted = _window.document.origin !== null && _window.document.origin !== 'null';

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

    let currentPath = _window.location.pathname;
    if (!isHosted) {
        currentPath = '';
    }

    // handle back/forward events
    _window.onpopstate = () => {
        currentPath = removeBaseUrl(_window.location.pathname);
        safeFetch(currentPath);
    };

    use.on('route', ({path, handler} = {}) => {
        assert(isString(path), 'router.use.route : path is not a string', path);
        assert(isFunction(handler), 'router.use.route : handler is not a function', path, handler);
        assert(isFunction(register), 'route.use.route : register is not a function', register);
        store = register(store, path, handler);
        if (!hasMatched) {
            hasMatched = !!safeFetch(currentPath);
        }
    });

    use.on('base', (base) => {
        assert(isString(base), 'router.use.base : base url is not a string', base);
        baseUrl = base;
        currentPath = removeBaseUrl(currentPath);
        safeFetch(currentPath);
    });

    use.on('register', (_register) => {
        assert(isFunction(_register), 'router.use.register : register is not a function', register);
        register = _register;
    });

    use.on('fetch', (_fetch) => {
        assert(isFunction(_fetch), 'router.use.fetch : fetch is not a function', fetch);
        fetch = _fetch;
    });

    // fetch wrapper that makes the browser aware of the url change
    emit.on('redirect', ({path, params = {}} = {}) => {
        assert(isString(path), 'router.redirect : path is not a string', path);
        assert(isObject(params), 'router.redirect : params is not an object', params);
        // queue used so that route handlers that call route handlers behave
        // as expected. (sequentially)
        queue.add(() => {
            currentPath = path;
            if (isHosted) {
                // edge doesn't care that the file is local and will allow pushState.
                // it also includes "/C:" in the location.pathname, but adds it to
                // the path given to pushState. which means it needs to be removed here.
                _window.history.pushState({}, '', (baseUrl + currentPath).replace(/^\/C\:/, ''));
            } else {
                console.log(`@okwolo/router:: path changed to\n>>> ${currentPath}`);
            }
            safeFetch(currentPath, params);
            queue.done();
        });
    });

    // this will act like a redirect, but will not change the browser's url.
    emit.on('show', ({path, params = {}} = {}) => {
        assert(isString(path), 'router.show : path is not a string', path);
        assert(isObject(params), 'router.show : params is not an object', params);
        // queue used so that route handlers that call route handlers behave
        // as expected. (sequentially)
        queue.add(() => {
            safeFetch(path, params);
            queue.done();
        });
    });

    // expose module's features to the app.
    use({api: {
        redirect: (path, params) => emit({redirect: {path, params}}),
        show: (path, params) => emit({show: {path, params}}),
    }});

    // first argument can be a path string to register a route handler
    // or a function to directly use a builder.
    use({primary: (path, builder) => {
        if (isFunction(path)) {
            use({builder: path()});
            return;
        }
        use({route: {
            path,
            handler: (params) => {
                use({builder: builder(params)});
            },
        }});
    }});
};
