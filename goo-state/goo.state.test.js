const should = require('chai').should();

const state = require('./goo.state');

describe('goo-state', function() {
    it('should return a function', function() {
        state.should.be.a('function');
    });

    it('should have an act and use function', function() {
        const test = state();
        test.use.should.be.a('function');
        test.act.should.be.a('function');
    });
});

describe('use -> action', function() {
    it('should register and use well formed actions', function() {
        const stateManager = state();
        let test = false;
        stateManager.use({
            action: {
                type: 'TEST',
                target: [],
                handler: function() {
                    test = true;
                },
            },
        });
        stateManager.act({}, 'TEST');
        test.should.equal(true);
    });

    it('should reject malformed action types', function() {
        const stateManager = state();
        (function() {
            stateManager.use({
                action: {
                    type: true,
                    target: [],
                    handler: function() {
                        test = true;
                    },
                },
            });
        }).should.throw(Error, /goo[^]*type/);
    });

    it('should reject malformed action targets', function() {
        const stateManager = state();
        (function() {
            stateManager.use({
                action: {
                    type: 'TEST',
                    target: 'TEST',
                    handler: function() {
                        test = true;
                    },
                },
            });
        }).should.throw(Error, /goo[^]*target/);
    });

    it('should reject malformed action handlers', function() {
        const stateManager = state();
        (function() {
            stateManager.use({
                action: {
                    type: 'TEST',
                    target: [],
                    handler: true,
                },
            });
        }).should.throw(Error, /goo[^]*handler/);
    });

    it('should be able to register multiple handlers for each type', function() {
        const stateManager = state();
        let test = 0;
        stateManager.use({
            action: {
                type: 'TEST',
                target: [],
                handler: function() {
                    test += 1;
                },
            },
        });
        stateManager.use({
            action: {
                type: 'TEST',
                target: [],
                handler: function() {
                    test += 2;
                },
            },
        });
        stateManager.act({}, 'TEST');
        test.should.equal(3);
    });
});

describe('use -> middleware', function() {
    it('should register and use well formed middleware', function() {
        const stateManager = state();
        let test = false;
        stateManager.use({
            middleware: function(next, state, type, params) {
                test = true;
                next();
            },
        });
        stateManager.use({
            action: {
                type: 'TEST',
                target: [],
                handler: function() {},
            },
        });
        stateManager.act({}, 'TEST');
        test.should.equal(true);
    });

    it('should reject malformed middleware', function() {
        const stateManager = state();
        (function() {
            stateManager.use({
                middleware: true,
            });
        }).should.throw(Error);
    });

    it('should be able to add and use multiple middlware', function() {
        const stateManager = state();
        let test = 0;
        stateManager.use({
            middleware: function(next, state, type, params) {
                test += 1;
                next();
            },
        });
        stateManager.use({
            middleware: function(next, state, type, params) {
                test += 2;
                next();
            },
        });
        stateManager.use({
            action: {
                type: 'TEST',
                target: [],
                handler: function() {},
            },
        });
        stateManager.act({}, 'TEST');
        test.should.equal(3);
    });
});

describe('use -> watcher', function() {
    it('should register and use well formed watcher', function() {
        const stateManager = state();
        let test = false;
        stateManager.use({
            watcher: function(state, type, params) {
                test = true;
            },
        });
        stateManager.use({
            action: {
                type: 'TEST',
                target: [],
                handler: function() {},
            },
        });
        stateManager.act({}, 'TEST');
        test.should.equal(true);
    });

    it('should reject malformed watchers', function() {
        const stateManager = state();
        (function() {
            stateManager.use({
                watcher: true,
            });
        }).should.throw(Error);
    });

    it('should be able to add and use multiple watchers', function() {
        const stateManager = state();
        let test = 0;
        stateManager.use({
            watcher: function(state, type, params) {
                test += 1;
            },
        });
        stateManager.use({
            watcher: function(state, type, params) {
                test += 2;
            },
        });
        stateManager.use({
            action: {
                type: 'TEST',
                target: [],
                handler: function() {},
            },
        });
        stateManager.act({}, 'TEST');
        test.should.equal(3);
    });
});

describe('act', function() {
    it('should require both state and action parameters', function() {
        const stateManager = state();
        (function() {
            stateManager.act();
        }).should.throw(Error, /undefined state/);
        stateManager.use({
            action: {
                type: 'TEST',
                target: [],
                handler: function() {},
            },
        });
        (function() {
            stateManager.act({});
        }).should.throw(Error, /undefined type/);
    });

    it('should reject unknown actions', function() {
        const stateManager = state();
        (function() {
            stateManager.act({}, 'TEST');
        }).should.throw(Error, /action[^]*not[^]found/);
    });

    it('should pass params to the action handler', function() {
        const stateManager = state();
        let test = null;
        stateManager.use({
            action: {
                type: 'TEST',
                target: [],
                handler: function(state, params) {
                    test = state + params;
                },
            },
        });
        stateManager.act('a', 'TEST', 'b');
        test.should.equal('ab');
    });

    it('should support async middleware and preserve their order', function(done) {
        const stateManager = state();
        let callOrder = [];
        let numTests = 2 + Math.floor(Math.random()*8);
        for(let i = 0; i < numTests; ++i) {
            stateManager.use({
                middleware: (next, state, type, params) => {
                    callOrder.push(i);
                    setTimeout(function() {
                        next();
                    }, Math.random()*numTests*2);
                },
            });
        }
        stateManager.use({
            action: {
                type: 'TEST',
                target: [],
                handler: function() {
                    for (let i = 0; i < numTests; ++i) {
                        callOrder[i].should.equal(i);
                    }
                    done();
                },
            },
        });
        stateManager.act({}, 'TEST');
    });
});
