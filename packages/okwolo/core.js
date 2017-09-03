'use strict';

const {isFunction, isDefined, assert, deepCopy, isBrowser, bus} = require('@okwolo/utils')();

const core = ({modules, blobs, options}) => {
    const okwolo = (target, _window) => {
        if (options.browser) {
            if (!isDefined(_window)) {
                assert(isBrowser(), 'app : must be run in a browser environment');
                _window = window;
            }
        }

        const exec = bus();
        const use = bus();
        const api = {exec, use};

        modules.forEach((_module) => {
            _module({exec, use}, _window);
        });

        blobs.forEach((blob) => {
            use(blob(_window));
        });

        const initial = {};
        let _state = initial;

        exec.on('state', (newState) => {
            _state = newState;
        });

        api.getState = () => {
            assert(_state !== initial, 'getState : cannot get state before it has been set');
            return deepCopy(_state);
        };

        if (options.modules.dom) {
            api.update = () => {
                exec({state: _state});
            };

            if (isDefined(target)) {
                use({target});
            }
        }

        if (options.modules.state) {
            api.act = (type, params) => {
                assert(type === 'SET_STATE' || _state !== initial, 'act : cannot act on state before it has been set');
                exec({act: {state: _state, type, params}});
            };

            use({action: {
                type: 'SET_STATE',
                target: [],
                handler: (state, params) => params,
            }});

            api.setState = (replacement) => {
                if (isFunction(replacement)) {
                    api.act('SET_STATE', replacement(deepCopy(_state)));
                    return;
                }
                api.act('SET_STATE', replacement);
            };

            if (options.modules.history) {
                api.undo = () => {
                    api.act('UNDO');
                };

                api.redo = () => {
                    api.act('REDO');
                };
            }
        } else {
            assert(!options.modules.history, 'app : cannot use history blob without the state module', options);
            api.setState = (replacement) => {
                if (isFunction(replacement)) {
                    exec({state: replacement(deepCopy(_state))});
                    return;
                }
                exec({state: replacement});
            };
        }

        if (options.modules.router) {
            api.redirect = (path, params) => {
                exec({redirect: {path, params}});
            };

            api.show = (path, params) => {
                exec({show: {path, params}});
            };

            api.register = (path, builder) => {
                if (isFunction(path)) {
                    use({builder: path()});
                    return;
                }
                use({route: {
                    path,
                    callback: (params) => {
                        use({builder: builder(params)});
                    },
                }});
            };
        } else {
            api.register = (builder) => {
                use({builder: builder()});
                return;
            };
        }

        return Object.assign(api.register, api);
    };

    if (isBrowser()) {
        okwolo.kit = options.kit;
        if (!isDefined(window.okwolo)) {
            window.okwolo = okwolo;
        }
        window.okwolo[options.kit] = okwolo;
    }

    return okwolo;
};

module.exports = core;
