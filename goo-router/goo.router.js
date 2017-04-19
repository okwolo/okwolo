const {deepCopy, assert, isDefined, isString, isObject, isFunction, blobHandler} = require('../goo-utils/goo.utils');

const paramKey = ':params';
const callbackKey = ':callback';

// creates blank single-level route object
const mkdir = () => {
    const temp = {};
    temp[paramKey] = {};
    return temp;
};

// splits url path into array
const explodePath = (path) => {
    return path
        .replace(/\?[^]*$/g, '')
        .split('/');
};

const router = (_window = window) => {
    // store all the registered routes in an encoded format
    const pathStore = mkdir();

    // add a route/callback combo to the store given as argument
    const register = (store) => (path, callback) => {
        const explodedPath = explodePath(path);
        let currentLevel = store;
        explodedPath.forEach((token, i) => {
            if (token[0] === ':') {
                currentLevel[paramKey][token.substring(1)] =
                    currentLevel[paramKey][token.substring(1)] || [];
                let defaultObj = mkdir();
                currentLevel[paramKey][token.substring(1)].push(defaultObj);
                currentLevel = defaultObj;
            } else {
                currentLevel[token] = currentLevel[token] || mkdir();
                currentLevel = currentLevel[token];
            }
            if (i === explodedPath.length - 1) {
                currentLevel[callbackKey] = callback;
            }
        });
    };

    /* call all the callbacks from the store given as argument
        who's route matches path argument*/
    const fetch = (store) => (path, params) => {
        const explodedPath = explodePath(path);
        const explore = (fragment, path, params) => {
            path = path.slice();
            params = deepCopy(params);
            if (path.length === 0) {
                if (fragment[callbackKey]) {
                    fragment[callbackKey](params);
                }
            } else {
                const next = path.shift();
                if (isDefined(fragment[next])) {
                    explore(fragment[next], path, params);
                }
                Object.keys(fragment[paramKey]).forEach((param) => {
                    fragment[paramKey][param].forEach((p) => {
                        let temp = {};
                        temp[param] = next;
                        explore(p, path, Object.assign(params, temp));
                    });
                });
            }
        };
        explore(store, explodedPath, params);
    };

    // register wrapper that runs the current page's url against new routes
    const addRoute = ({path, callback}) => {
        assert(isString(path), `register path is not a string\n${path}`);
        assert(isFunction(callback), `callback for path ${path} is not a function\n${callback}`);
        register(pathStore)(path, callback);
        // chacking new path against current pathname
        const temp = mkdir();
        register(temp)(path, callback);
        fetch(temp)(_window.location.pathname, _window.history.state || {});
    };

    // fetch wrapper that makes the browser aware of the url change
    const redirect = (path, params = {}) => {
        assert(isString(path), `redirect path is not a string\n${path}`);
        assert(isObject(params), `redirect params is not an object\n${params}`);
        _window.history.pushState({}, '', path);
        fetch(pathStore)(path, params);
    };

    const use = (blob) => {
        blobHandler({
            route: addRoute,
        }, blob);
    };

    return {} = {redirect, use};
};

module.exports = router;
