'use strict';

// @fires   update       [view]
// @fires   blob.api     [core]
// @fires   blob.primary [core]
// @listens state
// @listens sync
// @listens update
// @listens blob.build
// @listens blob.builder
// @listens blob.draw
// @listens blob.target
// @listens blob.update

const {
    assert,
    isDefined,
    isFunction,
    makeQueue,
} = require('../utils');

module.exports = ({on, send}) => {
    let target;
    let builder;
    let build;
    let draw;
    let update;

    // stores an object returned by the draw and update functions. Since it is
    // also passed as an argument to update, it is convenient to store some
    // information about the current application's view in this variable.
    let view;

    // a copy of the state must be kept so that the view can be re-computed as
    // soon as any part of the rendering pipeline is modified.
    let state;

    on('blob.target', (_target) => {
        target = _target;
        send('update', true);
    });

    on('blob.builder', (_builder) => {
        assert(isFunction(_builder), 'on.blob.builder : builder is not a function', _builder);
        builder = _builder;
        send('update', false);
    });

    on('blob.draw', (_draw) => {
        assert(isFunction(_draw), 'on.blob.draw : new draw is not a function', _draw);
        draw = _draw;
        send('update', true);
    });

    on('blob.update', (_update) => {
        assert(isFunction(_update), 'on.blob.update : new target updater is not a function', _update);
        update = _update;
        send('update', false);
    });

    on('blob.build', (_build) => {
        assert(isFunction(_build), 'on.blob.build : new build is not a function', _build);
        build = _build;
        send('update', false);
    });

    on('state', (_state) => {
        assert(isDefined(_state), 'on.state : new state is not defined', _state);
        state = _state;
        send('update', false);
    });

    // tracks whether the app has been drawn. this information is used to
    // determining if the update or draw function should be called.
    let hasDrawn = false;

    // tracks whether there are enough pieces of the rendering pipeline to
    // successfully create and render.
    let canDraw = false;

    // logs an error if the view has not been drawn after the delay since
    // the first time it was called. the update event calls this function
    // each time it cannot draw.
    let delay = 3000;
    let waitTimer = null;
    let waiting = () => {
        if (waitTimer) {
            return;
        }
        waitTimer = setTimeout(() => {
            // formatting all blocking variables into an error message.
            const values = {builder, state, target};
            Object.keys(values)
                .forEach((key) => {
                    values[key] = values[key] ? 'ok' : 'waiting';
                });
            // assertion error in the timeout will not interrupt execution.
            assert(canDraw, `view : still waiting to draw after ${Math.round(delay/1000)}s`, values);
        }, delay);
    };

    // if the view has already been drawn, it is assumed that it can be updated
    // instead of redrawing again. the force argument can override this assumption
    // and require a redraw.
    on('update', (redraw) => {
        // canDraw is saved to avoid doing the four checks on every update/draw.
        // it is assumed that once all four variables are set the first time, they
        // will never again be invalid. this should be enforced by the bus listeners.
        if (!canDraw) {
            if (isDefined(target) && isDefined(builder) && isDefined(state)) {
                canDraw = true;
            } else {
                return waiting();
            }
        }

        // queue is passed to build to allow it to block component updates until the
        // view object in this module is updated. this is necessary because otherwise,
        // the sync event could fire with an old version of the view. calling the done
        // method on an empty queue does not produce an error, so the builder has no
        // obligation to use it.
        const queue = makeQueue();
        if (redraw || !hasDrawn) {
            view = draw(target, build(builder(state), queue));
            hasDrawn = true;
            queue.done();
            return;
        }
        view = update(target, build(builder(state), queue), [], view);
        queue.done();
    });

    // message which allows for scoped updates. since the successor argument is
    // not passed through the build/builder pipeline, its use is loosely
    // restricted to the build module (which should have a reference to itself).
    on('sync', (address, successor, identity) => {
        assert(hasDrawn, 'view.sync : cannot sync component before app has drawn');
        view = update(target, successor, address, view, identity);
    });

    // the only functionality from the dom module that is directly exposed
    // is the update event.
    send('blob.api', {
        update: () => {
            global.console.warn('@okwolo.update : function will be deprecated in next major version (4.x)');
            send('update', false);
        },
    });

    // primary functionality will be to replace builder. this is overwritten
    // by router modules to more easily associate routes to builders.
    send('blob.primary', (init) => {
        // calling init for consistency with the router primary which passes
        // route params to init;
        send('blob.builder', init());
    });
};
