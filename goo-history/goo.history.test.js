const should = require('chai').should();

const history = require('./goo.history');

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

    const setState = (newState) => {
        temp.watcher(newState, '----');
        return newState;
    };

    setState(initialState);

    return {undo, redo, setState};
};

describe('goo-history', () => {
    it('should return a blob with two actions and a watcher', () => {
        let test = history();
        test.watcher.should.be.a('function');
        test.action.should.be.an('array');
        test.action[0].should.be.an('object');
        test.action[0].target.should.be.an('array');
        test.action[0].target.length.should.equal(0);
        test.action[0].type.should.equal('UNDO');
        test.action[0].handler.should.be.a('function');
        test.action[1].should.be.an('object');
        test.action[1].target.should.be.an('array');
        test.action[1].target.length.should.equal(0);
        test.action[1].type.should.equal('REDO');
        test.action[1].handler.should.be.a('function');
    });

    it('should not undo if there is nothing to undo', () => {
        const state = newState('test');
        state.undo().should.equal('test');
    });

    it('should not redo if there is nothing to undo', () => {
        const state = newState('test');
        state.redo().should.equal('test');
    });

    it('should undo state changes', () => {
        const state = newState('test');
        state.setState('different state');
        state.undo().should.equal('test');
    });

    it('should redo state changes', () => {
        const state = newState('test');
        state.setState('different state');
        state.undo().should.equal('test');
        state.redo().should.equal('different state');
    });

    it('should properly handle null/undefined states', () => {
        const state = newState('test');
        state.setState(null);
        state.setState(undefined);
        state.setState('test');
        should.equal(state.undo(), undefined);
        should.equal(state.undo(), null);
        state.undo();
        should.equal(state.redo(), null);
        should.equal(state.redo(), undefined);
    });

    it('should store 20 past states', () => {
        let n = 20;
        const state = newState(null);
        for (let i = 0; i <= n; ++i) {
            state.setState(i);
        }
        for (let i = 0; i <= n; ++i) {
            state.undo();
        }
        let last = state.undo();
        should.equal(last, null);
        should.equal(last, state.undo());
    });
});
