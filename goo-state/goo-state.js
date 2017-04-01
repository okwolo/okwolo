const utils = require('goo-utils');

// creates an object that acts on a state
let state = () => {
    let actions = {};
    let middleware = [];
    let watchers = [];

    // supported blobs and their execution
    let use = (blob) => {
        let blobs = {
            action: () => {
                let {type, handler} = blob.action;
                if (actions[type] === undefined) {
                    action[type] = [handler];
                } else {
                    action[type] = handler;
                }
            },
            middleware: () => {
                let {func, position} = blob.middlware;
                if (position !== false) {
                    middleware.push(func);
                } else {
                    middleware.unshift(func);
                }
            },
            watcher: () => {
                let {func, position} = blob.middlware;
                if (position !== false) {
                    watcher.push(func);
                } else {
                    watcher.unshift(func);
                }
            },
        };
        (blobs[Object.keys(blob)[0]] || (() => {}))();
    };

    // exectute an action on the state
    let execute = (state, type, params) => {
        let newState = utils.deepCopy(state);
        if (actions[type] === undefined) {
            utils.err(`action type '${type}' was not found`);
        }
        actions[type].forEach((currentAction) => {
            let target = utils.deepCopy(newState);
            if (currentAction.target.length > 0) {
                let reference = newState;
                currentAction.target.forEach((key, i, a) => {
                    if (target[key] !== undefined) {
                        if (i === a.length - 1) {
                            reference[key] = currentAction.do(target[key], params);
                        } else {
                            target = target[key];
                            reference = reference[key];
                        }
                    } else {
                        utils.err(`target address of action ${type} is invalid: @state.${currentAction.target.join('.')}`);
                    }
                });
            } else {
                newState = currentAction.do(target, params);
            }
        });

        watchers.forEach((watcher) => {
            watcher(utils.deepCopy(newState), type, params);
        });
    };

    // execute wrapper that applies middleware
    let act = (state, type, params = {}) => {
        let funcs = [(_state, _type = type, _params = params) => {
            type = _type;
            params = _params;
            execute(_state, _type, _params);
        }];
        middleware.reverse().forEach((currentMiddleware, index) => {
            funcs[index + 1] = (_state, _type = type, _params = params) => {
                type = _type;
                params = _params;
                currentMiddleware(funcs[index], utils.deepCopy(_state), _type, _params);
            };
        });
        funcs[middleware.length](utils.deepCopy(state), type, params);
    };

    return {
        act: act,
        use: use,
    };
};

module.exports = state;
