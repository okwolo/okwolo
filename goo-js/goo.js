(() => {
    // creates a deep copy of an object
    let deepCopy = (obj) => {
        return JSON.parse(JSON.stringify(obj));
    };

    // displays error message
    let err = (message) => {
        throw(new Error(`** ${message}`));
    };

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
         * creates an object that acts on a state
         * @param {Array} actionTypes
         * @param {Array} middleware
         * @param {Object} options
         * @param {Function} callback
         * @return {Object}
         */
        function stateMachine(actionTypes, middleware, options, callback) {
            /**
             * execute() wrapper that applies middleware
             * @param {Object} state
             * @param {String} type
             * @param {any} params
             */
            function act(state, type, params = {}) {
                // nest middleware
                let funcs = [(_state, _type = type, _params = params) => {
                    type = _type;
                    params = _params;
                    execute(_state, _type, _params);
                }];
                middleware.reverse().forEach((currentMiddleware, index) => {
                    funcs[index + 1] = (_state, _type = type, _params = params) => {
                        type = _type;
                        params = _params;
                        currentMiddleware(funcs[index], deepCopy(_state), _type, _params, options);
                    };
                });
                funcs[middleware.length](deepCopy(state), type, params);
            }

            /**
             * exectute an action on the state
             * @param {any} state
             * @param {any} type
             * @param {any} params
             */
            function execute(state, type, params) {
                let newState = deepCopy(state);
                let actionTypeNotFound = actionTypes.length;
                actionTypes.forEach((currentActionTypes) => {
                    let action = currentActionTypes[type];
                    if (!action) {
                        --actionTypeNotFound;
                        if (actionTypeNotFound === 0) {
                            err(`action type '${type}' was not found`);
                        }
                        return;
                    }
                    action.forEach((currentAction) => {
                        let target = deepCopy(newState);
                        if (currentAction.target.length > 0) {
                            let reference = newState;
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
                            newState = currentAction.do(target, params);
                        }
                    });
                });

                // optional console logging of all actions
                if (options.stateLog === true) {
                    console.log('state > %c%s', 'color:#a00;', JSON.stringify(state));
                    console.log('%c%s', 'font-size:20px;', `${type} ${JSON.stringify(params)}`);
                    console.log('state > %c%s', 'color:#0a0;', JSON.stringify(newState));
                    console.log('');
                }

                callback(deepCopy(newState), type, params);
            }

            return {
                act: act,
            };
        }

        /**
         * creates a DOM controller
         * @param {Node} target
         * @param {Function} build
         * @param {Array} parsers
         * @param {Object} initialState
         * @param {Object} options
         * @return {Object}
         */
        function gooey(target, build, parsers, initialState, options) {
            // adding parsers
            if (!options.disableShorthand) {
                parsers.push(shorthandParser);
            }

            // storing initial vdom
            let vdom = render(buildAndParse(initialState));

            // first render to DOM
            window.requestAnimationFrame(() => {
                target.innerHTML = '';
                target.appendChild(vdom.DOM);
            });

            /**
             * passes new state through builder and parsers
             * @param {Object} state
             * @return {Object}
             */
            function buildAndParse(state) {
                return parsers.reduce((intermediateVdom, parser) => {
                    return parser(intermediateVdom);
                }, build(state));
            }

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
                let actionPattern = String(attributeValue).match(/^\(\s*([^\n,\s]+?)\s*(?:,\s*([^\s]+)\s*)?\)$/);
                if (actionPattern === null) {
                    return attributeValue;
                } else {
                    let action = actionPattern[1];
                    let param = null;
                    try {
                        param = JSON.parse(actionPattern[2]);
                    } catch (e) {
                        param = actionPattern[2] || {};
                    }
                    return () => {
                        act(action, param);
                    };
                }
            }

            /**
             * update vdom and real DOM to new state
             * @param {Object} newState
             */
            function update(newState) {
                window.requestAnimationFrame(() => _update(vdom, buildAndParse(newState), {}));
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
                                if (styleDiff.length !== 0) {
                                    original.DOM.style.cssText = null;
                                    Object.keys(successor.style).forEach((key) => {
                                        original.style[key] = successor.style[key];
                                        original.DOM.style[key] = successor.style[key];
                                    });
                                }
                                if (attributesDiff.length !== 0) {
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
             * shallow diff of two objects which returns an array of the modified keys
             * @param {Object} original
             * @param {Object} successor
             * @return {Boolean|Array}
             */
            function diff(original, successor) {
                const typeOriginal = typeof original;
                const typeSuccessor = typeof successor;
                if (typeOriginal !== 'object' && typeSuccessor !== 'object') {
                    return [];
                }
                const keysOriginal = Object.keys(original);
                const keysSuccessor = Object.keys(successor);
                if (typeof successor !== 'object') {
                    return keysOriginal;
                }
                if (typeof original !== 'object') {
                    return keysSuccessor;
                }
                return Object.keys(Object.assign(Object.assign({}, original), successor)).filter((key) => {
                    let valueOriginal = original[key];
                    let valueSuccessor = successor[key];
                    return !((valueOriginal !== Object(valueOriginal)) &&
                            (valueSuccessor !== Object(valueSuccessor)) &&
                            (valueOriginal === valueSuccessor));
                });
            }

            return {
                update: update,
            };
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

    /**
     * properly formats a vdom object written in shorthand form
     * @param {Object} vdom
     * @return {Object}
     */
    function shorthandParser(vdom) {
        // textNode treatment
        if (typeof vdom === 'string') {
            vdom = {
                text: vdom,
            };
        }
        if (vdom.text) {
            return vdom;
        }
        // array to object
        if (Array.isArray(vdom)) {
            vdom = {
                tagName: vdom[0],
                attributes: vdom[1],
                style: vdom[2],
                children: vdom[3],
            };
        }
        // id and class from tagName
        let selectors = null;
        try {
            selectors = vdom.tagName.match(/^(\w+)(#[^\n#.]+)?((?:\.[^\n#.]+)*)$/);
        } catch (e) {}
        if (selectors === null) {
            err('tagName is misformatted:\n' + JSON.stringify(vdom.tagName));
        } else {
            vdom.tagName = selectors[1];
            if (selectors[2] || selectors[3]) {
                vdom.attributes = vdom.attributes || {};
                if (selectors[2]) {
                    vdom.attributes.id = selectors[2].replace('#', '');
                }
                if (selectors[3]) {
                    vdom.attributes.className = selectors[3].replace(/\./g, ' ').trim();
                }
            }
        }
        // recurse over children
        Object.keys(vdom.children || {}).forEach((key) => {
            vdom.children[key] = shorthandParser(vdom.children[key]);
        });
        return vdom;
    }

    // making goo function available as an import or in the global window object
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = goo;
    } else {
        window.goo = goo;
    }
})();
