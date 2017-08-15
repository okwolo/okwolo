'use strict';

const {assert, deepCopy, makeQueue, isDefined, isArray, isFunction, isString, bus} = require('@okwolo/utils')();

const state = () => {
    const actions = {};
    const middleware = [];
    const watchers = [];

    const queue = makeQueue();

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

    const exec = bus();

    exec.on('act', ({state, type, params = {}} = {}) => {
        assert(isString(type), 'state.act : action type is not a string', type);
        assert(isDefined(state), `state.act : cannot call action ${type} on an undefined state`, state);
        queue.add(() => {
            apply(state, type, params);
        });
    });

    const use = bus(queue);

    use.on('action', (action) => {
        [].concat(action).forEach((item) => {
            const {type, handler, target} = item;
            assert(isString(type), 'state.use.action : action\'s type is not a string', item, type);
            assert(isFunction(handler), `state.use.action : handler for action ${type} is not a function`, item, handler);
            if (isArray(target)) {
                target.forEach((address) => {
                    assert(isString(address), `state.use.action : target of action ${type} is not an array of strings`, item, target);
                });
            } else {
                assert(isFunction(target), `state.use.action : target of action ${type} is not valid`, target);
            }
            if (actions[type] === undefined) {
                actions[type] = [item];
            } else {
                actions[type].push(item);
            }
        });
    });

    use.on('middleware', (_middleware) => {
        [].concat(_middleware).forEach((item) => {
            assert(isFunction(item), 'state.use.middleware : middleware is not a function', item);
            middleware.push(item);
        });
    });

    use.on('watcher', (watcher) => {
        [].concat(watcher).forEach((item) => {
            assert(isFunction(item), 'state.use.watcher : watcher is not a function', item);
            watchers.push(item);
        });
    });

    return {exec, use};
};

module.exports = state;
