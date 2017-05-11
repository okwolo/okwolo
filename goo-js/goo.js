const dom = require('goo-dom');
const state = require('goo-state');
const router = require('goo-router');
const history = require('goo-history')();
const {isFunction, assert, deepCopy} = require('goo-utils')();

const goo = (rootElement, _state = {__unset__: true}, _window = window) => {
    const domHandler = dom(_window, rootElement);
    const stateHandler = state();
    const routeHandler = router(_window);

    _state = deepCopy(_state);

    // forwarding use calls
    const use = (blob) => {
        return [domHandler, stateHandler, routeHandler]
            .map((g) => g.use(blob));
    };

    // adding blobs
    [history]
        .forEach((b) => use(b));

    // add watcher to keep track of current state
    use({watcher:
        (newState) => _state = newState,
    });

    // add watcher to update dom
    use({watcher:
        (newState) => use({state: newState}),
    });

    // add action to override state
    use({action: {
        type: '__OVERRIDE__',
        target: [],
        handler: (target, params) => params,
    }});

    // adding currentState and forwarding act calls
    const act = (type, params) => {
        assert(!(_state && _state.__unset__) || type === '__OVERRIDE__', 'cannot act on state before it has been set');
        stateHandler.act(_state, type, params);
    };

    // override state
    const setState = (replacement) => {
        act('__OVERRIDE__', isFunction(replacement)
            ? replacement(deepCopy(_state))
            : replacement);
    };

    // register a route/controller combo
    const register = (path, builder) => {
        if (isFunction(path)) {
            builder = path;
            path = '';
        }
        use({route: {
            path: path,
            callback: (params) => {
                const _builder = (newState) => builder(newState, params);
                use({builder: _builder});
            },
        }});
    };

    // making it easier to use undo/redo
    const undo = () => {
        act('UNDO', {});
    };
    const redo = () => {
        act('REDO', {});
    };

    const getState = () => {
        assert(!(_state && _state.__unset__), 'cannot get state before it has been set');
        return deepCopy(_state);
    };

    const update = () => {
        use({state: _state});
    };

    return Object.assign(register, {
        setState: setState,
        s: setState,
        getState: getState,
        g: getState,
        redirect: routeHandler.redirect,
        r: routeHandler.redirect,
        act: act,
        a: act,
        use: use,
        update: update,
        u: update,
        undo: undo,
        redo: redo,
        _: {},
    });
};

// making goo function available as an import or in the global window object
if (typeof module !== 'undefined' && module.exports) {
    module.exports = goo;
}
if (!!window) {
    window.goo = goo;
}
