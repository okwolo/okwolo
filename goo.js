var goo = function(arguments) {

/*
    target
    builder
    state
    actions
    middleware
    watchers
*/

    arguments.watchers = arguments.watchers || [];

    // make sure watchers is an array
    if (!Array.isArray(arguments.watchers)) {
        arguments.watchers = [arguments.watchers];
    }

    // make sure watchers are all functions
    arguments.watchers.forEach(function(current_watcher, i) {
        if (typeof current_watcher !== 'function') {
            throw new Error(`Watcher at index ${i} is not a function`);
        }
    });

    var app = draw(arguments.target, arguments.builder, arguments.state);

    arguments.watchers.push(app.update);

    var state_manager = dict_time_machine(arguments.state, arguments.actions, arguments.middleware, arguments.watchers);

    // returns a state wrapper which be read, and modified through actions
    function dict(action_types, middleware, watchers) {

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
                funcs[index+1] = (function(state, type, params) {
                    return current_middleware(funcs[index], state, type, params);
                });
            });
            state = JSON.parse(JSON.stringify(funcs[middleware.length](state, type, params)));
            watchers.forEach(function(watcher) {
                watcher(JSON.parse(JSON.stringify(state)), type, params);
            });
            return state;
        }

        // exectute an action on the state
        function execute(state, type, params) {
            var local_state = JSON.parse(JSON.stringify(state));
            action_types.forEach(function(current_action_types, i) {
                var action = current_action_types[type];
                if (!action) {
                    return;
                }
                action.forEach(function(current_action) {
                var target = JSON.parse(JSON.stringify(local_state));
                    current_action.target.forEach(function(key, k) {
                        if (target[key] !== undefined) {
                            target = target[key];
                        } else {
                            target = {};
                        }
                    });
                    target = current_action.do(target, params);
                    for (var i = current_action.target.length-1; i >= 0; --i) {
                        var temp = {};
                        temp[current_action.target[i]] = target;
                        target = temp;
                    }
                    local_state = Object.assign(local_state, target);
                });
            });
            return local_state;
        }

        // returning public functions
        return {
            act: act
        }
    }

    // dict function wrapper that adds undo/redo actions
    function dict_time_machine(initial_state, action_types, middleware, watchers) {

        // storing initial state
        initial_state = JSON.parse(JSON.stringify(initial_state));
        var current_state = JSON.parse(JSON.stringify(initial_state));

        // storing action history and undone action history
        var prev_actions = [];
        var future_actions = [];

        // flag to track whether an undo/redo action is being performed (to prevent excessive console output and watcher calls)
        var compoud_action = false;

        // make sure action_types is an array
        if (!Array.isArray(action_types)) {
            action_types = [action_types];
        }

        // adding undo/redo actions
        action_types.push({
            UNDO: undo,
            REDO: redo
        });

        // undo action
        function undo(target, params) {
            compoud_action = true;
            var temp_state = JSON.parse(JSON.stringify(initial_state));
            future_actions.push(prev_actions.pop());
            prev_actions.forEach(function(action) {
                temp_state = legacy_act(temp_state, action.type, action.params);
            });
            current_state = temp_state;
            compoud_action = false;
            return current_state
        }

        // redo action
        function redo(target, params) {
            compoud_action = true;
            var action = future_actions.pop();
            prev_actions.push(action);
            current_state = legacy_act(current_state, action.type, action.params);
            compoud_action = false;
            return current_state
        }

        // make sure middleware is an array
        if (middleware === undefined) {
            middleware = [];
        } else if (!Array.isArray(middleware)) {
            middleware = [middleware];
        }

        // adding undo/redo compatible logging middleware
        middleware.unshift(function(callback, state, type, params) {
            var temp = callback(state, type, params);
            if (!compoud_action) {
                console.log('state > %c%s', 'color:#a00;', JSON.stringify(state));
                console.log('%c%s', 'font-size:20px;', type + ' ' + JSON.stringify(params));
                console.log('state > %c%s', 'color:#0a0;', JSON.stringify(temp));
            }
            return temp;
        });

        // make sure watchers is an array
        if (watchers === undefined) {
            watchers = [];
        } else if (!Array.isArray(watchers)) {
            watchers = [watchers];
        }

        // wrapping watchers to prevent execution on each of undo's rebuild steps
        var legacy_watchers = watchers;
        watcher = function(state, type, params) {
            if (!compoud_action) {
                legacy_watchers.forEach(function(legacy_watcher) {
                    legacy_watcher(state, type, params);
                });
            }
        }

        // creating dict object
        var dict_time_machine = dict(action_types, middleware, watcher);

        // wrapping the default dict's act function to overrite state argument and manage undo/redo actions
        var legacy_act = dict_time_machine.act;
        dict_time_machine.act = function(type, params) {
            if (!(type === 'UNDO' && prev_actions.length < 1) && !(type === 'REDO' && future_actions.length < 1)) {
                if (type !== 'UNDO' && type !== 'REDO') {
                    prev_actions.push({
                        type: type,
                        params: params
                    });
                    future_actions = [];
                }
                current_state = legacy_act(current_state, type, params);
            }
        }

        // return wrapper object
        return dict_time_machine;
    }

    // returns a rendering object that exposes an update function
    function draw(target, create, initial_state) {

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
            tagName: '',
            attributes: {},
            style: {},
            children: []
        }*/
        function render(velem) {
            if (!velem.tagName) {
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
            if (velem.children) {
                velem.children.forEach(function(child, index) {
                    velem.children[index] = render(child);
                    element.appendChild(velem.children[index].DOM);
                });
            }
            velem.DOM = element;
            return velem;
        }

        // update vdom and real DOM to new state
        function update(new_state) {
            make_changes(vdom, create(new_state), {});
            function make_changes(original, successor, original_parent, index_parent) {
                if ((original === undefined && successor === undefined) || original_parent === undefined) {
                    return;
                }
                if (original === undefined) {
                    // add
                    original_parent.children[index_parent] = render(successor);
                    original_parent.DOM.appendChild(original_parent.children[index_parent].DOM);
                } else if (successor === undefined) {
                    // remove
                    original_parent.DOM.removeChild(original.DOM);
                    original_parent.children.splice(index_parent,1);
                } else if (original.tagName !== successor.tagName) {
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
                var len_original = (original && original.children && original.children.length) || 0;
                var len_successor = (successor && successor.children && successor.children.length) || 0;
                var len = Math.max(len_original, len_successor);
                for (var i = 0; i < len; ++i) {
                    make_changes(
                        original && original.children && original.children[i],
                        successor && successor.children && successor.children[i],
                        original,
                        i
                    );
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
                        for (let i = length_difference; i > 0 ; --i) {
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

        // returning public funcitons
        return {
            update: update
        }
    }

    return {
        act: state_manager.act
    }

}