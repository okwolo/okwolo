'use strict';

const {
    assert,
    isArray,
    isBrowser,
    isDefined,
    isFunction,
    isObject,
    isString,
} = require('./utils');

// version not taken from package.json to avoid including the whole file
// in the unminified bundle.
const version = '3.3.0-rc.1';

const makeBus = () => {
    // stores handlers for each event key.
    const handlers = {};
    // stores names from named events to enforce uniqueness.
    const names = {};

    // attaches a handler to a specific event key.
    const on = (type, handler) => {
        assert(isString(type), 'on : handler type is not a string', type);
        assert(isFunction(handler), 'on : handler is not a function', handler);
        if (!isDefined(handlers[type])) {
            handlers[type] = [];
        }
        handlers[type].push(handler);
    };

    const send = (type, ...args) => {
        assert(isString(type), 'send : event type is not a string', type);
        const eventHandlers = handlers[type];
        // events that do not match any handlers are ignored silently.
        if (!isDefined(eventHandlers)) {
            return;
        }
        for (let i = 0; i < eventHandlers.length; ++i) {
            eventHandlers[i](...args);
        }
    };

    const use = (blob, ...args) => {
        // scopes event type to the blob namespace.
        if (isString(blob)) {
            send(`blob.${blob}`, ...args);
            return;
        }

        assert(isObject(blob), 'use : blob is not an object', blob);

        const {name} = blob;
        if (isDefined(name)) {
            assert(isString(name), 'utils.bus : blob name is not a string', name);
            // early return if the name has already been seen.
            if (isDefined(names[name])) {
                return;
            }
            names[name] = true;
        }

        // calling send for each blob key.
        Object.keys(blob).forEach((key) => {
            send(`blob.${key}`, blob[key]);
        });
    };

    return {on, send, use};
};

module.exports = (config = {}) => {
    const {modules = [], options = {}} = config;
    assert(isArray(modules), 'core : passed modules must be an array');
    assert(isObject(options), 'core : passed options must be an object');

    // both arguments are optional or can be left undefined, except when the
    // kit options require the browser, but the window global is not defined.
    const okwolo = (target, global) => {
        if (options.browser) {
            // global defaults to browser env's window
            if (!isDefined(global)) {
                assert(isBrowser(), 'app : must be run in a browser environment');
                global = window;
            }
        }

        // primary function will be called when app is called. It is stored
        // outside of the app function so that it can be replaced without
        // re-creating the app instance.
        let primary = () => {};

        // the api will be added to this variable. It is also returned by the
        // enclosing functionion.
        const app = (...args) => {
            return primary(...args);
        };

        Object.assign(app, makeBus());

        app.on('blob.api', (api, override) => {
            assert(isObject(api), 'on.blob.api : additional api is not an object', api);
            Object.keys(api).forEach((key) => {
                if (!override) {
                    assert(!app[key], `on.blob.api : cannot add key "${key}" because it is already defined`);
                }
                app[key] = api[key];
            });
        });

        app.on('blob.primary', (_primary) => {
            assert(isFunction(_primary), 'on.blob.primary : primary is not a function', _primary);
            primary = _primary;
        });

        // each module is instantiated on the app.
        modules.forEach((_module) => {
            _module({
                on: app.on,
                send: app.send,
            }, global);
        });

        // target is used if it is defined, but this step can be deferred
        // if it is not convenient to pass the target on app creation.
        if (isDefined(target)) {
            app.use('target', target);
        }

        return app;
    };

    // okwolo attempts to define itself globally and includes information about
    // the version number and kit name. note that different kits can coexist,
    // but not two versions of the same kit.
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
