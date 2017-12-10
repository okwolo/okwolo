'use strict';

// @fires   emit #state   [state]
// @fires   use  #api     [core]
// @fires   use  #handler [state]
// @listens emit #state
// @listens use  #handler

const {assert, deepCopy, isFunction} = require('../utils')();

module.exports = ({emit, use}) => {
    // reference to initial state is kept to be able to track whether it
    // has changed using strict equality.
    const initial = {};
    let state = initial;

    let handler;

    // current state is monitored and stored.
    emit.on('state', (newState) => {
        state = newState;
    });

    use.on('handler', (handlerGen) => {
        assert(isFunction(handlerGen), 'state.use.handler : handler generator is not a function', handlerGen);
        // handler generator is given direct access to the state.
        const _handler = handlerGen(() => state);
        assert(isFunction(_handler), 'state.use.handler : handler from generator is not a function', _handler);
        handler = _handler;
    });

    use({handler: () => (newState) => {
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
