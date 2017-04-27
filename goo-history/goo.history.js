const {deepCopy, isDefined} = require('../goo-utils/goo.utils');

const history = () => {
    let past = [];
    let current = undefined;
    let future = [];

    const historyLength = 20;

    const undoAction = {
        type: 'UNDO',
        target: [],
        handler: (state) => {
            if (past.length > 0) {
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
        handler: (state) => {
            if (future.length > 0) {
                past.push(current);
                return future.pop();
            } else {
                return current;
            }
        },
    };

    const updateState = (state, type) => {
        if (type !== 'UNDO' && type !== 'REDO') {
            future = [];
            past.push(current);
            if (past.length > historyLength) {
                past.shift();
            }
        }
        current = deepCopy(state);
    };

    return {
        action: [undoAction, redoAction],
        watcher: updateState,
    };
};

module.exports = history;
