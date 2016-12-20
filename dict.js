// returns a state wrapper which be read, and modified through actions
var dict = function(initial_state, action_types, middleware, watchers) {

    // TODO check all args are defined

    // set current state
    var current_state = Object.assign({}, initial_state);

    // make sure action_types is an array
    if (!Array.isArray(action_types)) {
        action_types = [action_types];
    }
    
    // make sure all action types have required valid properties
    action_types.forEach(function(current_action_types, i) {
        Object.keys(current_action_types).forEach(function(current_action_type, j) {
            if (!Array.isArray(current_action_types[current_action_type])) {
                current_action_types[current_action_type] = [current_action_types[current_action_type]];
            }
            current_action_types[current_action_type].forEach(function(current_action, k) {
                if (!(Array.isArray(current_action.target) && current_action.target.length > 0)) {
                    throw new Error(`Target of action ${k} of type ${current_action_type} in action types ${i} is invalid`);
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

    // return copy of state
    function get() {
        return Object.assign({}, current_state);
    }

    // execute() wrapper that applies middleware and inkoes calls watchers
    function act(type, params) {
        var state = Object.assign({}, current_state);
        var funcs = [execute];
        middleware.reverse().forEach(function(current_middleware, index) {
            funcs[index+1] = (function(state, type, params) {
                return current_middleware(funcs[index], state, type, params);
            });
        });
        current_state = Object.assign({}, funcs[middleware.length](state, type, params));
        watchers.forEach(function(watcher) {
            watcher(get(), type, params);
        });
    }

    // exectute an action on the state
    function execute(state, type, params) {
        var local_state = Object.assign({}, state);
        action_types.forEach(function(current_action_types, i) {
            var action = current_action_types[type];
            if (!action) {
                throw new Error('action not defined');
            }
            action.forEach(function(current_action) {
                var target = Object.assign({}, local_state);
                current_action.target.forEach(function(key, k) {
                    target = target[key]||{};
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
        get: get
    }
}

// starting state
var s = {
    total: 0,
    test: {
        test: [1,2,3]
    }
};

// definition of all actions
var a = [{
    ADD: [
        {
            target: ['total'],
            do: function(target, params) {
                return target + params;
            }
        },
        {
            target: ['test', 'test'],
            do: function(target, params) {
                return target.map((val) => val+params);
            }
        }
    ],
    MULT: [{
        target: ['test'],
        do: function(target, params) {
            return {
                test: target.test.map((val) => val*params.val)
            }
        }
    }]
}];

// list of all middleware (executed top first)
var m = [
    function(callback, state, type, params) {
        console.log('before');
        var temp = callback(state, type, params);
        console.log('after');
        return temp;
    },
    // logging state and action
    function(callback, state, type, params) {
        console.log('state > %c%s', 'color:#a00;', JSON.stringify(state));
        console.log('%c%s', 'font-size:20px;', type + ' ' + JSON.stringify(params));
        var temp = callback(state, type, params);
        console.log('state > %c%s', 'color:#0a0;', JSON.stringify(temp));
        return temp;
    }
];

// watcher function
var w = function(state, type, params) {
    console.log('%cI\'m watching', 'font-style:italic;font-family:"Comic Sans MS";color:#00f;font-size:50px;');
}

// create store
var test_store = dict(s, a, m, w);

// attach actions to user events
window.addEventListener('click', function() {
    test_store.act('MULT', {val:2});
});
window.addEventListener('keydown', function() {
    test_store.act('ADD', 2);
});