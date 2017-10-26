'use strict';

const history = () => {
    const api = {};
    const use = (blob) => {
        Object.assign(api, blob);
    };
    require('okwolo/src/modules/state.handler.history')({use, act: () => {}});
    return api;
};

const newState = (initialState) => {
    const temp = history();

    const undo = () => {
        let newState = temp.action[0].handler();
        temp.watcher(newState, 'UNDO');
        return newState;
    };

    const redo = () => {
        let newState = temp.action[1].handler();
        temp.watcher(newState, 'REDO');
        return newState;
    };

    const reset = () => {
        let newState = temp.action[2].handler();
        temp.watcher(newState, '__RESET__');
        return newState;
    };

    const setState = (newState, type) => {
        temp.watcher(newState, type || '----');
        return newState;
    };

    setState(initialState);

    return {undo, redo, reset, setState};
};

describe('@okwolo/history', () => {
    it('should return a blob with two actions and a watcher', () => {
        let test = history();
        expect(test.watcher)
            .toBeInstanceOf(Function);

        expect(test.action)
            .toBeInstanceOf(Array);

        expect(test.action[0])
            .toBeInstanceOf(Object);
        expect(test.action[0].target)
            .toEqual([]);
        expect(test.action[0].type)
            .toBe('UNDO');
        expect(test.action[0].handler)
            .toBeInstanceOf(Function);

        expect(test.action[1])
            .toBeInstanceOf(Object);
        expect(test.action[1].target)
            .toEqual([]);
        expect(test.action[1].type)
            .toBe('REDO');
        expect(test.action[1].handler)
            .toBeInstanceOf(Function);
    });

    it('should not undo if there is nothing to undo', () => {
        const state = newState('test');
        expect(state.undo())
            .toBe('test');
    });

    it('should not redo if there is nothing to redo', () => {
        const state = newState('test');
        expect(state.redo())
            .toBe('test');
    });

    it('should undo state changes', () => {
        const state = newState('test');
        state.setState('different state');
        expect(state.undo())
            .toBe('test');
    });

    it('should redo state changes', () => {
        const state = newState('test');
        state.setState('different state');
        expect(state.undo())
            .toBe('test');
        expect(state.redo())
            .toBe('different state');
    });

    it('should properly handle null/undefined states', () => {
        const state = newState('test');
        state.setState(null);
        state.setState(undefined);
        state.setState('test');
        expect(state.undo())
            .toBe(undefined);
        expect(state.undo())
            .toBe(null);
        state.undo();
        expect(state.redo())
            .toBe(null);
        expect(state.redo())
            .toBe(undefined);
    });

    it('should store at least 20 past states', () => {
        let n = 20;
        const state = newState(null);
        for (let i = 0; i <= n; ++i) {
            state.setState(i);
        }
        for (let i = 0; i <= n; ++i) {
            state.undo();
        }
        let last = state.undo();
        expect(last)
            .toBe(null);
        expect(last)
            .toBe(state.undo());
    });

    it('should not store the state when the action type has the ignore prefix', () => {
        const state = newState('test');
        state.setState(0, '*IGNORE');
        state.setState(1);
        expect(state.undo())
            .toBe('test');
    });

    it('should be able to reset the undo/redo stacks', () => {
        const state = newState('test');
        state.setState(0, 'UPDATE');
        state.reset();
        expect(state.undo())
            .toBe(0);
        state.setState(1, 'UPDATE');
        state.undo();
        state.reset();
        expect(state.redo())
            .toBe(0);
    });
});
