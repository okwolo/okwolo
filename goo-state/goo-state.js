const utils = require('goo-utils');

/**
 * creates an object that acts on a state
 * @param {Array} actionTypes
 * @param {Array} middleware
 * @param {Object} options
 * @param {Function} callback
 * @return {Object}
 */
module.exports = (actionTypes, middleware, options, callback) => {
    /**
     * execute() wrapper that applies middleware
     * @param {Object} state
     * @param {String} type
     * @param {any} params
     */
    function act(state, type, params = {}) {
        // nest middleware
        let funcs = [(_state, _type = type, _params = params) => {
            type = _type;
            params = _params;
            execute(_state, _type, _params);
        }];
        middleware.reverse().forEach((currentMiddleware, index) => {
            funcs[index + 1] = (_state, _type = type, _params = params) => {
                type = _type;
                params = _params;
                currentMiddleware(funcs[index], utils.deepCopy(_state), _type, _params, options);
            };
        });
        funcs[middleware.length](utils.deepCopy(state), type, params);
    }

    /**
     * exectute an action on the state
     * @param {any} state
     * @param {any} type
     * @param {any} params
     */
    function execute(state, type, params) {
        let newState = utils.deepCopy(state);
        let actionTypeNotFound = actionTypes.length;
        actionTypes.forEach((currentActionTypes) => {
            let action = currentActionTypes[type];
            if (!action) {
                --actionTypeNotFound;
                if (actionTypeNotFound === 0) {
                    utils.err(`action type '${type}' was not found`);
                }
                return;
            }
            action.forEach((currentAction) => {
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
        });

        // optional console logging of all actions
        if (options.stateLog === true) {
            console.log('state > %c%s', 'color:#a00;', JSON.stringify(state));
            console.log('%c%s', 'font-size:20px;', `${type} ${JSON.stringify(params)}`);
            console.log('state > %c%s', 'color:#0a0;', JSON.stringify(newState));
            console.log('');
        }

        callback(utils.deepCopy(newState), type, params);
    }

    return {
        act: act,
    };
};
