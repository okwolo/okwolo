'use strict';

const core = require('okwolo/src/core');

const {isFunction, deepCopy} = require('okwolo/src/utils')();

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

    use({
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
        require('okwolo/src/modules/router.register.lite'),
        liteBlob,
    ],
    options: {
        kit: 'lite',
        browser: true,
    },
});
