'use strict';

const {assert, deepCopy, makeQueue, isDefined, isArray, isFunction, isString} = require('../utils')();

module.exports = ({emit, use}) => {
    // this module defines an action which overrides the whole state while
    // giving visibility to the middleware and watchers.
    const overrideActionType = 'SET_STATE';

    let stateHasBeenOverwritten = false;

    // actions is a map where actions are stored in an array at their type key.
    const actions = {};
    const middleware = [];
    const watchers = [];

    // this queue is used to ensure that an action, the middleware and the
    // watchers all get called before a second action can be done. this is
    // relevant in the case where an action is called from within a watcher.
    // it does not however support waiting for any async code.
    const queue = makeQueue();

    // the real value is set after this module's handshake with the state
    // module when the state handler is registered.
    let readState = () => undefined;

    const execute = (state, type, params) => {
        // this value will represent the state after executing the action(s).
        // it must be copied since all the middleware functions can still
        // potentially have access to it.
        let newState = deepCopy(state);
        assert(isDefined(actions[type]), `state.handler : action type '${type}' was not found`);

        // action types with multiple actions are executed in the order they are added.
        actions[type].forEach((currentAction) => {
            let targetAddress = currentAction.target;

            // if the target is a function, it is executed with the current state.
            if (isFunction(targetAddress)) {
                targetAddress = targetAddress(deepCopy(state), params);
                // since the typechecks cannot be ran when the action is added,
                // they need to be done during the action.
                assert(isArray(targetAddress), `state.handler : dynamic target of action ${type} is not an array`, targetAddress);
                targetAddress.forEach((address) => {
                    assert(isString(address), `state.handler : dynamic target of action ${type} is not an array of strings`, targetAddress);
                });
            }

            // the target is the object being passed to the action handler.
            // it must be copied since any previous actions can still access it.
            let target = deepCopy(newState);

            // an empty array means the entire state object is the target.
            if (targetAddress.length === 0) {
                newState = currentAction.handler(target, params);
                assert(isDefined(newState), `state.handler : result of action ${type} on target @state is undefined`);
            }

            // reference will be the variable which keeps track of the current
            // layer at which the address is. it is initially equal to the new
            // state since that is the value that needs to be modified.
            let reference = newState;
            targetAddress.forEach((key, i) => {
                assert(isDefined(target[key]), `state.handler : target of action ${type} does not exist: @state.${targetAddress.slice(0, i+1).join('.')}`);
                if (i < targetAddress.length - 1) {
                    // both the reference to the "actual" state and the target
                    // dummy copy are traversed at the same time.
                    target = target[key];
                    reference = reference[key];
                    return;
                }

                // when the end of the address array is reached, the target
                // has been found and can be used by the handler.
                let newValue = currentAction.handler(target[key], params);
                assert(isDefined(newValue), `state.handler : result of action ${type} on target @state.${targetAddress.join('.')} is undefined`);
                reference[key] = newValue;
            });
        });

        // other modules can listen for the state event to be updated when
        // it changes (ex. the rendering process).
        emit({state: deepCopy(newState)});

        watchers.forEach((watcher) => {
            watcher(deepCopy(newState), type, params);
        });

        // this will signal the queue that the next action can be started.
        queue.done();
    };

    const apply = (state, type, params) => {
        // base function executes the action after all middleware has been used.
        const funcs = [(_state = state, _type = type, _params = params) => {
            execute(_state, _type, _params);
        }];

        // this code will create an array where all elements are funtions which
        // call the closest function with a lower index. the returned values for
        // the state, action type and params are also passed down to the next
        // function in the chain.
        middleware.reverse().forEach((currentMiddleware, index) => {
            funcs[index + 1] = (_state = state, _type = type, _params = params) => {
                // arguments are updated with the output of previous middleware.
                state = _state;
                type = _type;
                params = _params;
                currentMiddleware(funcs[index], deepCopy(_state), _type, _params);
            };
        });

        // the funcs array is initialized with an extra element which makes it
        // one longer than middleware. therefore, using the length of middleware
        // is looking for the last element in the array of functions.
        funcs[middleware.length](state, type, params);
    };

    // actions can be added in batches by using an array.
    use.on('action', (action) => {
        [].concat(action).forEach((item = {}) => {
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
                return;
            }
            actions[type].push(item);
        });
    });

    // middleware can be added in batches by using an array.
    use.on('middleware', (_middleware) => {
        [].concat(_middleware).forEach((item) => {
            assert(isFunction(item), 'state.use.middleware : middleware is not a function', item);
            middleware.push(item);
        });
    });

    // watchers can be added in batches by using an array.
    use.on('watcher', (watcher) => {
        [].concat(watcher).forEach((item) => {
            assert(isFunction(item), 'state.use.watcher : watcher is not a function', item);
            watchers.push(item);
        });
    });

    emit.on('act', ({type, params = {}} = {}) => {
        // the only action that does not need the state to have already
        // been changed is SET_STATE.
        assert(stateHasBeenOverwritten || type === overrideActionType, 'act : cannot act on state before it has been overrwritten');
        stateHasBeenOverwritten = true;
        assert(isString(type), 'state.act : action type is not a string', type);
        // the queue will make all actions wait to be ran sequentially.
        queue.add(() => {
            apply(readState(), type, params);
        });
    });

    // expose module's features to the app.
    use({api: {
        act: (type, params) => emit({act: {type, params}}),
    }});

    // action is used to override state in order to give visibility to
    // watchers and middleware.
    use({action: {
        type: overrideActionType,
        target: [],
        handler: (state, params) => params,
    }});

    use({handler: (reader) => {
        readState = reader;
        return (newState) => {
            emit({act: {type: overrideActionType, params: newState}});
        };
    }});
};
