'use strict';

const {assert, isDefined, isFunction} = require('@okwolo/utils')();

const dom = ({emit, use}, _window) => {
    let draw;
    let update;
    let build;

    let prebuild;
    let postbuild;

    let vdom;
    let target;
    let builder;
    let state;

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

    let hasDrawn = false;
    let canDraw = false;
    const drawToTarget = (force = !hasDrawn) => {
        if (!canDraw) {
            if (isDefined(target) && isDefined(builder) && isDefined(state)) {
                canDraw = true;
            } else {
                return;
            }
        }
        if (!force) {
            vdom = update(target, create(state), vdom);
            return;
        }
        vdom = draw(target, create(state));
        hasDrawn = true;
    };

    emit.on('state', (newState) => {
        assert(isDefined(newState), 'dom.updateState : new state is not defined', newState);
        state = newState;
        drawToTarget();
    });

    use.on('target', (newTarget) => {
        target = newTarget;
        drawToTarget(true);
    });

    use.on('builder', (newBuilder) => {
        assert(isFunction(newBuilder), 'dom.replaceBuilder : builder is not a function', newBuilder);
        builder = newBuilder;
        drawToTarget();
    });

    use.on('draw', (newDraw) => {
        assert(isFunction(newDraw), 'dom.replaceDraw : new draw is not a function', newDraw);
        draw = newDraw;
        drawToTarget(true);
    });

    use.on('update', (newUpdate) => {
        assert(isFunction(newUpdate), 'dom.replaceUpdate : new target updater is not a function', newUpdate);
        update = newUpdate;
        drawToTarget();
    });

    use.on('build', (newBuild) => {
        assert(isFunction(newBuild), 'dom.replaceBuild : new build is not a function', newBuild);
        build = newBuild;
        drawToTarget();
    });

    use.on('prebuild', (newPrebuild) => {
        assert(isFunction(newPrebuild), 'dom.replacePrebuild : new prebuild is not a function', newPrebuild);
        prebuild = newPrebuild;
        drawToTarget();
    });

    use.on('postbuild', (newPostbuild) => {
        assert(isFunction(newPostbuild), 'dom.replacePostbuild : new postbuild is not a function', newPostbuild);
        postbuild = newPostbuild;
        drawToTarget();
    });
};

module.exports = dom;
