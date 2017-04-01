const {assert, deepCopy, makeQueue, isDefined, isArray, isFunction, isString} = require('goo-utils');

// creates an object that acts on a state
let state = () => {
    let actions = {};
    let formatters = [];
    let middleware = [];
    let watchers = [];

    let queue = makeQueue();

    let addAction = (action) => {
        let formattedAction = formatters.reduce((acc, formatter) => {
            return formatter(acc);
        }, action);
        assert(isString(formattedAction.type), `action type ${formattedAction.type} is not a string`);
        assert(isFunction(formattedAction.handler), `handler for action ${formattedAction.type} is not a function`);
        assert(isArray(formattedAction.target), `target of action ${formattedAction.type} is not an array`);
        formattedAction.target.forEach((address) => {
            assert(isString(address), `target of action type ${formattedAction.type} is not an array of strings ${formattedAction.target}`);
        });
        if (actions[formattedAction.type] === undefined) {
            action[formattedAction.type] = [formattedAction];
        } else {
            action[type].push(formattedAction);
        }
        queue.done();
    };

    let addActionFormatter = (formatter) => {
        let {handler, position} = formatter;
        assert(isFunction(handler), `action formatter is not a function\n${handler}`);
        if (position !== false) {
            formatters.push(handler);
        } else {
            formatters.unshift(handler);
        }
        queue.done();
    };

    let addMiddleware = (middleware) => {
        let {handler, position} = middleware;
        assert(isFunction(handler), `middleware is not a function\n${handler}`);
        if (position !== false) {
            middleware.push(handler);
        } else {
            middleware.unshift(handler);
        }
        queue.done();
    };

    let addWatcher = (watcher) => {
        let {handler, position} = watcher;
        assert(isFunction(handler), `watcher is not a function\n${handler}`);
        if (position !== false) {
            watcher.push(handler);
        } else {
            watcher.unshift(handler);
        }
        queue.done();
    };

    // supported blobs and their execution
    let use = (blob) => {
        let blobs = {
            action: addAction,
            formatter: addActionFormatter,
            middleware: addMiddleware,
            watcher: addWatcher,
        };
        let blobType = Object.keys(blob)[0];
        if (isDefined(blobs[blobType])) {
            queue.add(() => {
                blobs[blobType](blob[blobType]);
            });
        }
    };

    // exectute an action on the state
    let execute = (state, type, params) => {
        let newState = deepCopy(state);
        assert(isDefined(actions[type]), `action type '${type}' was not found`);
        actions[type].forEach((currentAction) => {
            let target = deepCopy(newState);
            if (currentAction.target.length > 0) {
                let reference = newState;
                currentAction.target.forEach((key, i, a) => {
                    assert(isDefined(target[key]), `target address of action ${type} is invalid: @state.${currentAction.target.join('.')}`);
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
    let apply = (state, type, params) => {
        let funcs = [(_state, _type = type, _params = params) => {
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
    let act = (state, type, params = {}) => {
        queue.add(() => {
            apply(state, type, params);
        });
    };

    return {} = {act, use};
};

module.exports = state;
