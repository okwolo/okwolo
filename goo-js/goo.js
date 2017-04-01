(() => {
    // dependencies
    const gooey = require('goo-dom');
    const stateMachine = require('goo-state');
    const utils = require('goo-utils');

    // goo function
    let goo = (controllers, args, options = {}) => {
        // input validation
        inputValidation();

        // create DOM controller for each controller and add them to the array of watchers
        controllers.forEach((controller) => {
            args.watchers.unshift(gooey(controller.target, controller.builder, controller.parsers, args.state, options).update);
        });

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

        // store pending actions
        let actionQueue = [];

        // act on current state with oldest action
        let runQueue = () => {
            let oldestAction = actionQueue[0];
            if (oldestAction) {
                stateManager.act(current, oldestAction.type, oldestAction.params);
            }
        };

        // runs watchers and next actions after an action is performed
        let actionCallback = (state, type, params) => {
            args.watchers.forEach((watcher) => {
                watcher(utils.deepCopy(state), type, params);
            });
            actionQueue.shift();
            runQueue();
        };

        // creating the state manager
        let stateManager = stateMachine(args.actions, args.middleware, options, actionCallback);

        // adds an action to the queue
        let act = (type, params) => {
            actionQueue.push({
                type: type,
                params: params,
            });
            if (actionQueue.length === 1) {
                runQueue();
            }
        };

        // public interface
        return {
            act: act,
        };
    };

    // making goo function available as an import or in the global window object
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = goo;
    } else {
        window.goo = goo;
    }
})();
