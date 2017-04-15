const {deepCopy, isDefined} = require('../goo-utils/goo.utils');

const reservedParamKey = ':params';
const reservedCallbackKey = ':callback';

const mkdir = () => {
    const temp = {};
    temp[reservedParamKey] = {};
    return temp;
};

const pathStore = mkdir();

const explodePath = (path) => {
    return path
        .replace(/\?[^]*$/g, '')
        .split('/');
};

const register = (path, callback) => {
    const explodedPath = explodePath(path);
    let currentLevel = pathStore;
    explodedPath.forEach((token, i) => {
        if (token[0] === ':') {
            currentLevel[reservedParamKey][token.substring(1)] =
                currentLevel[reservedParamKey][token.substring(1)] || [];
            let defaultObj = mkdir();
            currentLevel[reservedParamKey][token.substring(1)].push(defaultObj);
            currentLevel = defaultObj;
        } else {
            currentLevel[token] = currentLevel[token] || mkdir();
            currentLevel = currentLevel[token];
        }
        if (i === explodedPath.length - 1) {
            currentLevel[reservedCallbackKey] = callback;
        }
    });
};

const fetch = (path, params = {}) => {
    const explodedPath = explodePath(path);
    const explore = (shard, path, params) => {
        path = path.slice();
        params = deepCopy(params);
        if (path.length === 0) {
            if (shard[reservedCallbackKey]) {
                shard[reservedCallbackKey](params);
            }
        } else {
            const next = path.shift();
            if (isDefined(shard[next])) {
                explore(shard[next], path, params);
            }
            Object.keys(shard[reservedParamKey]).forEach((param) => {
                shard[reservedParamKey][param].forEach((p) => {
                    let temp = {};
                    temp[param] = next;
                    explore(p, path, Object.assign(params, temp));
                });
            });
        }
    };
    explore(pathStore, explodedPath, params);
};

let print = (obj) => {
    console.log(JSON.stringify(obj, (key, value) => {
        if (typeof value === 'function') return value.toString();
        else return value;
    }, 4));
};

register('/user/:uid/details/:field', (params) => {
    console.log(params.uid, params.field);
    params.test();
});

fetch('/user/123/details/name?test=asdas&asda=tyre', {
    test: () => {
        console.log('test');
    },
});
