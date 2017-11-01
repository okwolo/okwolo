'use strict';

const {assert, deepCopy, isFunction} = require('../utils')();

module.exports = ({emit, use}) => {
    // reference to initial state is kept to be able to track whether it
    // has changed using strict equality.
    const initial = {};
    let state = initial;

    let handler;

    use.on('handler', (_handler) => {
        assert(isFunction(_handler), 'state.use.handler : handler is not a function', handler);
        handler = _handler;
    });

    // current state is monitored and stored.
    emit.on('state', (newState) => {
        state = newState;
    });

    emit.on('read', (callback) => {
        callback(state);
    });

    use({handler: (newState) => {
        emit({state: newState});
    }});

    const setState = (replacement) => {
        const newState = isFunction(replacement)
            ? replacement(deepCopy(state))
            : replacement;
        handler(newState);
    };

    const getState = () => {
        assert(state !== initial, 'state.getState : cannot get state before it has been set');
        return deepCopy(state);
    };

    // expose module's features to the app.
    use({api: {
        setState,
        getState,
    }});
};
