'use strict';

// @fires   state        [state]
// @fires   blob.api     [core]
// @fires   blob.handler [state]
// @listens state
// @listens blob.handler

const {assert, deepCopy, is} = require('../utils');

module.exports = ({on, send}) => {
    // reference to initial state is kept to be able to track whether it
    // has changed using strict equality.
    const initial = {};
    let state = initial;

    let handler;

    // current state is monitored and stored.
    on('state', (newState) => {
        state = newState;
    });

    on('blob.handler', (handlerGen) => {
        assert(is.function(handlerGen), 'on.blob.handler : handler generator is not a function', handlerGen);
        // handler generator is given direct access to the state.
        const _handler = handlerGen(() => state);
        assert(is.function(_handler), 'on.blob.handler : handler from generator is not a function', _handler);
        handler = _handler;
    });

    send('blob.handler', () => (newState) => {
        send('state', newState);
    });

    const setState = (replacement) => {
        const newState = is.function(replacement)
            ? replacement(deepCopy(state))
            : replacement;
        handler(newState);
    };

    const getState = () => {
        assert(state !== initial, 'state.getState : cannot get state before it has been set');
        return deepCopy(state);
    };

    // expose module's features to the app.
    send('blob.api', {
        setState,
        getState,
    });
};
