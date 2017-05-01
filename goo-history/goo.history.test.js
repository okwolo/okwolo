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
});
