'use strict';

const {assert, deepCopy, makeQueue, blobHandler, isDefined, isArray, isFunction, isString} = require('@okwolo/utils')();

const state = () => {
    const actions = {};
    const middleware = [];
    const watchers = [];

    const queue = makeQueue();

    // exectute an action on the state
    const execute = (state, type, params) => {
        let newState = deepCopy(state);
        assert(isDefined(actions[type]), `state.execute : action type '${type}' was not found`);
        actions[type].forEach((currentAction) => {
            let targetAddress = currentAction.target;
            if (isFunction(targetAddress)) {
                targetAddress = targetAddress(deepCopy(state), params);
                assert(isArray(targetAddress), `state.execute : dynamic target of action ${type} is not an array`, targetAddress);
                targetAddress.forEach((address) => {
                    assert(isString(address), `state.execute : dynamic target of action ${type} is not an array of strings`, targetAddress);
                });
            }
            let target = deepCopy(newState);
            if (targetAddress.length > 0) {
                let reference = newState;
                targetAddress.forEach((key, i) => {
                    assert(isDefined(target[key]), `state.execute : target of action ${type} does not exist: @state.${targetAddress.slice(0, i+1).join('.')}`);
                    if (i === targetAddress.length - 1) {
                        let newValue = currentAction.handler(target[key], params);
                        assert(isDefined(newValue), `state.execute : result of action ${type} on target @state${targetAddress.join('.')} is undefined`);
                        reference[key] = newValue;
                    } else {
                        target = target[key];
                        reference = reference[key];
                    }
                });
            } else {
                newState = currentAction.handler(target, params);
                assert(isDefined(newState), `state.execute : result of action ${type} on target @state is undefined`);
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
        assert(isString(type), 'state.act : action type is not a string', type);
        assert(isDefined(state), `state.act : cannot call action ${type} on an undefined state`, state);
        queue.add(() => {
            apply(state, type, params);
        });
    };

    const addAction = (action) => {
        const {type, handler, target} = action;
        assert(isString(type), 'state.addAction : action\'s type is not a string', action, type);
        assert(isFunction(handler), `state.addAction : handler for action ${type} is not a function`, action, handler);
        if (isArray(target)) {
            target.forEach((address) => {
                assert(isString(address), `state.addAction : target of action ${type} is not an array of strings`, action, target);
            });
        } else {
            assert(isFunction(target), `state.addAction : target of action ${type} is not valid`, target);
        }
        if (actions[type] === undefined) {
            actions[type] = [action];
        } else {
            actions[type].push(action);
        }
    };

    const addMiddleware = (handler) => {
        assert(isFunction(handler), 'state.addMiddleware : middleware is not a function', handler);
        middleware.push(handler);
    };

    const addWatcher = (handler) => {
        assert(isFunction(handler), 'state.addWatcher : watcher is not a function', handler);
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

    return {act, use};
};

module.exports = state;
