'use strict';

// @listens blob.api
// @listens blob.primary

const {
    assert,
    is,
    isBrowser,
    makeBus,
    makeUse,
} = require('./utils');

// version not taken from package.json to avoid including the whole file
// in the un-minified bundle. value is checked to be consistent in a
// unit test.
const version = '3.4.5';

module.exports = (config = {}) => {
    const {modules = [], options = {}} = config;
    assert(is.array(modules), 'core : passed modules must be an array');
    assert(is.object(options), 'core : passed options must be an object');

    // both arguments are optional or can be left undefined, except when the
    // kit options require the browser, but the window global is not defined.
    const okwolo = (target, global) => {
        if (options.browser) {
            // global defaults to browser environment's window
            if (!is.defined(global)) {
                assert(isBrowser(), 'app : must be run in a browser environment');
                global = window;
            }
        }

        // primary function will be called when app is called. It is stored
        // outside of the app function so that it can be replaced without
        // re-creating the app instance.
        let primary = () => {};

        // the api will be added to this variable. It is also returned by the
        // enclosing function.
        const app = (...args) => {
            return primary(...args);
        };

        const {on, send} = makeBus();
        const use = makeUse(send, {});

        Object.assign(app, {on, send, use});

        app.on('blob.api', (api, override) => {
            assert(is.object(api), 'on.blob.api : additional api is not an object', api);
            Object.keys(api).forEach((key) => {
                if (!override) {
                    assert(!app[key], `on.blob.api : cannot add key "${key}" because it is already defined`);
                }
                app[key] = api[key];
            });
        });

        app.on('blob.primary', (_primary) => {
            assert(is.function(_primary), 'on.blob.primary : primary is not a function', _primary);
            primary = _primary;
        });

        // each module is instantiated on the app.
        modules.forEach((_module) => {
            _module({
                on: app.on,
                send: app.send,
            }, global);
        });

        // target is used if it is defined, can be done later if
        // it is not convenient to pass the target on app creation.
        if (is.defined(target)) {
            app.send('blob.target', target);
        }

        return app;
    };

    // okwolo attempts to define itself globally and includes information about
    // the version number and kit name. note that different kits can coexist,
    // but not two versions of the same kit.
    if (isBrowser()) {
        okwolo.kit = options.kit;
        okwolo.version = version;
        if (!is.defined(window.okwolo)) {
            window.okwolo = okwolo;
        }
        window.okwolo[options.kit] = okwolo;
    }

    return okwolo;
};
