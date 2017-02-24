var goo = function(controllers, args, options) {

    // make sure controllers is an array
    if (controllers === undefined) {
        controllers = [];
    } else if (!Array.isArray(controllers)) {
        controllers = [controllers];
    }

    // create DOM controller for each controller
    var controller_updates = controllers.map(function(controller) {
        return gooey(controller.target, controller.builder, args.state).update;
    });

    // make sure watchers is an array
    if (args.watchers === undefined) {
        args.watchers = [];
    } else if (!Array.isArray(args.watchers)) {
        args.watchers = [args.watchers];
    }

    // concat watcher array and controller update array
    controller_updates = args.watchers.concat(controller_updates);

    // creates state manager
    var state_manager = dict_time_machine(args.state, args.actions, args.middleware, controller_updates, options || {});

    // creates an object that acts on a state
    function dict(action_types, middleware, watchers, options) {

        // default values for all arguments
        if (action_types === undefined) {
            action_types = [{}];
        }
        if (middleware === undefined) {
            middleware = [];
        }
        if (watchers === undefined) {
            watchers = [];
        }

        // make sure action_types is an array
        if (!Array.isArray(action_types)) {
            action_types = [action_types];
        }

        // make sure all action types have required valid properties
        action_types.forEach(function(current_action_types, i) {
            Object.keys(current_action_types).forEach(function(current_action_type, j) {
                if (typeof current_action_types[current_action_type] === 'function') {
                    current_action_types[current_action_type] = {
                        target: [],
                        do: current_action_types[current_action_type]
                    }
                }
                if (!Array.isArray(current_action_types[current_action_type])) {
                    current_action_types[current_action_type] = [current_action_types[current_action_type]];
                }
                current_action_types[current_action_type].forEach(function(current_action, k) {
                    if (current_action.target === undefined) {
                        current_action.target = [];
                    } else if (typeof current_action.target === 'string') {
                        current_action.target = [current_action.target];
                    } else if (!Array.isArray(current_action.target)) {
                        throw new Error(`Target of action ${k} of type ${current_action_type} in action types ${i} is not an array`);
                    }
                    if (typeof current_action.do !== 'function') {
                        throw new Error(`Property "do" of action ${k} of type ${current_action_type} in action types ${i} is not a function`);
                    }
                    current_action.target.forEach(function(key, l) {
                        if (typeof key !== 'string' && typeof key !== 'number') {
                            throw new Error(`Key at index ${l} of target of action ${k} of type ${current_action_type} in action types ${i} is not valid`);
                        }
                    });
                });
            });
        });

        // make sure middleware is an array
        if (!Array.isArray(middleware)) {
            middleware = [middleware];
        }

        // make sure middleware are all functions
        middleware.forEach(function(current_middleware, i) {
            if (typeof current_middleware !== 'function') {
                throw new Error(`Middleware at index ${i} is not a function`);
            }
        });

        // make sure watchers is an array
        if (!Array.isArray(watchers)) {
            watchers = [watchers];
        }

        // make sure watchers are all functions
        watchers.forEach(function(current_watcher, i) {
            if (typeof current_watcher !== 'function') {
                throw new Error(`Watcher at index ${i} is not a function`);
            }
        });

        // execute() wrapper that applies middleware and calls watchers
        function act(state, type, params) {
            var state = JSON.parse(JSON.stringify(state));
            if (params === undefined) {
                params = {};
            }
            var funcs = [execute];
            middleware.reverse().forEach(function(current_middleware, index) {
                funcs[index + 1] = (function(state, type, params) {
                    return current_middleware(funcs[index], state, type, params);
                });
            });
            var new_state = JSON.parse(JSON.stringify(funcs[middleware.length](state, type, params)));

            // optional console logging of all actions
            if (options.state_log === true) {
                console.log('state > %c%s', 'color:#a00;', JSON.stringify(state));
                console.log('%c%s', 'font-size:20px;', type + ' ' + JSON.stringify(params));
                console.log('state > %c%s', 'color:#0a0;', JSON.stringify(new_state));
            }

            watchers.forEach(function(watcher) {
                watcher(JSON.parse(JSON.stringify(new_state)), type, params);
            });
            return new_state;
        }

        // exectute an action on the state
        function execute(state, type, params) {
            action_types.forEach(function(current_action_types, i) {
                var action = current_action_types[type];
                if (!action) {
                    return;
                }
                action.forEach(function(current_action) {
                    var target = JSON.parse(JSON.stringify(state));
                    if (current_action.target.length > 0) {
                        var reference = state;
                        current_action.target.forEach(function(key, i, a) {
                            console.log(reference);
                            if (target[key] !== undefined) {
                                if (i === a.length - 1) {
                                    reference[key] = current_action.do(target[key], params);
                                } else {
                                    target = target[key];
                                    reference = reference[key];
                                }
                            } else {
                                target = {};
                                reference = {};
                            }
                        });
                    } else {
                        state = current_action.do(target, params);
                    }
                });
            });
            return state;
        }

        return {
            act: act
        }
    }

    // dict wrapper that adds undo/redo actions
    function dict_time_machine(initial_state, action_types, middleware, watchers, options) {

        // history length (large numbers can cause performance issues)
        var history_length = options.history_length || 20;

        // current, past and future states
        var past = [];
        var current = JSON.parse(JSON.stringify(initial_state));
        var future = [];

        // make sure middleware is an array
        if (middleware === undefined) {
            middleware = [];
        } else if (!Array.isArray(middleware)) {
            middleware = [middleware];
        }

        // middleware that artificially adds undo/redo actions
        if (options.disable_history !== true) {
            middleware.unshift(function(callback, state, type, params) {
                if (type === 'UNDO') {
                    if (past.length > 0) {
                        future.push(current);
                        current = past.pop();
                    }
                    return current;
                } else if (type === 'REDO') {
                    if (future.length > 0) {
                        past.push(current);
                        current = future.pop();
                    }
                    return current;
                } else {
                    future = [];
                    past.push(current);
                    if (past.length > history_length) {
                        past.shift();
                    }
                    current = callback(state, type, params);
                    return current;
                }
            });
        }

        // creating dict object
        var dict_time_machine = dict(action_types, middleware, watchers, options);

        // overriding act to add persistent state
        var legacy_act = dict_time_machine.act;
        dict_time_machine.act = function(type, params) {
            current = legacy_act(current, type, params);
            return current;
        }

        // return wrapper object
        return dict_time_machine;
    }

    // creates a DOM controller with update function
    function gooey(target, create, initial_state) {

        // storing vdom
        var vdom = {};

        // type checking
        if (!target instanceof Node) {
            throw new Error('target is not a DOM node');
        }
        if (typeof create !== 'function') {
            throw new Error('create attribute is not a function');
        }

        // create vdom
        vdom = render(create(initial_state));

        // initial render to DOM
        target.innerHTML = '';
        target.appendChild(vdom.DOM);

        // recursively creates DOM elements from vdom object
        /*{
            tagName: ''
            attributes: {}
            style: {}
            children: [] || {}
            DOM: <Node />
        }*/
        function render(velem) {
            if (!velem.tagName) {
                if (velem.text === undefined) {
                    throw new Error('invalid vdom output: tagName or text property missing');
                }
                velem.DOM = document.createTextNode(velem.text);
                return velem;
            }
            var element = document.createElement(velem.tagName);
            if (velem.attributes) {
                Object.keys(velem.attributes).forEach(function(attribute) {
                    element[attribute] = velem.attributes[attribute];
                });
            }
            if (velem.style) {
                Object.keys(velem.style).forEach(function(attribute) {
                    element.style[attribute] = velem.style[attribute];
                });
            }
            if (velem.children && velem.tagName !== undefined) {
                Object.keys(velem.children).forEach(function(key) {
                    velem.children[key] = render(velem.children[key]);
                    element.appendChild(velem.children[key].DOM);
                });
            }
            velem.DOM = element;
            return velem;
        }

        // update vdom and real DOM to new state
        function update(new_state) {
            _update(vdom, create(new_state), {});
            function _update(original, successor, original_parent, index_parent) {
                if (original === undefined && successor === undefined) {
                    return;
                }
                if (original === undefined) {
                    // add
                    original_parent.children[index_parent] = render(successor);
                    original_parent.DOM.appendChild(original_parent.children[index_parent].DOM);
                } else if (successor === undefined) {
                    // remove
                    original_parent.DOM.removeChild(original.DOM);
                    original_parent.children[index_parent] = undefined;
                } else {
                    if (original.tagName !== successor.tagName) {
                        // replace
                        var old_dom = original.DOM;
                        original_parent.children[index_parent] = render(successor);
                        original_parent.DOM.replaceChild(original_parent.children[index_parent].DOM, old_dom);
                    } else {
                        // edit
                        if (original.DOM.nodeType === 3) {
                            if (original.text !== successor.text) {
                                original.DOM.nodeValue = successor.text;
                                original.text = successor.text;
                            }
                        } else {
                            var style = diff(original.style, successor.style);
                            var attributes = diff(original.attributes, successor.attributes);
                            if (style.length !== undefined) {
                                original.DOM.style.cssText = null;
                                Object.keys(successor.style).forEach(function(key) {
                                    original.style[key] = successor.style[key];
                                    original.DOM.style[key] = successor.style[key];
                                });
                            }
                            if (attributes.length !== undefined) {
                                attributes.forEach(function(key) {
                                    original.attributes[key] = successor.attributes[key];
                                    original.DOM[key] = successor.attributes[key];
                                });
                            }
                        }
                    }
                    var keys = (Object.keys(original.children || {}).concat(Object.keys(successor.children || {})));
                    var visited = {};
                    keys.forEach(function(key) {
                        if (visited[key] === undefined) {
                            visited[key] = true;
                            _update(original.children[key], successor.children[key], original, key);
                        }
                    });
                }
            }
        }

        // check differences between two objects
        function diff(original, successor, ignore) {
            // making sure ignore variable is defined
            ignore = ignore || {};
            // get types
            var o_type = Object.prototype.toString.call(original);
            var s_type = Object.prototype.toString.call(successor);
            // reject when different types
            if (o_type !== s_type) {
                return false;
            }
            // functions are never considered equal
            if (o_type === '[object Function]') {
                return false;
            }
            // compare two objects or arrays
            if (o_type === '[object Object]' || o_type === '[object Array]') {
                var keys = Object.keys(original);
                var new_keys = Object.keys(successor);
                // creating union of both arrays of keys
                if (o_type === '[object Array]') {
                    var length_difference = new_keys.length - keys.length;
                    if (length_difference > 0) {
                        for (let i = length_difference; i > 0; --i) {
                            keys.push(new_keys[new_keys.length - i]);
                        }
                    }
                } else {
                    var keys_obj = {};
                    keys.forEach(function(key) {
                        keys_obj[key] = true;
                    });
                    new_keys.forEach(function(key) {
                        if (!keys_obj[key]) {
                            keys.push(key);
                        }
                    });
                }
                return keys.reduce(function(accumulator, key) {
                    if (ignore[key] !== undefined) {
                        return accumulator;
                    }
                    var temp = diff(original[key], successor[key], ignore);
                    if (temp !== true) {
                        if (typeof accumulator === 'boolean') {
                            accumulator = [];
                        }
                        if (temp === false) {
                            accumulator.push([key]);
                        } else {
                            temp.forEach(function(current) {
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
            update: update
        }
    }

    return {
        act: state_manager.act
    }

}