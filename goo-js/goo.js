const dom = require('../goo-dom/goo.dom');
const state = require('../goo-state/goo.state');
const router = require('../goo-router/goo.router');
const history = require('../goo-history/goo.history');
const {isFunction, assert} = require('../goo-utils/goo.utils');

const goo = (rootElement, _state = {__unset__: true}, _window = window) => {
    const domHandler = dom(_window, rootElement);
    const stateHandler = state();
    const routeHandler = router(_window);

    // forwarding use calls
    const use = (blob) => {
        [domHandler, stateHandler, routeHandler]
            .forEach((g) => g.use(blob));
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
        assert(!_state.__unset__, 'cannot act on state before it has been set');
        stateHandler.act(_state, type, params);
    };

    // override state
    const setState = (replacement) => {
        act('__OVERRIDE__', isFunction(replacement)
            ? replacement(_state)
            : replacement);
    };

    // register a route/controller combo
    const register = (pathOrBuilder, builder) => {
        if(isFunction(pathOrBuilder)) {
            use({builder: builder});
        } else {
            use({route: {
                path: pathOrBuilder,
                callback: (params) => {
                    const _builder = (newState) => builder(newState, params);
                    use({builder: _builder});
                },
            }});
        }
    };

    // making it easier to use undo/redo
    const undo = () => {
        act('UNDO', {});
    };
    const redo = () => {
        act('REDO', {});
    };

    return Object.assign(register, {
        redirect: routeHandler.redirect,
        setState: setState,
        undo: undo,
        redo: redo,
        act: act,
        use: use,
    });
};

// making goo function available as an import or in the global window object
if (typeof module !== 'undefined' && module.exports) {
    module.exports = goo;
} else {
    _window.goo = goo;
}
