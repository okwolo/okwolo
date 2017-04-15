const {deepCopy, isDefined} = require('../goo-utils/goo.utils');

const mkdir = () => ({':params': {}});

const pathStore = mkdir();

const explodePath = (path) => {
    return path
        .replace(/\?[^]*$/g, '')
        .replace(/^\/|\/$/g, '')
        .split('/');
};

const register = (path, callback) => {
    const explodedPath = explodePath(path);
    let currentLevel = pathStore;
    explodedPath.forEach((token, i) => {
        if (token[0] === ':') {
            currentLevel[':params'][token.substring(1)] =
                currentLevel[':params'][token.substring(1)] || [];
            let defaultObj = mkdir();
            currentLevel[':params'][token.substring(1)].push(defaultObj);
            currentLevel = defaultObj;
        } else {
            currentLevel[token] = currentLevel[token] || mkdir();
            currentLevel = currentLevel[token];
        }
        if (i === explodedPath.length - 1) {
            currentLevel[':callback'] = callback;
        }
    });
};

const fetch = (path, params = {}) => {
    const explodedPath = explodePath(path);
    const explore = (shard, path, params) => {
        path = path.slice();
        params = deepCopy(params);
        if (path.length === 0) {
            if (shard[':callback']) {
                shard[':callback'](params);
            }
        } else {
            const next = path.shift();
            if (isDefined(shard[next])) {
                explore(shard[next], path, params);
            }
            Object.keys(shard[':params']).forEach((param) => {
                shard[':params'][param].forEach((p) => {
                    let temp = {};
                    temp[param] = next;
                    explore(p, path, Object.assign(params, temp));
                });
            });
        }
    };
    explore(pathStore, explodedPath, params);
};

register('/user/:uid/details/:field', (params) => {
    console.log(params.uid, params.field);
    params.test();
});

fetch('/user/user/details/name?test=asdas&asda=tyre', {
    test: () => {
        console.log('test');
    },
});
