const dom = require('../goo-dom/goo.dom');
const state = require('../goo-state/goo.state');
const router = require('../goo-router/goo.router');
const history = require('../goo-history/goo.history')();
const {isFunction, isObject, assert, deepCopy} = require('../goo-utils/goo.utils');

const goo = (rootElement, _state = {__unset__: true}, _window = window) => {
    const domHandler = dom(_window, rootElement);
    const stateHandler = state();
    const routeHandler = router(_window);

    _state = deepCopy(_state);

    // forwarding use calls
    const use = (blob) => {
        assert(isObject(blob), 'cannot use blobs that are not objects', blob);
        return [domHandler, stateHandler, routeHandler]
            .reduce((accumulator, g) => {
                accumulator.push(g.use(blob));
                return accumulator;
            }, []);
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

    return Object.assign(register, {
        setState: setState,
        getState: getState,
        redirect: routeHandler.redirect,
        act: act,
        use: use,
        undo: undo,
        redo: redo,
    });
};

// making goo function available as an import or in the global window object
if (typeof module !== 'undefined' && module.exports) {
    module.exports = goo;
}
if (!!window) {
    window.goo = goo;
}
