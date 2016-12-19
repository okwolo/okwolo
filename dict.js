var s = {
    total: 0,
    test: {
        test: [1,2,3]
    }
};

// definition of all actions
var action_types = {
    ADD: {
        target: ['total'],
        do: function(target, params) {
            return target + params.amount;
        }
    },
    MULT: [{
        target: ['test'],
        do: function(target, params) {
            return {
                test: target.test.map((val) => val*params.val)
            }
        }
    }]
};

// list of all middleware executed top first
var middleware = [
    /*function(callback, state, type, params) {
        console.log('a');
        var temp = callback(state, type, params);
        console.log('a');
        return temp;
    },
    function(callback, state, type, params) {
        console.log('b');
        var temp = callback(state, type, params);
        console.log('b');
        return temp;
    },
    function(callback, state, type, params) {
        console.log('c');
        var temp = callback(state, type, params);
        console.log('c');
        return temp;
    },*/
    // logging state and action
    function(callback, state, type, params) {
        console.log('state > %c%s', 'color:#a00;', JSON.stringify(state));
        console.log('%c%s', 'font-size:20px;', type + ' ' + JSON.stringify(params));
        var temp = callback(state, type, params);
        console.log('state > %c%s', 'color:#0a0;', JSON.stringify(temp));
        return temp;
    }
];

// execute wrapper that applies middleware
function act(type, params) {
    var state = Object.assign({}, s);
    var funcs = [];
    for (var i = middleware.length-1; i >= 0; --i) {
        (function(index) {
            funcs[index] = function(state, type, params) {
                return middleware[index](funcs[index+1]||execute, state, type, params);
            }
        }(i));
    }
    return funcs[0](state, type, params);
}

// exectute an action on the state
function execute(state, type, params) {
    var local_state = Object.assign({}, state);
    var action = action_types[type];
    if (!action) {
        throw new Error('action not defined');
    }
    if (!Array.isArray(action)) {
        action = [action];
    }
    action.forEach(function(current_action) {
        var target_value = Object.assign({}, local_state);
        current_action.target.forEach(function(key) {
            target_value = target_value[key];
        });
        var obj = current_action.do(target_value, params);
        for (var i = current_action.target.length-1; i >= 0; --i) {
            var temp = {};
            temp[current_action.target[i]] = obj;
            obj = temp;
        }
        local_state = Object.assign(local_state, obj);
    });
    return local_state;
}

window.addEventListener('click', function() {
    s = act('MULT', {val:2});
});

window.addEventListener('keydown', function() {
    s = act('ADD', {amount:2});
});