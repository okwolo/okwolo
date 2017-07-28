'use strict';

const pathToRegexp = require('path-to-regexp');

const {assert, isString, isObject, isFunction, blobHandler} = require('@okwolo/utils')();

const router = (_window = window) => {
    const isHosted = _window.document.origin !== null && _window.document.origin !== 'null';

    // store all the registered routes
    const pathStore = [];

    // store base url to prepend to all addresses
    let baseUrl = '';

    // track if a path has matched on page load
    let hasMatched = false;

    // removes base url from a path
    let removeBaseUrl = (path) => {
        return path.replace(new RegExp('\^' + baseUrl), '') || '';
    };

    // store initial pathName
    let currentPath = _window.location.pathname;
    if (!isHosted) {
        currentPath = '';
    }

    // add a route/callback combo to the store given as argument
    const register = (store) => (path, callback) => {
        store.push({
            pattern: pathToRegexp(path, [], {strict: true}),
            callback,
        });
    };

    /* call all the callbacks from the store given as argument
        who's route matches path argument*/
    const fetch = (store) => (path, params) => {
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

    // handle back/forward events
    _window.onpopstate = () => {
        currentPath = removeBaseUrl(_window.location.pathname);
        fetch(pathStore)(currentPath, _window.history.state || {});
    };

    // register wrapper that runs the current page's url against new routes
    const addRoute = ({path, callback}) => {
        assert(isString(path), 'router.addRoute : path is not a string', path);
        assert(isFunction(callback), 'router.addRoute : callback is not a function', path, callback);
        register(pathStore)(path, callback);
        // checking new path against current pathname
        if (!hasMatched) {
            const tempStore = [];
            register(tempStore)(path, callback);
            hasMatched = !!fetch(tempStore)(currentPath, _window.history.state || {});
        }
    };

    // fetch wrapper that makes the browser aware of the url change
    const redirect = (path, params = {}) => {
        assert(isString(path), 'router.redirect : path is not a string', path);
        assert(isObject(params), 'router.redirect : params is not an object', params);
        currentPath = path;
        if (isHosted) {
            /* edge doesn't care that the file is local and will allow pushState.
                it also includes "/C:" in the location.pathname, but adds it to
                the path given to pushState. which means it needs to be removed here */
            _window.history.pushState({}, '', (baseUrl + currentPath).replace(/^\/C\:/, ''));
        } else {
            console.log(`@okwolo/router:: path changed to\n>>> ${currentPath}`);
        }
        return fetch(pathStore)(currentPath, params);
    };

    // fetch wrapper which does not change the url
    const show = (path, params = {}) => {
        assert(isString(path), 'router.show : path is not a string', path);
        assert(isObject(params), 'router.show : params is not an object', params);
        return fetch(pathStore)(path, params);
    };

    // replace the base url, adjust the current and try to fetch with the new url
    const replaceBaseUrl = (base) => {
        assert(isString(base), 'router.replaceBaseUrl : base url is not a string', base);
        baseUrl = base;
        currentPath = removeBaseUrl(currentPath);
        fetch(pathStore)(currentPath, _window.history.state || {});
    };

    const use = (blob) => {
        return blobHandler({
            route: addRoute,
            base: replaceBaseUrl,
        }, blob);
    };

    return {redirect, show, use};
};

module.exports = router;
