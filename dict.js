// returns a state wrapper which be read, and modified through actions
var dict = function(action_types, middleware, watchers) {

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
        var state = deep_copy(state);
        if (params === undefined) {
            params = {};
        }
        var funcs = [execute];
        middleware.reverse().forEach(function(current_middleware, index) {
            funcs[index+1] = (function(state, type, params) {
                return current_middleware(funcs[index], state, type, params);
            });
        });
        state = deep_copy(funcs[middleware.length](state, type, params));
        watchers.forEach(function(watcher) {
            watcher(deep_copy(state), type, params);
        });
        return state;
    }

    // exectute an action on the state
    function execute(state, type, params) {
        var local_state = deep_copy(state);
        action_types.forEach(function(current_action_types, i) {
            var action = current_action_types[type];
            if (!action) {
                return;
            }
            action.forEach(function(current_action) {
            var target = deep_copy(local_state);
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

    return {
        act: act,
    }
}