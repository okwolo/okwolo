'use strict';

const state = require('./');

const testAction = (handler, target) => {
    return {action: {
        type: 'TEST',
        target: target || [],
        handler: handler || ((s) => s),
    }};
};

describe('goo-state', () => {
    it('should return a function', () => {
        expect(state)
            .toBeInstanceOf(Function);
    });

    it('should have an act and use function', () => {
        const test = state();
        expect(test.use)
            .toBeInstanceOf(Function);
        expect(test.act)
            .toBeInstanceOf(Function);
    });

    describe('use', () => {
        it('should return an array', () => {
            expect(state().use({}))
                .toBeInstanceOf(Array);
        });

        it('should register and use well formed actions', () => {
            const app = state();
            const test = jest.fn();
            app.use(testAction((s) => {
                test();
                return s;
            }));
            app.act({}, 'TEST');
            expect(test)
                .toHaveBeenCalled();
        });

        it('should reject malformed action types', () => {
            const app = state();
            expect(() => {
                app.use({action: {
                    type: true,
                    target: [],
                    handler: () => {},
                }});
            })
                .toThrow(/goo[^]*type/);
        });

        it('should reject malformed action targets', () => {
            const app = state();
            expect(() => {
                app.use({action: {
                    type: 'TEST',
                    target: 'TEST',
                    handler: () => {},
                }});
            })
                .toThrow(/goo[^]*target/);
        });

        it('should reject malformed action handlers', () => {
            const app = state();
            expect(() => {
                app.use({action: {
                    type: 'TEST',
                    target: [],
                    handler: true,
                }});
            })
                .toThrow(/goo[^]*handler/);
        });

        it('should expect action handlers to return a defined value', () => {
            const app = state();
            app.use(testAction((s) => {}));
            expect(() => app.act({}, 'TEST'))
                .toThrow(/result[^]*undefined/);
        });

        it('should be able to register multiple handlers for each type', () => {
            const app = state();
            const test1 = jest.fn();
            const test2 = jest.fn();
            app.use(testAction((s) => {
                test1();
                return s;
            }));
            app.use(testAction((s) => {
                test2();
                return s;
            }));
            app.act({}, 'TEST');
            expect(test1)
                .toHaveBeenCalled();
            expect(test2)
                .toHaveBeenCalled();
        });

        describe('middleware', () => {
            it('should register and use well formed middleware', () => {
                const app = state();
                const test = jest.fn();
                app.use({
                    middleware: (next, state, type, params) => {
                        test();
                        next();
                    },
                });
                app.use(testAction());
                app.act({}, 'TEST');
                expect(test)
                    .toHaveBeenCalled();
            });

            it('should reject malformed middleware', () => {
                const app = state();
                expect(() => app.use({middleware: true}))
                    .toThrow(/middleware/);
            });

            it('should be able to add and use multiple middleware', () => {
                const app = state();
                const test1 = jest.fn();
                const test2 = jest.fn();
                app.use({middleware: (next, state, type, params) => {
                    test1();
                    next();
                }});
                app.use({middleware: (next, state, type, params) => {
                    test2();
                    next();
                }});
                app.use(testAction());
                app.act({}, 'TEST');
                expect(test1)
                    .toHaveBeenCalled();
                expect(test2)
                    .toHaveBeenCalled();
            });
        });

        describe('watcher', () => {
            it('should register and use well formed watcher', () => {
                const app = state();
                const test = jest.fn();
                app.use({watcher: test});
                app.use(testAction());
                app.act({}, 'TEST');
                expect(test)
                    .toHaveBeenCalled();
            });

            it('should reject malformed watchers', () => {
                const app = state();
                expect(() => app.use({watcher: true}))
                    .toThrow(/watcher/);
            });

            it('should be able to add and use multiple watchers', () => {
                const app = state();
                const test = jest.fn();
                app.use({watcher: test});
                app.use({watcher: test});
                app.use(testAction());
                app.act({}, 'TEST');
                expect(test)
                    .toHaveBeenCalledTimes(2);
            });
        });
    });

    describe('act', () => {
        it('should require both state and action arguments', () => {
            const app = state();
            expect(() => app.act())
                .toThrow(/undefined state/);
            expect(() => app.act({}))
                .toThrow(/undefined type/);
        });

        it('should return undefined', () => {
            const app = state();
            app.use(testAction());
            expect(app.act({}, 'TEST'))
                .toBe(undefined);
        });

        it('should pass params to the action handler', () => {
            const app = state();
            const test = jest.fn();
            app.use(testAction((state, params) => {
                test(state + params);
                return state;
            }));
            app.act('a', 'TEST', 'b');
            expect(test)
                .toHaveBeenCalledWith('ab');
        });

        it('should use a queue to prevent blobs from being added while actions are being performed', () => {
            const app = state();
            const test = jest.fn();
            app.use({middleware: () => {}});
            app.use(testAction(test));
            app.act({}, 'TEST');
            expect(test)
                .toHaveBeenCalledTimes(0);
        });

        describe('apply', () => {
            it('should support async middleware and preserve their order', (done) => {
                const app = state();
                let callOrder = [];
                let numTests = 2 + Math.floor(Math.random()*8);
                for (let i = 0; i < numTests; ++i) {
                    app.use({middleware: (next, state, type, params) => {
                        callOrder.push(i);
                        setTimeout(next, Math.random()*numTests*2);
                    }});
                }
                app.use(testAction((s) => {
                    for (let i = 0; i < numTests; ++i) {
                        expect(callOrder[i])
                            .toBe(i);
                    }
                    done();
                }));
                app.act({}, 'TEST');
            });

            it('should allow middleware to override all params', () => {
                const app = state();
                const test = jest.fn();
                app.use({middleware: (next, state, type, params) => {
                    next(++state, 'TEST', ++params);
                }});
                app.use(testAction((state, params) => {
                    test(state, params);
                    return state;
                }));
                app.act(0, 'NOT_TEST', 1);
                expect(test)
                    .toHaveBeenCalledWith(1, 2);
            });

            it('should pass a copy of state to middleware', () => {
                const app = state();
                let originalState = {};
                app.use({middleware: (next, state) => {
                    expect(state)
                        .not.toBe(originalState);
                }});
                app.use(testAction());
                app.act(originalState, 'TEST');
            });

            describe('execute', () => {
                it('should reject unknown actions', () => {
                    const app = state();
                    expect(() => app.act({}, 'TEST'))
                        .toThrow(/action[^]*not[^]found/);
                });

                it('should pass a copy of state to the action handlers', () => {
                    const app = state();
                    let originalState = {};
                    app.use(testAction((state) => {
                        expect(state)
                            .not.toBe(originalState);
                        return state;
                    }));
                    app.act(originalState, 'TEST');
                });

                it('should provide the right target to the action handlers', () => {
                    const app = state();
                    app.use(testAction((target) => {
                        expect(target)
                            .toBe('success!');
                        return target;
                    }, ['a', 'b', 'c']));
                    app.act({a: {b: {c: 'success!'}}}, 'TEST');
                });

                it('should reject unreachable targets', () => {
                    const app = state();
                    app.use(testAction(null, ['a', 'b']));
                    expect(() => app.act({a: {}}, 'TEST'))
                        .toThrow(/target/);
                });

                it('should display the path to the unreachable target at the end of the error', () => {
                    const app = state();
                    app.use(testAction(null, ['a', 'b', 'c']));
                    expect(() => app.act({a: {}}, 'TEST'))
                        .toThrow(/a\.b$/);
                });

                it('should call watchers after executing the action', () => {
                    const app = state();
                    const test1 = jest.fn();
                    const test2 = jest.fn();
                    const test3 = jest.fn();
                    app.use(testAction((state) => {
                        test1();
                        return state;
                    }));
                    app.use({watcher: () => {
                        expect(test1)
                            .toHaveBeenCalled();
                        test2();
                    }});
                    app.use({watcher: () => {
                        expect(test1)
                            .toHaveBeenCalled();
                        test3();
                    }});
                    app.act({}, 'TEST');
                    expect(test2)
                        .toHaveBeenCalled();
                    expect(test3)
                        .toHaveBeenCalled();
                });

                it('should pass the state, action type and params to the watchers', () => {
                    const app = state();
                    const test = jest.fn();
                    app.use(testAction());
                    app.use({watcher: test});
                    app.act(1, 'TEST', 2);
                    expect(test)
                        .toHaveBeenCalledWith(1, 'TEST', 2);
                });

                it('should pass the final arguments, after being manipulated by middleware', () => {
                    const app = state();
                    const test = jest.fn();
                    app.use(testAction());
                    app.use({middleware: (next) => {
                        next('a', 'TEST', 'b');
                    }});
                    app.use({watcher: test});
                    app.act(1, 2, 3);
                    expect(test)
                        .toHaveBeenCalledWith('a', 'TEST', 'b');
                });

                it('should execute the action on the state', () => {
                    const app = state();
                    const test = jest.fn();
                    app.use(testAction(() => 0));
                    app.use({watcher: test});
                    app.act({}, 'TEST', 1);
                    expect(test)
                        .toHaveBeenCalledWith(0, 'TEST', 1);
                });

                it('should replace the action\'s target state, not the whole state', () => {
                    const app = state();
                    const test = jest.fn();
                    app.use(testAction(() => 0, ['subdirectory']));
                    app.use({watcher: test});
                    app.act({subdirectory: 1}, 'TEST', 1);
                    expect(test)
                        .toHaveBeenCalledWith({subdirectory: 0}, 'TEST', 1);
                });
            });
        });
    });
});
