const {deepCopy, assert, isDefined, isString, isObject, blobHandler} = require('../goo-utils/goo.utils');

const paramKey = ':params';
const callbackKey = ':callback';

const mkdir = () => {
    const temp = {};
    temp[paramKey] = {};
    return temp;
};

const explodePath = (path) => {
    return path
        .replace(/\?[^]*$/g, '')
        .split('/');
};

let print = (obj) => {
    console.log(JSON.stringify(obj, (key, value) => {
        if (typeof value === 'function') return value.toString();
        else return value;
    }, 4));
};

const router = (_window = window) => {
    const pathStore = mkdir();

    const register = ({path, callback}) => {
        assert(isString(path), `register path is not a string\n${path}`);
        assert(isFunction(callback), `callback for path ${path} is not a function\n${callback}`);
        const explodedPath = explodePath(path);
        let currentLevel = pathStore;
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

    const fetch = (path, params) => {
        assert(isObject(params), `redirect params is not an object\n${params}`);
        const explodedPath = explodePath(path);
        const explore = (shard, path, params) => {
            path = path.slice();
            params = deepCopy(params);
            if (path.length === 0) {
                if (shard[callbackKey]) {
                    shard[callbackKey](params);
                }
            } else {
                const next = path.shift();
                if (isDefined(shard[next])) {
                    explore(shard[next], path, params);
                }
                Object.keys(shard[paramKey]).forEach((param) => {
                    shard[paramKey][param].forEach((p) => {
                        let temp = {};
                        temp[param] = next;
                        explore(p, path, Object.assign(params, temp));
                    });
                });
            }
        };
        explore(pathStore, explodedPath, params);
    };

    const redirect = (path, params = {}) => {
        assert(isString(path), `redirect path is not a string\n${path}`);
        _window.history.pushState({}, '', path);
        fetch(path, params);
    };

    const use = (blob) => {
        blobHandler({
            route: register,
        }, blob);
    };

    return {} = {redirect, use};
};

module.exports = router;

const testRouter = router();
testRouter.use({
    route: {
        path: '/test/:param',
        callback: (x) => {
            print(x);
        },
    },
});
testRouter.fetch('/test/potato');