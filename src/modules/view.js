'use strict';

const {assert, isDefined, isFunction} = require('../utils')();

module.exports = ({emit, use}) => {
    let target;
    let builder;
    let build;
    let prebuild;
    let postbuild;
    let draw;
    let update;

    // stores an object returned by the draw and update functions. Since it is
    // also passed as an argument to update, it is convenient to store some
    // information about the current application's view in this variable.
    let view;

    // a copy of the state must be kept so that the view can be re-computed as
    // soon as any part of the rendering pipeline is modified.
    let state;

    // generates an object representing the view from the output of the builder.
    // note that it requires both the builder and the build functions to be
    // defined in order to complete successfully. they must be checked before
    // calling this function.
    const create = (state) => {
        let temp = builder(state);
        if (prebuild) {
            temp = prebuild(temp);
        }
        temp = build(temp);
        if (postbuild) {
            temp = postbuild(temp);
        }
        return temp;
    };

    use.on('target', (_target) => {
        target = _target;
        emit({update: true});
    });

    use.on('builder', (_builder) => {
        assert(isFunction(_builder), 'view.use.builder : builder is not a function', _builder);
        builder = _builder;
        emit({update: false});
    });

    use.on('draw', (_draw) => {
        assert(isFunction(_draw), 'view.use.draw : new draw is not a function', _draw);
        draw = _draw;
        emit({update: true});
    });

    use.on('update', (_update) => {
        assert(isFunction(_update), 'view.use.update : new target updater is not a function', _update);
        update = _update;
        emit({update: false});
    });

    use.on('build', (_build) => {
        assert(isFunction(_build), 'view.use.build : new build is not a function', _build);
        build = _build;
        emit({update: false});
    });

    use.on('prebuild', (newPrebuild) => {
        assert(isFunction(newPrebuild), 'view.use.prebuild : new prebuild is not a function', newPrebuild);
        prebuild = newPrebuild;
        emit({update: false});
    });

    use.on('postbuild', (newPostbuild) => {
        assert(isFunction(newPostbuild), 'view.use.postbuild : new postbuild is not a function', newPostbuild);
        postbuild = newPostbuild;
        emit({update: false});
    });

    emit.on('state', (_state) => {
        assert(isDefined(_state), 'view.emit.state : new state is not defined', _state);
        state = _state;
        emit({update: false});
    });

    // tracks whether the app has been drawn. this information is used to
    // determing if the update or draw function should be called.
    let hasDrawn = false;

    // tracks whether there are enough pieces of the rendering pipeline to
    // succesfully create and render.
    let canDraw = false;

    // if the view has already been drawn, it is assumed that it can be updated
    // instead of redrawing again. the force argument can override this assumption
    // and require a redraw.
    emit.on('update', (force) => {
        // canDraw is saved to avoid doing the four checks on every update/draw.
        // it is assumed that once all four variables are set the first time, they
        // will never again be invalid. this should be enforced by the bus listeners.
        if (!canDraw) {
            if (isDefined(target) && isDefined(builder) && isDefined(state) && isDefined(build)) {
                canDraw = true;
            } else {
                return;
            }
        }
        if (!force && hasDrawn) {
            view = update(target, create(state), view);
            return;
        }
        view = draw(target, create(state));
        hasDrawn = true;
    });

    // the only functionality from the dom module that is directly exposed
    // is the update event.
    use({api: {
        update: () => emit({update: false}),
    }});

    // primary functionality will be to replace buider. this is overwritten
    // by router modules to more easily associate routes to builders.
    use({primary: (init) => use({builder: init()})});
};
