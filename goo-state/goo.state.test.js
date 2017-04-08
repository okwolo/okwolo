const should = require('chai').should();

const state = require('./goo.state');

const testAction = (handler, target) => {
    return {
        action: {
            type: 'TEST',
            target: target || [],
            handler: handler || ((s) => s),
        },
    };
};

describe('goo-state', () => {
    it('should return a function', () => {
        state.should.be.a('function');
    });

    it('should have an act and use function', () => {
        const test = state();
        test.use.should.be.a('function');
        test.act.should.be.a('function');
    });
});

describe('use -> action', () => {
    it('should register and use well formed actions', () => {
        const stateManager = state();
        let test = false;
        stateManager.use(testAction((s) => {
            test = true;
            return s;
        }));
        stateManager.act({}, 'TEST');
        test.should.equal(true);
    });

    it('should reject malformed action types', () => {
        const stateManager = state();
        (() => {
            stateManager.use({
                action: {
                    type: true,
                    target: [],
                    handler: () => {
                        test = true;
                    },
                },
            });
        }).should.throw(Error, /goo[^]*type/);
    });

    it('should reject malformed action targets', () => {
        const stateManager = state();
        (() => {
            stateManager.use({
                action: {
                    type: 'TEST',
                    target: 'TEST',
                    handler: () => {
                        test = true;
                    },
                },
            });
        }).should.throw(Error, /goo[^]*target/);
    });

    it('should reject malformed action handlers', () => {
        const stateManager = state();
        (() => {
            stateManager.use({
                action: {
                    type: 'TEST',
                    target: [],
                    handler: true,
                },
            });
        }).should.throw(Error, /goo[^]*handler/);
    });

    it('should expect action handlers to return a defined value', () => {
        const stateManager = state();
        stateManager.use(testAction((s) => {}));
        (() => {
            stateManager.act({}, 'TEST');
        }).should.throw(Error, /result[^]*undefined/);
    });

    it('should be able to register multiple handlers for each type', () => {
        const stateManager = state();
        let test = 0;
        stateManager.use(testAction((s) => {
            test += 1;
            return s;
        }));
        stateManager.use(testAction((s) => {
            test += 2;
            return s;
        }));
        stateManager.act({}, 'TEST');
        test.should.equal(3);
    });
});

describe('use -> middleware', () => {
    it('should register and use well formed middleware', () => {
        const stateManager = state();
        let test = false;
        stateManager.use({
            middleware: (next, state, type, params) => {
                test = true;
                next();
            },
        });
        stateManager.use(testAction());
        stateManager.act({}, 'TEST');
        test.should.equal(true);
    });

    it('should reject malformed middleware', () => {
        const stateManager = state();
        (() => {
            stateManager.use({
                middleware: true,
            });
        }).should.throw(Error);
    });

    it('should be able to add and use multiple middlware', () => {
        const stateManager = state();
        let test = 0;
        stateManager.use({
            middleware: (next, state, type, params) => {
                test += 1;
                next();
            },
        });
        stateManager.use({
            middleware: (next, state, type, params) => {
                test += 2;
                next();
            },
        });
        stateManager.use(testAction());
        stateManager.act({}, 'TEST');
        test.should.equal(3);
    });
});

describe('use -> watcher', () => {
    it('should register and use well formed watcher', () => {
        const stateManager = state();
        let test = false;
        stateManager.use({
            watcher: (state, type, params) => {
                test = true;
            },
        });
        stateManager.use(testAction());
        stateManager.act({}, 'TEST');
        test.should.equal(true);
    });

    it('should reject malformed watchers', () => {
        const stateManager = state();
        (() => {
            stateManager.use({
                watcher: true,
            });
        }).should.throw(Error);
    });

    it('should be able to add and use multiple watchers', () => {
        const stateManager = state();
        let test = 0;
        stateManager.use({
            watcher: (state, type, params) => {
                test += 1;
            },
        });
        stateManager.use({
            watcher: (state, type, params) => {
                test += 2;
            },
        });
        stateManager.use(testAction());
        stateManager.act({}, 'TEST');
        test.should.equal(3);
    });
});

describe('act -> act', () => {
    it('should require both state and action parameters', () => {
        const stateManager = state();
        (() => {
            stateManager.act();
        }).should.throw(Error, /undefined state/);
        stateManager.use(testAction());
        (() => {
            stateManager.act({});
        }).should.throw(Error, /undefined type/);
    });

    it('should return undefined', () => {
        const stateManager = state();
        stateManager.use(testAction());
        should.not.exist(stateManager.act({}, 'TEST'));
    });

    it('should pass params to the action handler', () => {
        const stateManager = state();
        let test = null;
        stateManager.use(testAction((state, params) => {
            test = state + params;
            return state;
        }));
        stateManager.act('a', 'TEST', 'b');
        test.should.equal('ab');
    });

    it('should use a queue to prevent blobs from being added while actions are being performed', () => {
        const stateManager = state();
        let test = false;
        stateManager.use({
            middleware: () => {},
        });
        stateManager.use(testAction((s) => {
            test = true;
        }));
        stateManager.act({}, 'TEST');
        test.should.equal(false);
    });
});

describe('act -> apply', () => {
    it('should support async middleware and preserve their order', (done) => {
        const stateManager = state();
        let callOrder = [];
        let numTests = 2 + Math.floor(Math.random()*8);
        for(let i = 0; i < numTests; ++i) {
            stateManager.use({
                middleware: (next, state, type, params) => {
                    callOrder.push(i);
                    setTimeout(() => {
                        next();
                    }, Math.random()*numTests*2);
                },
            });
        }
        stateManager.use(testAction((s) => {
            for (let i = 0; i < numTests; ++i) {
                callOrder[i].should.equal(i);
            }
            done();
        }));
        stateManager.act({}, 'TEST');
    });

    it('should allow middleware to override all params', () => {
        const stateManager = state();
        let test = 0;
        stateManager.use({
            middleware: (next, state, type, params) => {
                next(++state, 'TEST', ++params);
            },
        });
        stateManager.use(testAction((state, params) => {
            test = state + params;
            return state;
        }));
        stateManager.act(0, '123', 3);
        test.should.equal(5);
    });

    it('should pass a copy of state to middleware', () => {
        const stateManager = state();
        let originalState = {};
        stateManager.use({
            middleware: (next, state) => {
                state.should.not.equal(originalState);
            },
        });
        stateManager.act(originalState, '123');
    });
});

describe('act -> execute', () => {
    it('should reject unknown actions', () => {
        const stateManager = state();
        (() => {
            stateManager.act({}, 'TEST');
        }).should.throw(Error, /action[^]*not[^]found/);
    });

    it('should pass a copy of state to the action handlers', () => {
        const stateManager = state();
        let originalState = {};
        stateManager.use(testAction((state) => {
            state.should.not.equal(originalState);
            return state;
        }));
        stateManager.act(originalState, 'TEST');
    });

    it('should provide the right target to the action handlers', () => {
        const stateManager = state();
        stateManager.use(testAction((target) => {
            target.should.equal('success!');
            return target;
        }, ['a', 'b', 'c']));
        stateManager.act({a: {b: {c: 'success!'}}}, 'TEST');
    });

    it('should reject unreachable targets', () => {
        const stateManager = state();
        stateManager.use(testAction((target) => {
            target.should.equal('success!');
        }, ['a', 'b']));
        (() => {
            stateManager.act({a: {}}, 'TEST');
        }).should.throw(Error, /target/);
    });

    it('should display the path to the unreachable target at the end of the error', () => {
        const stateManager = state();
        stateManager.use(testAction((target) => {
            target.should.equal('success!');
        }, ['a', 'b', 'c']));
        (() => {
            stateManager.act({a: {}}, 'TEST');
        }).should.throw(Error, /a\.b$/);
    });

    it('should call watchers after executing the action', () => {
        const stateManager = state();
        let test = 0;
        stateManager.use(testAction());
        stateManager.use({
            watcher: () => {
                test += 1;
            },
        });
        stateManager.use({
            watcher: () => {
                test += 2;
            },
        });
        stateManager.act({}, 'TEST');
        test.should.equal(3);
    });

    it('should pass the state, action type and params to the watchers', () => {
        const stateManager = state();
        stateManager.use(testAction());
        stateManager.use({
            watcher: (state, type, params) => {
                state.should.equal(1);
                type.should.equal('TEST');
                params.should.equal(2);
            },
        });
        stateManager.act(1, 'TEST', 2);
    });

    it('should pass the final arguments, after being manipulated by middlware', () => {
        const stateManager = state();
        stateManager.use(testAction());
        stateManager.use({
            middleware: (next) => {
                next('a', 'TEST', 'b');
            },
        });
        stateManager.use({
            watcher: (state, type, params) => {
                state.should.equal('a');
                type.should.equal('TEST');
                params.should.equal('b');
            },
        });
        stateManager.act(1, 2, 3);
    });

    it('should execute the action on the state', () => {
        const stateManager = state();
        stateManager.use(testAction(() => {
            return 0;
        }));
        stateManager.use({
            watcher: (state) => {
                state.should.equal(0);
            },
        });
        stateManager.act({}, 'TEST', 1);
    });

    it('should replace the action\'s target state, not the whole state', () => {
        const stateManager = state();
        stateManager.use(testAction(() => {
            return 0;
        }, ['subdirectory']));
        stateManager.use({
            watcher: (state) => {
                state.subdirectory.should.equal(0);
            },
        });
        stateManager.act({subdirectory: 1}, 'TEST', 1);
    });
});
