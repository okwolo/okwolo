'use strict';

const {assert, isDefined, isFunction, deepCopy, bus} = require('@okwolo/utils')();

const createDefaultBlob = require('./blob');

const dom = (_target, _window) => {
    let draw = undefined;
    let update = undefined;
    let build = undefined;

    let prebuild = undefined;
    let postbuild = undefined;

    let vdom = undefined;
    let target = undefined;
    let builder = undefined;
    let state = undefined;

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
    const drawToTarget = () => {
        hasDrawn = true;
        vdom = draw(target, vdom);
    };

    const canDraw = (callback) => {
        if (isDefined(target) && isDefined(builder) && isDefined(state)) {
            callback();
        }
    };

    const use = bus();

    use.on('target', (newTarget) => {
        target = newTarget;
        canDraw(drawToTarget);
    });

    use.on('builder', (newBuilder) => {
        assert(isFunction(newBuilder), 'dom.replaceBuilder : builder is not a function', newBuilder);
        builder = newBuilder;
        canDraw(() => {
            if (!hasDrawn) {
                drawToTarget();
            }
            vdom = update(target, create(state), vdom);
        });
    });

    use.on('state', (newState) => {
        assert(isDefined(newState), 'dom.updateState : new state is not defined', newState);
        state = newState;
        canDraw(() => {
            if (!hasDrawn) {
                drawToTarget();
            }
            vdom = update(target, create(state), vdom);
        });
    });

    use.on('draw', (newDraw) => {
        assert(isFunction(newDraw), 'dom.replaceDraw : new draw is not a function', newDraw);
        draw = newDraw;
        canDraw(drawToTarget);
    });

    use.on('update', (newUpdate) => {
        assert(isFunction(newUpdate), 'dom.replaceUpdate : new target updater is not a function', newUpdate);
        update = newUpdate;
    });

    use.on('build', (newBuild) => {
        assert(isFunction(newBuild), 'dom.replaceBuild : new build is not a function', newBuild);
        build = newBuild;
        canDraw(() => update(target, create(state), vdom));
    });

    use.on('prebuild', (newPrebuild) => {
        assert(isFunction(newPrebuild), 'dom.replacePrebuild : new prebuild is not a function', newPrebuild);
        prebuild = newPrebuild;
        canDraw(() => update(target, create(state), vdom));
    });

    use.on('postbuild', (newPostbuild) => {
        assert(isFunction(newPostbuild), 'dom.replacePostbuild : new postbuild is not a function', newPostbuild);
        postbuild = newPostbuild;
        canDraw(() => update(target, create(state), vdom));
    });

    if (isDefined(_target)) {
        use({target: _target});
    }

    use(createDefaultBlob(_window));

    const setState = (_state) => {
        if (isFunction(_state)) {
            use({state: _state(state)});
            return;
        }
        use({state: _state});
    };

    const getState = () => {
        return deepCopy(state);
    };

    return Object.assign(
        (builder) => use({builder}),
        {use, setState, getState}
    );
};

module.exports = dom;
