'use strict';

const {assert, isDefined, isFunction, deepCopy, blobHandler} = require('../goo-utils')();

const createDefaultBlob = require('./blob');

const dom = (_target, _window = window) => {
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

    const replaceDraw = (newDraw) => {
        assert(isFunction(newDraw), '@goo.dom.replaceDraw : new draw is not a function', newDraw);
        draw = newDraw;
        canDraw(drawToTarget);
    };

    const replaceUpdate = (newUpdate) => {
        assert(isFunction(newUpdate), '@goo.dom.replaceUpdate : new target updater is not a function', newUpdate);
        update = newUpdate;
    };

    const replaceBuild = (newBuild) => {
        assert(isFunction(newBuild), '@goo.dom.replaceBuild : new build is not a function', newBuild);
        build = newBuild;
        canDraw(() => update(target, create(state), vdom));
    };

    const replacePrebuild = (newPrebuild) => {
        assert(isFunction(newPrebuild), '@goo.dom.replacePrebuild : new prebuild is not a function', newPrebuild);
        prebuild = newPrebuild;
        canDraw(() => update(target, create(state), vdom));
    };

    const replacePostbuild = (newPostbuild) => {
        assert(isFunction(newPostbuild), '@goo.dom.replacePostbuild : new postbuild is not a function', newPostbuild);
        postbuild = newPostbuild;
        canDraw(() => update(target, create(state), vdom));
    };

    const replaceTarget = (newTarget) => {
        target = newTarget;
        canDraw(drawToTarget);
    };

    const replaceBuilder = (newBuilder) => {
        assert(isFunction(newBuilder), '@goo.dom.replaceBuilder : builder is not a function', newBuilder);
        builder = newBuilder;
        canDraw(() => {
            if (!hasDrawn) {
                drawToTarget();
            }
            vdom = update(target, create(state), vdom);
        });
    };

    const updateState = (newState) => {
        assert(isDefined(newState), '@goo.dom.updateState : new state is not defined', newState);
        state = newState;
        canDraw(() => {
            if (!hasDrawn) {
                drawToTarget();
            }
            vdom = update(target, create(state), vdom);
        });
    };

    const use = (blob) => {
        // making sure only one value is given to each handler
        const newBlob = {};
        Object.keys(blob).map((b) => newBlob[b] = [blob[b]]);
        if (isDefined(blob.name)) {
            newBlob.name = blob.name;
        }
        return blobHandler({
            target: replaceTarget,
            builder: replaceBuilder,
            state: updateState,
            draw: replaceDraw,
            update: replaceUpdate,
            build: replaceBuild,
            prebuild: replacePrebuild,
            postbuild: replacePostbuild,
        }, newBlob);
    };

    if (isDefined(_target)) {
        use({target: _target});
    }

    use(createDefaultBlob(_window));

    const setState = (_state) => {
        use({state: isFunction(_state)
            ? _state(state)
            : _state});
    };

    const getState = () => {
        return deepCopy(state);
    };

    return Object.assign(replaceBuilder, {use, setState, getState});
};

module.exports = dom;
