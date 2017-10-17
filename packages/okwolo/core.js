'use strict';

const {isFunction, isDefined, isObject, assert, isBrowser, makeBus} = require('@okwolo/utils')();

// version cannot be taken from package.json because environment is not guaranteed.
const version = '1.3.0';

const core = ({modules, options}) => {
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

        let primary = () => {};

        // the api function will contain all the exposed functions/variables.
        const api = (...args) => {
            return primary(...args);
        };

        api.emit = emit;
        api.use = use;

        use.on('api', (_api) => {
            assert(isObject(_api), 'core.use.api : additional api is not an object', _api);
            Object.assign(api, _api);
        });

        use.on('primary', (_primary) => {
            assert(isFunction(_primary), 'core.use.primary : primary is not a function', _primary);
            primary = _primary;
        });

        // each module is instantiated.
        modules.forEach((_module) => {
            _module(api, _window);
        });

        // target is used if it is defined, but this step can be deferred
        // if it is not convenient to pass the target on app creation.
        if (isDefined(target)) {
            use({target});
        }

        return api;
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
