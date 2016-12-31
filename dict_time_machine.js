// dict function wrapper that adds undo/redo actions
var dict_time_machine = function(initial_state, action_types, middleware, watchers) {

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