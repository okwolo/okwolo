'use strict';

const {isFunction, isDefined, assert, deepCopy, isBrowser, makeBus} = require('@okwolo/utils')();

// version cannot be taken from package.json because environment is not guaranteed.
const version = '1.3.0';

const core = ({modules, blobs, options}) => {
    // if it is needed to define the window but not yet add a target, the first
    // argument can be set to undefined.
    const okwolo = (target, _window) => {
        // if the kit requires the browser api, there must be a window object in
        // scope or a window object must be injected as argument.
        if (options.browser) {
            if (!isDefined(_window)) {
                assert(isBrowser(), 'app : must be run in a browser environment');
                _window = window;
            }
        }

        const emit = makeBus();
        const use = makeBus();

        // the api object will contain all the exposed functions/variables.
        const api = {emit, use};

        // each module is instantiated.
        modules.forEach((_module) => {
            _module({emit, use}, _window);
        });

        // each blob is used.
        blobs.forEach((blob) => {
            use(blob(_window));
        });

        // reference to initial state is kept to be able to track whether it
        // has changed using strict equality.
        const initial = {};
        let _state = initial;

        // current state is monitored and stored.
        emit.on('state', (newState) => {
            _state = newState;
        });

        api.getState = () => {
            assert(_state !== initial, 'getState : cannot get state before it has been set');
            return deepCopy(_state);
        };

        // the only functionality from the dom module that is directly exposed
        // is the update event.
        if (options.modules.dom) {
            api.update = () => {
                emit({state: _state});
            };

            // target is used if it is defined, but this step can be deferred
            // if it is not convenient to pass the target on app creation.
            if (isDefined(target)) {
                use({target});
            }
        }

        if (options.modules.state) {
            api.act = (type, params) => {
                // the only action that does not need the state to have already
                // been changed is SET_STATE
                assert(_state !== initial || type === 'SET_STATE', 'act : cannot act on state before it has been set');
                emit({act: {state: _state, type, params}});
            };

            // action is used to override state in order to give visibility to
            // watchers and middleware.
            use({action: {
                type: 'SET_STATE',
                target: [],
                handler: (state, params) => params,
            }});

            api.setState = (replacement) => {
                if (isFunction(replacement)) {
                    api.act('SET_STATE', replacement(_state));
                    return;
                }
                api.act('SET_STATE', replacement);
            };
        } else {
            // new state is emitted directly instead of giving that responsibility
            // to the state module.
            api.setState = (replacement) => {
                if (isFunction(replacement)) {
                    emit({state: replacement(deepCopy(_state))});
                    return;
                }
                emit({state: replacement});
            };
        }

        if (options.modules.history) {
            assert(options.modules.state, 'app : cannot use history blob without the state module', options);

            api.undo = () => {
                api.act('UNDO');
            };

            api.redo = () => {
                api.act('REDO');
            };
        }

        if (options.modules.router) {
            api.redirect = (path, params) => {
                emit({redirect: {path, params}});
            };

            api.show = (path, params) => {
                emit({show: {path, params}});
            };

            // first argument can be a path string to register a route handler
            // or a function to directly use a builder.
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

        // the returned object contains all the keys added to the api object
        // but is also the register function.
        return Object.assign(api.register, api);
    };

    // okwolo attempts to define itself globally and includes information about
    // the version number and kit name. note that different kits can coexist,
    // but not two kits with the same name and different versions.
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
