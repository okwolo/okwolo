window.goo = (controllers, args, options = {}) => {
    // input validation
    inputValidation();

    // create DOM controller for each controller and add them to the array of watchers
    controllers.forEach((controller) => {
        args.watchers.unshift(gooey(controller.target, controller.builder, args.state).update);
    });

    // creating object that handles the persistence of state
    const statePersistenceManager = dictTimeMachine(args.state, options);

    // adding undo/redo middlware
    if (!options.disableHistory) {
        args.middleware.push(statePersistenceManager.history);
    }

    // creating state manager
    const stateManager = dict(args.actions, args.middleware, args.watchers, options);

    // replacing the act function to pass state to it
    const statelessAct = stateManager.act;
    stateManager.act = (type, params) => {
        statePersistenceManager.updateCurrent(statelessAct, type, params);
    };

    /**
     * creates an object that acts on a state
     * @param {Array} actionTypes
     * @param {Array} middleware
     * @param {Array} watchers
     * @param {Object} options
     * @return {Object}
     */
    function dict(actionTypes, middleware, watchers, options) {
        /**
         * execute() wrapper that applies middleware and calls watchers
         * @param {Object} state
         * @param {String} type
         * @param {any} params
         * @return {Object}
         */
        function act(state, type, params = {}) {
            // nest middleware
            let funcs = [execute];
            middleware.reverse().forEach((currentMiddleware, index) => {
                funcs[index + 1] = (state, type, params) => {
                    return currentMiddleware(funcs[index], deepCopy(state), type, params);
                };
            });
            let newState = deepCopy(funcs[middleware.length](state, type, params));

            // optional console logging of all actions
            if (options.stateLog === true) {
                console.log('state > %c%s', 'color:#a00;', JSON.stringify(state));
                console.log('%c%s', 'font-size:20px;', `${type} ${JSON.stringify(params)}`);
                console.log('state > %c%s', 'color:#0a0;', JSON.stringify(newState));
            }

            watchers.forEach((watcher) => {
                watcher(deepCopy(newState), type, params);
            });

            return newState;
        }

        /**
         * exectute an action on the state
         * @param {any} state
         * @param {any} type
         * @param {any} params
         * @return {Object}
         */
        function execute(state, type, params) {
            actionTypes.forEach((currentActionTypes) => {
                let action = currentActionTypes[type];
                if (!action) {
                    return;
                }
                action.forEach((currentAction) => {
                    let target = deepCopy(state);
                    if (currentAction.target.length > 0) {
                        let reference = state;
                        currentAction.target.forEach((key, i, a) => {
                            if (target[key] !== undefined) {
                                if (i === a.length - 1) {
                                    reference[key] = currentAction.do(target[key], params);
                                } else {
                                    target = target[key];
                                    reference = reference[key];
                                }
                            } else {
                                err(`target address of action ${type} is invalid: @state.${currentAction.target.join('.')}`);
                            }
                        });
                    } else {
                        state = currentAction.do(target, params);
                    }
                });
            });
            return state;
        }

        return {
            act: act,
        };
    }

    /**
     * state manager functions that adds undo/redo actions
     * @param {Object} initialState
     * @param {Object} options
     * @return {Function}
     */
    function dictTimeMachine(initialState, options) {
        // past, current and future states
        let past = [];
        let current = deepCopy(initialState);
        let future = [];

        /**
         * middleware that artificially adds undo/redo actions
         * @param {Function} callback
         * @param {Object} state
         * @param {String} type
         * @param {Object} params
         * @return {Object}
         */
        function history(callback, state, type, params) {
            if (type === 'UNDO') {
                if (past.length > 0) {
                    future.push(current);
                    return past.pop();
                } else {
                    return current;
                }
            } else if (type === 'REDO') {
                if (future.length > 0) {
                    past.push(current);
                    return future.pop();
                } else {
                    return current;
                }
            } else {
                future = [];
                past.push(current);
                if (past.length > options.historyLength) {
                    past.shift();
                }
                return callback(state, type, params);
            }
        };

        /**
         * updates saved state on change
         * @param {Function} callback
         * @param {String} type
         * @param {Object} params
         * @return {Object}
         */
        function updateCurrent(callback, type, params) {
            current = callback(current, type, params);
            return current;
        }

        return {
            updateCurrent: updateCurrent,
            history: history,
        };
    }

    /**
     * creates a DOM controller with update function
     * @param {Node} target
     * @param {Function} build
     * @param {Object} initialState
     * @return {Object}
     */
    function gooey(target, build, initialState) {
        // storing vdom
        let vdom = {};

        // create vdom
        vdom = render(build(initialState));

        // initial render to DOM
        window.requestAnimationFrame(() => {
            target.innerHTML = '';
            target.appendChild(vdom.DOM);
        });

        /**
         * recursively creates DOM elements from vdom object
         * @param {Obbject} velem
         * @return {Object}
         */
        function render(velem) {
            if (!velem.tagName) {
                if (velem.text === undefined) {
                    err('invalid vdom output: tagName or text property missing');
                }
                velem.DOM = document.createTextNode(velem.text);
                return velem;
            }
            let element = document.createElement(velem.tagName);
            if (velem.attributes) {
                Object.keys(velem.attributes).forEach((attribute) => {
                    element[attribute] = parseAttribute(velem.attributes[attribute]);
                });
            }
            if (velem.style) {
                Object.keys(velem.style).forEach((attribute) => {
                    element.style[attribute] = velem.style[attribute];
                });
            }
            if (velem.children && velem.tagName !== undefined) {
                Object.keys(velem.children).forEach((key) => {
                    velem.children[key] = render(velem.children[key]);
                    element.appendChild(velem.children[key].DOM);
                });
            }
            velem.DOM = element;
            return velem;
        }

        /**
         * parses attribute's value to detect and replace string functions
         * @param {String} attributeValue
         * @return {Function|String}
         */
        function parseAttribute(attributeValue) {
            let actionPattern = String(attributeValue).match(/^\(\s*([^\n]+)\s*,\s*(?:(\{[^]*\})|([^\s]+))\s*\)$/);
            if (actionPattern === null) {
                return attributeValue;
            } else {
                let action = actionPattern[1];
                let param = null;
                try {
                    param = JSON.parse(actionPattern[2]);
                } catch (e) {
                    param = actionPattern[3] || actionPattern[2];
                }
                return function() {
                    stateManager.act(action, param);
                };
            }
        }

        /**
         * update vdom and real DOM to new state
         * @param {Object} newState
         */
        function update(newState) {
            window.requestAnimationFrame(() => _update(vdom, build(newState), {}));
            /**
             * recursive function to update an element according to new state
             * @param {Object} original
             * @param {Object} successor
             * @param {Object} originalParent
             * @param {String} parentIndex
             */
            function _update(original, successor, originalParent, parentIndex) {
                if (original === undefined && successor === undefined) {
                    return;
                }
                if (original === undefined) {
                    // add
                    originalParent.children[parentIndex] = render(successor);
                    originalParent.DOM.appendChild(originalParent.children[parentIndex].DOM);
                } else if (successor === undefined) {
                    // remove
                    originalParent.DOM.removeChild(original.DOM);
                    originalParent.children[parentIndex] = undefined;
                } else {
                    if (original.tagName !== successor.tagName) {
                        // replace
                        let oldDOM = original.DOM;
                        originalParent.children[parentIndex] = render(successor);
                        originalParent.DOM.replaceChild(originalParent.children[parentIndex].DOM, oldDOM);
                    } else {
                        // edit
                        if (original.DOM.nodeType === 3) {
                            if (original.text !== successor.text) {
                                original.DOM.nodeValue = successor.text;
                                original.text = successor.text;
                            }
                        } else {
                            let styleDiff = diff(original.style, successor.style);
                            let attributesDiff = diff(original.attributes, successor.attributes);
                            if (styleDiff.length !== undefined) {
                                original.DOM.style.cssText = null;
                                Object.keys(successor.style).forEach((key) => {
                                    original.style[key] = successor.style[key];
                                    original.DOM.style[key] = successor.style[key];
                                });
                            }
                            if (attributesDiff.length !== undefined) {
                                attributesDiff.forEach((key) => {
                                    original.attributes[key] = successor.attributes[key];
                                    original.DOM[key] = parseAttribute(successor.attributes[key]);
                                });
                            }
                        }
                    }
                    let keys = (Object.keys(original.children || {}).concat(Object.keys(successor.children || {})));
                    let visited = {};
                    keys.forEach((key) => {
                        if (visited[key] === undefined) {
                            visited[key] = true;
                            _update(original.children[key], successor.children[key], original, key);
                        }
                    });
                }
            }
        }

        /**
         * returns boolean for simple types or an array of addresses of all the differences between two objects
         * @param {Object} original
         * @param {Object} successor
         * @param {String} ignore
         * @return {Boolean|Array}
         */
        function diff(original, successor) {
            // get types
            let originalType = Object.prototype.toString.call(original);
            let successorType = Object.prototype.toString.call(successor);
            // reject when different types
            if (originalType !== successorType) {
                return false;
            }
            // functions are never considered equal
            if (originalType === '[object Function]') {
                return false;
            }
            // compare two objects or arrays
            if (originalType === '[object Object]' || originalType === '[object Array]') {
                let keys = Object.keys(original);
                let newKeys = Object.keys(successor);
                // creating union of both arrays of keys
                if (originalType === '[object Array]') {
                    let lengthDifference = newKeys.length - keys.length;
                    if (lengthDifference > 0) {
                        for (let i = lengthDifference; i > 0; --i) {
                            keys.push(newKeys[newKeys.length - i]);
                        }
                    }
                } else {
                    let keysObj = {};
                    keys.forEach((key) => {
                        keysObj[key] = true;
                    });
                    newKeys.forEach((key) => {
                        if (!keysObj[key]) {
                            keys.push(key);
                        }
                    });
                }
                return keys.reduce((accumulator, key) => {
                    let temp = diff(original[key], successor[key]);
                    if (temp !== true) {
                        if (typeof accumulator === 'boolean') {
                            accumulator = [];
                        }
                        if (temp === false) {
                            accumulator.push([key]);
                        } else {
                            temp.forEach((current) => {
                                current.unshift(key);
                                accumulator.push(current);
                            });
                        }
                    }
                    return accumulator;
                }, true);
            }
            // compare primitive types
            return original === successor;
        }

        return {
            update: update,
        };
    }

    /**
     * creates a deep copy of an object
     * @param {Object} obj
     * @return {Object}
     */
    function deepCopy(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

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

    /**
     * displays error message
     * @param {String} message
     */
    function err(message) {
        throw(new Error(`** ${message}`));
    }

    // public interface
    return {
        act: stateManager.act,
    };
};
