const {assert, deepCopy, makeQueue, blobHandler, isDefined, isArray, isFunction, isString} = require('../goo-utils')();

// creates an object that acts on a state
const state = () => {
    const actions = {};
    const middleware = [];
    const watchers = [];

    const queue = makeQueue();

    const addAction = (action) => {
        const {type, handler, target} = action;
        assert(isString(type), `@goo.state.addAction : action type "${type}" is not a string`, action);
        assert(isFunction(handler), `@goo.state.addAction : handler for action ${type} is not a function`, handler);
        assert(isArray(target), `@goo.state.addAction : target of action ${type} is not an array`, target);
        target.forEach((address) => {
            assert(isString(address), `@goo.state.addAction : target of action type ${type} is not an array of strings ${target}`);
        });
        if (actions[type] === undefined) {
            actions[type] = [action];
        } else {
            actions[type].push(action);
        }
    };

    const addMiddleware = (handler) => {
        assert(isFunction(handler), '@goo.state.addMiddleware : middleware is not a function', handler);
        middleware.push(handler);
    };

    const addWatcher = (handler) => {
        assert(isFunction(handler), '@goo.state.addWatcher : watcher is not a function', handler);
        watchers.push(handler);
    };

    // supported blobs and their execution
    const use = (blob) => {
        return blobHandler({
            action: addAction,
            middleware: addMiddleware,
            watcher: addWatcher,
        }, blob, queue);
    };

    // exectute an action on the state
    const execute = (state, type, params) => {
        let newState = deepCopy(state);
        assert(isDefined(actions[type]), `@goo.state.execute : action type '${type}' was not found`);
        actions[type].forEach((currentAction) => {
            let target = deepCopy(newState);
            if (currentAction.target.length > 0) {
                let reference = newState;
                currentAction.target.forEach((key, i, a) => {
                    assert(isDefined(target[key]), `@goo.state.execute : target of action ${type} does not exist: @state.${currentAction.target.slice(0, i+1).join('.')}`);
                    if (i === a.length - 1) {
                        let newValue = currentAction.handler(target[key], params);
                        assert(isDefined(newValue), `@goo.state.execute : result of action ${type} on target @state${currentAction.target[0]?'.':''}${currentAction.target.join('.')} is undefined`);
                        reference[key] = newValue;
                    } else {
                        target = target[key];
                        reference = reference[key];
                    }
                });
            } else {
                newState = currentAction.handler(target, params);
                assert(isDefined(newState), `@goo.state.execute : result of action ${type} on target @state${currentAction.target[0]?'.':''}${currentAction.target.join('.')} is undefined`);
            }
        });

        watchers.forEach((watcher) => {
            watcher(deepCopy(newState), type, params);
        });

        queue.done();
    };

    // execute wrapper that applies middleware
    const apply = (state, type, params) => {
        const funcs = [(_state = state, _type = type, _params = params) => {
            execute(_state, _type, _params);
        }];
        middleware.reverse().forEach((currentMiddleware, index) => {
            funcs[index + 1] = (_state = state, _type = type, _params = params) => {
                state = _state;
                type = _type;
                params = _params;
                currentMiddleware(funcs[index], deepCopy(_state), _type, _params);
            };
        });
        funcs[middleware.length](deepCopy(state), type, params);
    };

    // apply wrapper that uses the wait queue
    const act = (state, type, params = {}) => {
        assert(isDefined(state), '@goo.state.act : cannot call act with undefined state');
        assert(isDefined(type), '@goo.state.act : cannot call act with undefined type');
        queue.add(() => {
            apply(state, type, params);
        });
    };

    return {act, use};
};

module.exports = state;
