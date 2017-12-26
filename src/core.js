'use strict';

const {isFunction, isDefined, isObject, assert, isBrowser, makeBus} = require('./utils')();

// version cannot be taken from package.json because environment is not guaranteed.
const version = '2.0.1';

module.exports = ({modules = [], options = {}}) => {
    // if it is needed to define the window but not yet add a target, the first
    // argument can be set to undefined.
    const okwolo = (target, global) => {
        // if the kit requires the browser api, there must be a window object in
        // scope or a window object must be injected as argument.
        if (options.browser) {
            if (!isDefined(global)) {
                assert(isBrowser(), 'app : must be run in a browser environment');
                global = window;
            }
        }

        // primary function will be called when app is called, it is stored
        // outside of the app function so that it can be replaced after the
        // creation of the app object without breaking all references to app.
        let primary = () => {};

        // the api will be added to the app function, it is returned when a
        // new app is created.
        const app = (...args) => {
            return primary(...args);
        };

        app.emit = makeBus();
        app.use = makeBus();

        app.use.on('api', (api) => {
            assert(isObject(api), 'core.use.api : additional api is not an object', api);
            Object.assign(app, api);
        });

        app.use.on('primary', (_primary) => {
            assert(isFunction(_primary), 'core.use.primary : primary is not a function', _primary);
            primary = _primary;
        });

        // each module is instantiated.
        modules.forEach((_module) => {
            _module({
                emit: app.emit,
                use: app.use,
            }, global);
        });

        // target is used if it is defined, but this step can be deferred
        // if it is not convenient to pass the target on app creation.
        if (isDefined(target)) {
            app.use({target});
        }

        return app;
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
