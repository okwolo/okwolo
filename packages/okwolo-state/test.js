'use strict';

const {bus} = require('@okwolo/utils')();

const state = () => {
    const exec = bus();
    const use = bus();
    require('./')({exec, use});
    return {exec, use};
};

const testAction = (handler, target) => {
    return {action: {
        type: 'TEST',
        target: target || [],
        handler: handler || ((s) => s),
    }};
};

describe('@okwolo/state', () => {
    describe('exec', () => {
        describe('act', () => {
            it('should require both state and action arguments', () => {
                const {exec} = state();
                expect(() => exec({act: {}}))
                    .toThrow(/state/);
                expect(() => exec({act: {state: {}}}))
                    .toThrow(/type/);
            });

            it('should return undefined', () => {
                const {exec, use} = state();
                use(testAction());
                expect(exec({act: {state: {}, type: 'TEST'}}))
                    .toBe(undefined);
            });

            it('should pass params to the action handler', () => {
                const {exec, use} = state();
                const test = jest.fn();
                use(testAction((state, params) => {
                    test(state + params);
                    return state;
                }));
                exec({act: {state: 'a', type: 'TEST', params: 'b'}});
                expect(test)
                    .toHaveBeenCalledWith('ab');
            });

            it('should use a queue to prevent blobs from being added while actions are being performed', () => {
                const {exec, use} = state();
                const test = jest.fn();
                use({middleware: () => {}});
                use(testAction(test));
                exec({act: {state: {}, type: 'TEST'}});
                expect(test)
                    .toHaveBeenCalledTimes(0);
            });

            describe('apply', () => {
                it('should support async middleware and preserve their order', (done) => {
                    const {exec, use} = state();
                    let callOrder = [];
                    let numTests = 2 + Math.floor(Math.random()*8);
                    for (let i = 0; i < numTests; ++i) {
                        use({middleware: (next, state, type, params) => {
                            callOrder.push(i);
                            setTimeout(next, Math.random()*numTests*2);
                        }});
                    }
                    use(testAction((s) => {
                        for (let i = 0; i < numTests; ++i) {
                            expect(callOrder[i])
                                .toBe(i);
                        }
                        done();
                    }));
                    exec({act: {state: {}, type: 'TEST'}});
                });

                it('should allow middleware to override all params', () => {
                    const {exec, use} = state();
                    const test = jest.fn();
                    use({middleware: (next, state, type, params) => {
                        next(++state, 'TEST', ++params);
                    }});
                    use(testAction((state, params) => {
                        test(state, params);
                        return state;
                    }));
                    exec({act: {state: 0, type: 'NOT_TEST', params: 1}});
                    expect(test)
                        .toHaveBeenCalledWith(1, 2);
                });

                it('should pass a copy of state to middleware', () => {
                    const {exec, use} = state();
                    let originalState = {};
                    use({middleware: (next, state) => {
                        expect(state)
                            .not.toBe(originalState);
                    }});
                    use(testAction());
                    exec({act: {state: originalState, type: 'TEST'}});
                });

                describe('execute', () => {
                    it('should reject unknown actions', () => {
                        const {exec} = state();
                        expect(() => exec({act: {state: {}, type: 'TEST'}}))
                            .toThrow(/action[^]*not[^]found/);
                    });

                    it('should pass a copy of state to the action handlers', () => {
                        const {exec, use} = state();
                        let originalState = {};
                        use(testAction((state) => {
                            expect(state)
                                .not.toBe(originalState);
                            return state;
                        }));
                        exec({act: {state: originalState, type: 'TEST'}});
                    });

                    it('should provide the right target to the action handlers', () => {
                        const {exec, use} = state();
                        use(testAction((target) => {
                            expect(target)
                                .toBe('success!');
                            return target;
                        }, ['a', 'b', 'c']));
                        exec({act: {state: {a: {b: {c: 'success!'}}}, type: 'TEST'}});
                    });

                    it('should support dynamic action targets', () => {
                        const {exec, use} = state();
                        use({action: {
                            type: 'TEST',
                            target: (state, params) => {
                                expect(state)
                                    .toEqual({a: {b: {c: 'success!'}}});
                                expect(params)
                                    .toEqual({test: true});
                                return ['a', 'b', 'c'];
                            },
                            handler: (target) => {
                                expect(target)
                                    .toBe('success!');
                                return target;
                            },
                        }});
                        exec({act: {state: {a: {b: {c: 'success!'}}}, type: 'TEST', params: {test: true}}});
                    });

                    it('should fail when dynamic targets are invalid', () => {
                        const {exec, use} = state();
                        use({action: {
                            type: 'TEST',
                            target: () => [{}],
                            handler: () => {},
                        }});
                        expect(() => exec({act: {state: {}, type: 'TEST'}}))
                            .toThrow(/dynamic[^]*string/);
                    });

                    it('should reject unreachable targets', () => {
                        const {exec, use} = state();
                        use(testAction(null, ['a', 'b']));
                        expect(() => exec({act: {state: {a: {}}, type: 'TEST'}}))
                            .toThrow(/target/);
                    });

                    it('should display the path to the unreachable target at the end of the error', () => {
                        const {exec, use} = state();
                        use(testAction(null, ['a', 'b', 'c']));
                        expect(() => exec({act: {state: {a: {}}, type: 'TEST'}}))
                            .toThrow(/a\.b$/);
                    });

                    it('should call watchers after executing the action', () => {
                        const {exec, use} = state();
                        const test1 = jest.fn();
                        const test2 = jest.fn();
                        const test3 = jest.fn();
                        use(testAction((state) => {
                            test1();
                            return state;
                        }));
                        use({watcher: () => {
                            expect(test1)
                                .toHaveBeenCalled();
                            test2();
                        }});
                        use({watcher: () => {
                            expect(test1)
                                .toHaveBeenCalled();
                            test3();
                        }});
                        exec({act: {state: {}, type: 'TEST'}});
                        expect(test2)
                            .toHaveBeenCalled();
                        expect(test3)
                            .toHaveBeenCalled();
                    });

                    it('should pass the state, action type and params to the watchers', () => {
                        const {exec, use} = state();
                        const test = jest.fn();
                        use(testAction());
                        use({watcher: test});
                        exec({act: {state: 1, type: 'TEST', params: 2}});
                        expect(test)
                            .toHaveBeenCalledWith(1, 'TEST', 2);
                    });

                    it('should pass the final arguments, after being manipulated by middleware', () => {
                        const {exec, use} = state();
                        const test = jest.fn();
                        use(testAction());
                        use({middleware: (next) => {
                            next('a', 'TEST', 'b');
                        }});
                        use({watcher: test});
                        exec({act: {state: 1, type: '2', params: 3}});
                        expect(test)
                            .toHaveBeenCalledWith('a', 'TEST', 'b');
                    });

                    it('should execute the action on the state', () => {
                        const {exec, use} = state();
                        const test = jest.fn();
                        use(testAction(() => 0));
                        use({watcher: test});
                        exec({act: {state: {}, type: 'TEST', params: 1}});
                        expect(test)
                            .toHaveBeenCalledWith(0, 'TEST', 1);
                    });

                    it('should replace the action\'s target state, not the whole state', () => {
                        const {exec, use} = state();
                        const test = jest.fn();
                        use(testAction(() => 0, ['subdirectory']));
                        use({watcher: test});
                        exec({act: {state: {subdirectory: 1}, type: 'TEST', params: 1}});
                        expect(test)
                            .toHaveBeenCalledWith({subdirectory: 0}, 'TEST', 1);
                    });
                });
            });
        });
    });

    describe('use', () => {
        it('should register and use well formed actions', () => {
            const {exec, use} = state();
            const test = jest.fn();
            use(testAction((s) => {
                test();
                return s;
            }));
            exec({act: {state: {}, type: 'TEST'}});
            expect(test)
                .toHaveBeenCalled();
        });

        it('should reject malformed action types', () => {
            const {use} = state();
            expect(() => {
                use({action: {
                    type: true,
                    target: [],
                    handler: () => {},
                }});
            })
                .toThrow(/okwolo[^]*type/);
        });

        it('should reject malformed action targets', () => {
            const {use} = state();
            expect(() => {
                use({action: {
                    type: 'TEST',
                    target: 'TEST',
                    handler: () => {},
                }});
            })
                .toThrow(/okwolo[^]*target/);
        });

        it('should reject malformed action handlers', () => {
            const {use} = state();
            expect(() => {
                use({action: {
                    type: 'TEST',
                    target: [],
                    handler: true,
                }});
            })
                .toThrow(/okwolo[^]*handler/);
        });

        it('should expect action handlers to return a defined value', () => {
            const {exec, use} = state();
            use(testAction((s) => {}));
            expect(() => exec({act: {state: {}, type: 'TEST'}}))
                .toThrow(/result[^]*undefined/);
        });

        it('should be able to register multiple handlers for each type', () => {
            const {exec, use} = state();
            const test1 = jest.fn();
            const test2 = jest.fn();
            use(testAction((s) => {
                test1();
                return s;
            }));
            use(testAction((s) => {
                test2();
                return s;
            }));
            exec({act: {state: {}, type: 'TEST'}});
            expect(test1)
                .toHaveBeenCalled();
            expect(test2)
                .toHaveBeenCalled();
        });

        describe('middleware', () => {
            it('should register and use well formed middleware', () => {
                const {exec, use} = state();
                const test = jest.fn();
                use({
                    middleware: (next, state, type, params) => {
                        test();
                        next();
                    },
                });
                use(testAction());
                exec({act: {state: {}, type: 'TEST'}});
                expect(test)
                    .toHaveBeenCalled();
            });

            it('should reject malformed middleware', () => {
                const {use} = state();
                expect(() => use({middleware: true}))
                    .toThrow(/middleware/);
            });

            it('should be able to add and use multiple middleware', () => {
                const {exec, use} = state();
                const test1 = jest.fn();
                const test2 = jest.fn();
                use({middleware: (next, state, type, params) => {
                    test1();
                    next();
                }});
                use({middleware: (next, state, type, params) => {
                    test2();
                    next();
                }});
                use(testAction());
                exec({act: {state: {}, type: 'TEST'}});
                expect(test1)
                    .toHaveBeenCalled();
                expect(test2)
                    .toHaveBeenCalled();
            });
        });

        describe('watcher', () => {
            it('should register and use well formed watcher', () => {
                const {exec, use} = state();
                const test = jest.fn();
                use({watcher: test});
                use(testAction());
                exec({act: {state: {}, type: 'TEST'}});
                expect(test)
                    .toHaveBeenCalled();
            });

            it('should reject malformed watchers', () => {
                const {use} = state();
                expect(() => use({watcher: true}))
                    .toThrow(/watcher/);
            });

            it('should be able to add and use multiple watchers', () => {
                const {exec, use} = state();
                const test = jest.fn();
                use({watcher: test});
                use({watcher: test});
                use(testAction());
                exec({act: {state: {}, type: 'TEST'}});
                expect(test)
                    .toHaveBeenCalledTimes(2);
            });
        });
    });
});
