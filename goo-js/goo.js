(() => {
    // dependencies
    const gooey = require('goo-dom');
    const stateMachine = require('goo-state');
    const utils = require('goo-utils');

    // goo function
    let goo = (controllers, args, options = {}) => {
        // past, current and future states
        let past = [];
        let current = utils.deepCopy(args.state);
        let future = [];

        // add undo/redo actions
        if (!options.disableHistory) {
            args.actions.push({
                UNDO: [{
                    target: [],
                    do: (state) => {
                        if (past.length > 0) {
                            future.push(current);
                            return past.pop();
                        } else {
                            return current;
                        }
                    },
                }],
                REDO: [{
                    target: [],
                    do: (state) => {
                        if (future.length > 0) {
                            past.push(current);
                            return future.pop();
                        } else {
                            return current;
                        }
                    },
                }],
            });
        }

        // update state on each action
        args.watchers.unshift((state, type) => {
            if (type !== 'UNDO' && type !== 'REDO') {
                future = [];
                past.push(current);
                if (past.length > options.historyLength) {
                    past.shift();
                }
            }
            current = state;
        });
    };

    // making goo function available as an import or in the global window object
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = goo;
    } else {
        window.goo = goo;
    }
})();
