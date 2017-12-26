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

// version cannot be taken from package.json because environment is not guaranteed.
const version = '3.0.0';

const makeBus = () => {
    // stores arrays of handlers for each event key.
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
        if (!isArray(eventHandlers)) {
            return;
        }
        for (let i = 0; i < eventHandlers.length; ++i) {
            eventHandlers[i](...args);
        }
    };

    const use = (blob, ...args) => {
        // scopes event type to being a blob.
        if (isString(blob)) {
            send(`blob.${blob}`, ...args);
            return;
        }

        assert(isObject(blob), 'use : blob is not an object', blob);

        const {name} = blob;
        if (isDefined(name)) {
            assert(isString(name), 'utils.bus : blob name is not a string', name);
            // early return if the name has been used before.
            if (isDefined(names[name])) {
                return;
            }
            names[name] = true;
        }

        // sending all blob keys.
        const keys = Object.keys(blob);
        for (let i = 0; i < keys.length; ++i) {
            const key = keys[i];
            send(`blob.${key}`, blob[key]);
        }
    };

    return {on, send, use};
};

module.exports = ({modules = [], options = {}}) => {
    assert(isArray(modules), 'core : passed modules must be an array');
    assert(isObject(options), 'core : passed options must be an object');

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

        Object.assign(app, makeBus());

        app.on('blob.api', (api) => {
            assert(isObject(api), 'on.blob.api : additional api is not an object', api);
            Object.assign(app, api);
        });

        app.on('blob.primary', (_primary) => {
            assert(isFunction(_primary), 'on.blob.primary : primary is not a function', _primary);
            primary = _primary;
        });

        // each module is instantiated.
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
