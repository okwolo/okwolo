'use strict';

const {deepCopy} = require('goo-utils')();

const history = () => {
    let past = [];
    let current = {__unset__: true};
    let future = [];

    const historyLength = 20;
    const ignorePrefix = '*';

    const undoAction = {
        type: 'UNDO',
        target: [],
        handler: () => {
            if (past.length > 0 && (!past[past.length-1] || past[past.length-1].__unset__ !== true)) {
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

    const resetAction = {
        type: '__RESET__',
        target: [],
        handler: () => {
            past = [];
            future = [];
            return current;
        },
    };

    const updateState = (state, type) => {
        if (type === '__RESET__' || type[0] === ignorePrefix) {
            return;
        }
        if (type !== 'UNDO' && type !== 'REDO') {
            future = [];
            past.push(current);
            if (past.length > historyLength + 1) {
                past.shift();
            }
        }
        current = deepCopy(state);
    };

    return {
        action: [undoAction, redoAction, resetAction],
        watcher: updateState,
    };
};

module.exports = history;
