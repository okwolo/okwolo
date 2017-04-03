const {assert, deepCopy, makeQueue, blobHandler, isDefined, isArray, isFunction, isString} = require('../goo-utils/goo-utils.js');

// creates an object that acts on a state
const state = () => {
    const actions = {};
    const middleware = [];
    const watchers = [];

    const queue = makeQueue();

    const addAction = (action) => {
        assert(isString(action.type), `action type ${action.type} is not a string`);
        assert(isFunction(action.handler), `handler for action ${action.type} is not a function`);
        assert(isArray(action.target), `target of action ${action.type} is not an array`);
        action.target.forEach((address) => {
            assert(isString(address), `target of action type ${action.type} is not an array of strings ${action.target}`);
        });
        if (actions[action.type] === undefined) {
            actions[action.type] = [action];
        } else {
            actions[type].push(action);
        }
    };

    const addMiddleware = (handler) => {
        assert(isFunction(handler), `middleware is not a function\n${handler}`);
        middleware.push(handler);
    };

    const addWatcher = (handler) => {
        assert(isFunction(handler), `watcher is not a function\n${handler}`);
        watchers.push(handler);
    };

    // supported blobs and their execution
    const use = (blob) => {
        blobHandler({
            action: addAction,
            middleware: addMiddleware,
            watcher: addWatcher,
        }, blob, queue);
    };

    // exectute an action on the state
    const execute = (state, type, params) => {
        let newState = deepCopy(state);
        assert(isDefined(actions[type]), `action type '${type}' was not found`);
        actions[type].forEach((currentAction) => {
            let target = deepCopy(newState);
            if (currentAction.target.length > 0) {
                let reference = newState;
                currentAction.target.forEach((key, i, a) => {
                    assert(isDefined(target[key]), `target address of action ${type} is does not exist: @state.${currentAction.target.join('.')}`);
                    if (i === a.length - 1) {
                        reference[key] = currentAction.handler(target[key], params);
                    } else {
                        target = target[key];
                        reference = reference[key];
                    }
                });
            } else {
                newState = currentAction.handler(target, params);
            }
        });

        watchers.forEach((watcher) => {
            watcher(deepCopy(newState), type, params);
        });

        queue.done();
    };

    // execute wrapper that applies middleware
    const apply = (state, type, params) => {
        // TODO implement in two passes (map)
        const funcs = [(_state, _type = type, _params = params) => {
            type = _type;
            params = _params;
            execute(_state, _type, _params);
        }];
        middleware.reverse().forEach((currentMiddleware, index) => {
            funcs[index + 1] = (_state, _type = type, _params = params) => {
                type = _type;
                params = _params;
                currentMiddleware(funcs[index], deepCopy(_state), _type, _params);
            };
        });
        funcs[middleware.length](deepCopy(state), type, params);
    };

    // apply wrapper that uses the wait queue
    const act = (state, type, params = {}) => {
        queue.add(() => {
            apply(state, type, params);
        });
    };

    return {} = {act, use};
};

module.exports = state;
