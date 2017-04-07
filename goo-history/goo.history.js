const {deepCopy} = require('../goo-utils/goo.utils');

const history = () => {
    let past = [];
    let current = deepCopy(args.state);
    let future = [];

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
        type: 'UNDO',
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

    updateState = (state, type) => {
        if (type !== 'UNDO' && type !== 'REDO') {
            future = [];
            past.push(current);
            if (past.length > options.historyLength) {
                past.shift();
            }
        }
        current = state;
    };

    return {
        action: [undoAction, redoAction],
        watcher: updateState,
    };
};

module.exports = history;
