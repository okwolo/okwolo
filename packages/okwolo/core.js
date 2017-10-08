'use strict';

const {isFunction, isDefined, assert, deepCopy, isBrowser, makeBus} = require('@okwolo/utils')();

const version = '1.3.0';

const core = ({modules, blobs, options}) => {
    const okwolo = (target, _window) => {
        if (options.browser) {
            if (!isDefined(_window)) {
                assert(isBrowser(), 'app : must be run in a browser environment');
                _window = window;
            }
        }

        const emit = makeBus();
        const use = makeBus();
        const api = {emit, use};

        modules.forEach((_module) => {
            _module({emit, use}, _window);
        });

        blobs.forEach((blob) => {
            use(blob(_window));
        });

        const initial = {};
        let _state = initial;

        emit.on('state', (newState) => {
            _state = newState;
        });

        api.getState = () => {
            assert(_state !== initial, 'getState : cannot get state before it has been set');
            return deepCopy(_state);
        };

        if (options.modules.dom) {
            api.update = () => {
                emit({state: _state});
            };

            if (isDefined(target)) {
                use({target});
            }
        }

        if (options.modules.state) {
            api.act = (type, params) => {
                assert(type === 'SET_STATE' || _state !== initial, 'act : cannot act on state before it has been set');
                emit({act: {state: _state, type, params}});
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
                    emit({state: replacement(deepCopy(_state))});
                    return;
                }
                emit({state: replacement});
            };
        }

        if (options.modules.router) {
            api.redirect = (path, params) => {
                emit({redirect: {path, params}});
            };

            api.show = (path, params) => {
                emit({show: {path, params}});
            };

            api.register = (path, builder) => {
                if (isFunction(path)) {
                    use({builder: path()});
                    return;
                }
                use({route: {
                    path,
                    handler: (params) => {
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
        okwolo.version = version;
        if (!isDefined(window.okwolo)) {
            window.okwolo = okwolo;
        }
        window.okwolo[options.kit] = okwolo;
    }

    return okwolo;
};

module.exports = core;
