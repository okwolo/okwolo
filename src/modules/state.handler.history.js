'use strict';

module.exports = ({emit, use}) => {
    // reference to the initial value is kept in order to be able to check if the
    // state has been changes using triple-equals comparison.
    const initial = {};

    let past = [];
    let current = initial;
    let future = [];

    // used to enforce the maximum number of past states that can be returned to.
    const historyLength = 20;

    // action types which begin with * will not be registered in the history. this
    // can be useful for trivial interactions which should not be replayed.
    const ignorePrefix = '*';

    const undoAction = {
        type: 'UNDO',
        target: [],
        handler: () => {
            // can only undo if there is at least one previous state which
            // isin't the initial one.
            if (past.length > 0 && past[past.length-1] !== initial) {
                future.push(current);
                return past.pop();
            } else {
                return current;
            }
        },
    };

    const redoAction = {
        type: 'REDO',
        target: [],
        handler: () => {
            if (future.length > 0) {
                past.push(current);
                return future.pop();
            } else {
                return current;
            }
        },
    };

    // reset action can be used to wipe history when, for example, an application
    // changes to a different page with a different state structure.
    const resetAction = {
        type: '__RESET__',
        target: [],
        handler: () => {
            past = [];
            future = [];
            return current;
        },
    };

    // this watcher will monitor state changes and update what is stored within
    // this function.
    const updateWatcher = (state, type) => {
        if (type === '__RESET__' || type[0] === ignorePrefix) {
            return;
        }
        if (type !== 'UNDO' && type !== 'REDO') {
            // adding an action to the stack invalidates anything in the "future".
            future = [];
            past.push(current);
            // state history must be kept within the desired maximum length.
            if (past.length > historyLength + 1) {
                past.shift();
            }
        }

        // objects stored into current will be moved to the past/future stacks.
        // it is assumed that the value given to this watcher is a copy of the
        // current state who's reference is not exposed enywhere else.
        current = state;
    };

    // expose undo/redo using helper functions and plug into the state module
    // to monitor the app's state.
    use({
        api: {
            undo: () => emit({act: {type: 'UNDO'}}),
            redo: () => emit({act: {type: 'REDO'}}),
        },
        action: [undoAction, redoAction, resetAction],
        watcher: updateWatcher,
    });
};
