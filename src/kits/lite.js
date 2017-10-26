'use strict';

const core = require('okwolo/src/core');

const {isFunction, deepCopy} = require('okwolo/src/utils')();

// creates a regex pattern from an input path string. all tags are replaced by a
// capture group and special characters are escaped.
const createPattern = (path) => {
    const pattern = path
        // the colon character is not escaped since it is used to denote tags.
        .replace(/([^\w:])/g, '\\$1')
        .replace(/:(\w+)/g, '([^/]*)');
    // adds a condition to ignore the contents of the query string.
    return new RegExp(`^${pattern}(:?\\?.*)?$`);
};

// blob generating function that is expected in the configuration object.
const liteBlob = ({use, emit}) => {
    // reference to initial state is kept to be able to track whether it
    // has changed using strict equality.
    const inital = {};
    let state = inital;

    const setState = (replacement) => {
        state = isFunction(replacement)
            ? replacement(deepCopy(state))
            : replacement;
        emit({state});
    };

    const getState = () => {
        assert(state !== initial, 'getState : cannot get state before it has been set');
        return deepCopy(state);
    };

    // the type of store is not enforced by the okwolo-router module. this means
    // that it needs to be created when the first path is registered.
    const register = (store = [], path, handler) => {
        // the keys are extracted from the path string and stored to properly
        // assign the url's values to the right keys in the params.
        let keys = (path.match(/:\w+/g) || [])
            .map((key) => ({
                name: key.replace(/^:/g, '')
            }));
        store.push({
            keys,
            pattern: createPattern(path),
            handler,
        });
        return store;
    };

    use({
        register,
        api: {
            setState,
            getState,
        },
    });
};

module.exports = core({
    modules: [
        require('okwolo/src/modules/view'),
        require('okwolo/src/modules/view.dom'),
        require('okwolo/src/modules/router'),
        require('okwolo/src/modules/router.fetch'),
        liteBlob,
    ],
    options: {
        kit: 'lite',
        browser: true,
    },
});
