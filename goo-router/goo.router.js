const pathToRegexp = require('path-to-regexp');

const {assert, isString, isObject, isFunction, blobHandler} = require('goo-utils')();

const router = (_window = window) => {
    // store all the registered routes
    const pathStore = [];

    // store base url to prepend to all addresses
    let baseUrl = '';

    // track if a path has matched on page load
    let hasMatched = false;

    let isHosted = _window.document.origin !== null && _window.document.origin !== 'null';

    // removes base url from a path
    let removeBaseUrl = (path) => {
        return path.replace(new RegExp('\^' + baseUrl), '') || '';
    };

    // fallback function
    let fallback = (path) => {
        console.log(`no route was found for\n>>>${path}`);
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
        store.forEach((registeredPath) => {
            if (found) {
                return;
            }
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
        });
        return found;
    };

    // handle back/forward events
    _window.onpopstate = () => {
        currentPath = removeBaseUrl(_window.location.pathname);
        let found = fetch(pathStore)(currentPath, _window.history.state || {});
        if (!found) {
            fallback(currentPath);
        }
    };

    // register wrapper that runs the current page's url against new routes
    const addRoute = ({path, callback}) => {
        assert(isString(path), 'register path is not a string', path);
        assert(isFunction(callback), `callback for path is not a function\n>>>${path}`, callback);
        register(pathStore)(path, callback);
        // checking new path against current pathname
        if (!hasMatched) {
            const temp = [];
            register(temp)(path, callback);
            let found = fetch(temp)(currentPath, _window.history.state || {});
            if (found) {
                hasMatched = true;
            }
        }
    };

    // replace the current fallback function
    const replaceFallback = (callback) => {
        assert(isFunction(callback), 'callback for fallback is not a function', callback);
        fallback = callback;
    };

    // fetch wrapper that makes the browser aware of the url change
    const redirect = (path, params = {}) => {
        assert(isString(path), 'redirect path is not a string', path);
        assert(isObject(params), 'redirect params is not an object', params);
        currentPath = path;
        if (isHosted) {
            /* edge doesn't care that the file is local and will allow pushState.
                it also includes "/C:" in the location.pathname, but adds it to
                the path given to pushState. which means it needs to be removed here */
            _window.history.pushState({}, '', (baseUrl + currentPath).replace(/^\/C\:/, ''));
        } else {
            console.log(`goo-router:: path changed to\n>>>${currentPath}`);
        }
        let found = fetch(pathStore)(currentPath, params);
        if (!found) {
            fallback(path);
        }
    };

    // replace the base url, adjust the current and try to fetch with the new url
    const replaceBaseUrl = (base) => {
        assert(isString(base), 'base url is not a string', base);
        baseUrl = base;
        currentPath = removeBaseUrl(currentPath);
        fetch(pathStore)(currentPath, _window.history.state || {});
    };

    const use = (blob) => {
        return blobHandler({
            route: addRoute,
            base: replaceBaseUrl,
            fallback: replaceFallback,
        }, blob);
    };

    return {redirect, use};
};

module.exports = router;
