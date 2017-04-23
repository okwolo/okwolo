const dom = require('../goo-dom/goo.dom');
const state = require('../goo-state/goo.state');
const router = require('../goo-router/goo.router');
const history = require('../goo-history/goo.history');
const {isFunction} = require('../goo-utils/goo.utils');

(() => {
    const goo = (rootElement, _state = {}) => {
        const domHandler = dom();
        const stateHandler = state();
        const routeHandler = router();

        // forwarding use calls
        const use = (blob) => {
            [domHandler, stateHandler, routeHandler]
                .forEach((g) => g.use(blob));
        };

        // adding blobs
        [history]
            .forEach((b) => use(b));

        // watcher to keep track of current state
        use({watcher:
            (newState) => _state = newState,
        });

        // action to override state
        use({action: {
            type: '__OVERRIDE__',
            target: [],
            handler: (target, params) => params,
        }});

        // adding currentState before forwarding act calls
        const act = (type, params) => {
            stateHandler.act(_state, type, params);
        };

        // override state and unblock queue
        const setState = (replacement) => {
            act('__OVERRIDE__', isFunction(replacement)
                ? replacement(_state)
                : replacement);
            queue.done();
        };

        // keep track of current controller's update function to call it on state changes
        let updateController = () => {};
        use({watcher:
            (newState) => updateController(newState),
        });

        // register a route/controller combo
        const register = (path, builder) => {
            use({route: {
                path: path,
                callback: (params) => {
                    const _builder = (newState) => builder(newState, params);
                    updateController = use({controller: {
                        target: rootElement,
                        builder: _builder,
                        initialState: _state,
                    }})[0][0];
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

        return Object.assign(register, {
            setState: setState,
            redirect: routeHandler.redirect,
            undo: undo,
            redo: redo,
            use: use,
            act: act,
        });
    };

    // making goo function available as an import or in the global window object
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = goo;
    } else {
        window.goo = goo;
    }
})();
