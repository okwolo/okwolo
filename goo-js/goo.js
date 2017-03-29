(() => {
    // dependencies
    const gooey = require('goo-dom');
    const stateMachine = require('goo-state');

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
        let current = deepCopy(args.state);
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
                watcher(deepCopy(state), type, params);
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

        /**
         * standardises input types or produces error when impossible
         */
        function inputValidation() {
            // make sure controllers is an array of objects with valid properties
            if (controllers === undefined) {
                err('controllers argument is empty');
            } else if (!Array.isArray(controllers)) {
                controllers = [controllers];
            }
            controllers.forEach((controller) => {
                if (!controller.target instanceof Node) {
                    err('target is not a DOM node');
                }
                if (typeof controller.builder !== 'function') {
                    err('builder attribute is not a function');
                }
                if (controller.parsers === undefined) {
                    controller.parsers = [];
                } else if (!Array.isArray(controller.parsers)) {
                    controller.parsers = [controller.parsers];
                }
            });

            // make sure watchers is an array of functions
            if (args.watchers === undefined) {
                args.watchers = [];
            } else if (!Array.isArray(args.watchers)) {
                args.watchers = [args.watchers];
            }
            if (!args.watchers.reduce((a, w) => a && typeof w === 'function', true)) {
                err('one or more watchers is not a function');
            }

            // make sure middleware is an array of functions
            if (args.middleware === undefined) {
                args.middleware = [];
            } else if (!Array.isArray(args.middleware)) {
                args.middleware = [args.middleware];
            }
            if (!args.middleware.reduce((a, w) => a && typeof w === 'function', true)) {
                err('one or more middleware is not a function');
            }

            // make sure actions is an array of objects with valid properties
            if (args.actions === undefined) {
                args.actions = [];
            } else if (!Array.isArray(args.actions)) {
                args.actions = [args.actions];
            }
            args.actions.forEach((currentActionTypes, i) => {
                Object.keys(currentActionTypes).forEach((currentActionType, j) => {
                    if (typeof currentActionTypes[currentActionType] === 'function') {
                        currentActionTypes[currentActionType] = {
                            target: [],
                            do: currentActionTypes[currentActionType],
                        };
                    }
                    if (!Array.isArray(currentActionTypes[currentActionType])) {
                        currentActionTypes[currentActionType] = [currentActionTypes[currentActionType]];
                    }
                    currentActionTypes[currentActionType].forEach((currentAction, k) => {
                        if (currentAction.target === undefined) {
                            currentAction.target = [];
                        } else if (typeof currentAction.target === 'string') {
                            currentAction.target = [currentAction.target];
                        } else if (!Array.isArray(currentAction.target)) {
                            err(`Target of action ${k} of type ${currentActionType} in action types ${i} is not an array`);
                        }
                        if (typeof currentAction.do !== 'function') {
                            err(`Property "do" of action ${k} of type ${currentActionType} in action types ${i} is not a function`);
                        }
                        currentAction.target.forEach((key, l) => {
                            if (typeof key !== 'string' && typeof key !== 'number') {
                                err(`Key at index ${l} of target of action ${k} of type ${currentActionType} in action types ${i} is not valid`);
                            }
                        });
                    });
                });
            });

            // make sure history length is defined
            options.historyLength = options.historyLength || 20;
        }

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
