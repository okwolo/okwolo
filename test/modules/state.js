'use strict';

const {makeBus} = require('../../src/utils')();

const state = () => {
    const emit = makeBus();
    const use = makeBus();
    require('../../src/modules/state')({emit, use});
    require('../../src/modules/state.handler')({emit, use});
    const setState = (state) => {
        emit({
            act: {
                type: 'SET_STATE',
                params: state,
            },
        });
    };
    setState({});
    return {emit, use, setState};
};

const testAction = (handler, target) => {
    return {action: {
        type: 'TEST',
        target: target || [],
        handler: handler || ((s) => s),
    }};
};

describe('@okwolo/state', () => {
    describe('emit', () => {
        describe('act', () => {
            it('should require both action type', () => {
                const {emit} = state();
                expect(() => emit({act: {}}))
                    .toThrow(/type/);
            });

            it('should return undefined', () => {
                const {emit, use} = state();
                use(testAction());
                expect(emit({act: {type: 'TEST'}}))
                    .toBe(undefined);
            });

            it('should pass params to the action handler', () => {
                const {emit, use, setState} = state();
                const test = jest.fn();
                setState('a');
                use(testAction((state, params) => {
                    test(state + params);
                    return state;
                }));
                emit({act: {type: 'TEST', params: 'b'}});
                expect(test)
                    .toHaveBeenCalledWith('ab');
            });

            it('should use a queue to prevent blobs from being added while actions are being performed', () => {
                const {emit, use} = state();
                const test = jest.fn();
                use({middleware: () => {}});
                use(testAction(test));
                emit({act: {type: 'TEST'}});
                expect(test)
                    .toHaveBeenCalledTimes(0);
            });

            describe('apply', () => {
                it('should support async middleware and preserve their order', (done) => {
                    const {emit, use} = state();
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
                    emit({act: {type: 'TEST'}});
                });

                it('should allow middleware to override all params', () => {
                    const {emit, use, setState} = state();
                    const test = jest.fn();
                    setState(0);
                    use({middleware: (next, state, type, params) => {
                        next(++state, 'TEST', ++params);
                    }});
                    use(testAction((state, params) => {
                        test(state, params);
                        return state;
                    }));
                    emit({act: {type: 'NOT_TEST', params: 1}});
                    expect(test)
                        .toHaveBeenCalledWith(1, 2);
                });

                it('should pass a copy of state to middleware', () => {
                    const {emit, use, setState} = state();
                    let originalState = {};
                    setState(originalState);
                    use({middleware: (next, state) => {
                        expect(state)
                            .not.toBe(originalState);
                    }});
                    use(testAction());
                    emit({act: {type: 'TEST'}});
                });

                describe('emit', () => {
                    it('should reject unknown actions', () => {
                        const {emit} = state();
                        expect(() => emit({act: {type: 'TEST'}}))
                            .toThrow(/action[^]*not[^]found/);
                    });

                    it('should pass a copy of state to the action handlers', () => {
                        const {emit, use, setState} = state();
                        let originalState = {};
                        setState(originalState);
                        use(testAction((state) => {
                            expect(state)
                                .not.toBe(originalState);
                            return state;
                        }));
                        emit({act: {type: 'TEST'}});
                    });

                    it('should provide the right target to the action handlers', () => {
                        const {emit, use, setState} = state();
                        setState({a: {b: {c: 'success!'}}});
                        use(testAction((target) => {
                            expect(target)
                                .toBe('success!');
                            return target;
                        }, ['a', 'b', 'c']));
                        emit({act: {type: 'TEST'}});
                    });

                    it('should support dynamic action targets', () => {
                        const {emit, use, setState} = state();
                        setState({a: {b: {c: 'success!'}}});
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
                        emit({act: {type: 'TEST', params: {test: true}}});
                    });

                    it('should fail when dynamic targets are invalid', () => {
                        const {emit, use} = state();
                        use({action: {
                            type: 'TEST',
                            target: () => [{}],
                            handler: () => {},
                        }});
                        expect(() => emit({act: {type: 'TEST'}}))
                            .toThrow(/dynamic[^]*string/);
                    });

                    it('should reject unreachable targets', () => {
                        const {emit, use, setState} = state();
                        setState({a: {}});
                        use(testAction(null, ['a', 'b']));
                        expect(() => emit({act: {type: 'TEST'}}))
                            .toThrow(/target/);
                    });

                    it('should display the path to the unreachable target at the end of the error', () => {
                        const {emit, use, setState} = state();
                        setState({a: {}});
                        use(testAction(null, ['a', 'b', 'c']));
                        expect(() => emit({act: {type: 'TEST'}}))
                            .toThrow(/a\.b$/);
                    });

                    it('should call watchers after emituting the action', () => {
                        const {emit, use} = state();
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
                        emit({act: {type: 'TEST'}});
                        expect(test2)
                            .toHaveBeenCalled();
                        expect(test3)
                            .toHaveBeenCalled();
                    });

                    it('should pass the state, action type and params to the watchers', () => {
                        const {emit, use, setState} = state();
                        const test = jest.fn();
                        setState(1);
                        use(testAction());
                        use({watcher: test});
                        emit({act: {type: 'TEST', params: 2}});
                        expect(test)
                            .toHaveBeenCalledWith(1, 'TEST', 2);
                    });

                    it('should pass the final arguments, after being manipulated by middleware', () => {
                        const {emit, use, setState} = state();
                        const test = jest.fn();
                        setState(1);
                        use(testAction());
                        use({middleware: (next) => {
                            next('a', 'TEST', 'b');
                        }});
                        use({watcher: test});
                        emit({act: {type: '2', params: 3}});
                        expect(test)
                            .toHaveBeenCalledWith('a', 'TEST', 'b');
                    });

                    it('should emit the action on the state', () => {
                        const {emit, use} = state();
                        const test = jest.fn();
                        use(testAction(() => 0));
                        use({watcher: test});
                        emit({act: {type: 'TEST', params: 1}});
                        expect(test)
                            .toHaveBeenCalledWith(0, 'TEST', 1);
                    });

                    it('should replace the action\'s target state, not the whole state', () => {
                        const {emit, use, setState} = state();
                        const test = jest.fn();
                        setState({subdirectory: 1});
                        use(testAction(() => 0, ['subdirectory']));
                        use({watcher: test});
                        emit({act: {type: 'TEST', params: 1}});
                        expect(test)
                            .toHaveBeenCalledWith({subdirectory: 0}, 'TEST', 1);
                    });
                });
            });
        });
    });

    describe('use', () => {
        it('should register and use well formed actions', () => {
            const {emit, use} = state();
            const test = jest.fn();
            use(testAction((s) => {
                test();
                return s;
            }));
            emit({act: {type: 'TEST'}});
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
            const {emit, use} = state();
            use(testAction((s) => {}));
            expect(() => emit({act: {type: 'TEST'}}))
                .toThrow(/result[^]*undefined/);
        });

        it('should be able to register multiple handlers for each type', () => {
            const {emit, use} = state();
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
            emit({act: {type: 'TEST'}});
            expect(test1)
                .toHaveBeenCalled();
            expect(test2)
                .toHaveBeenCalled();
        });

        describe('middleware', () => {
            it('should register and use well formed middleware', () => {
                const {emit, use} = state();
                const test = jest.fn();
                use({
                    middleware: (next, state, type, params) => {
                        test();
                        next();
                    },
                });
                use(testAction());
                emit({act: {type: 'TEST'}});
                expect(test)
                    .toHaveBeenCalled();
            });

            it('should reject malformed middleware', () => {
                const {use} = state();
                expect(() => use({middleware: true}))
                    .toThrow(/middleware/);
            });

            it('should be able to add and use multiple middleware', () => {
                const {emit, use} = state();
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
                emit({act: {type: 'TEST'}});
                expect(test1)
                    .toHaveBeenCalled();
                expect(test2)
                    .toHaveBeenCalled();
            });
        });

        describe('watcher', () => {
            it('should register and use well formed watcher', () => {
                const {emit, use} = state();
                const test = jest.fn();
                use({watcher: test});
                use(testAction());
                emit({act: {type: 'TEST'}});
                expect(test)
                    .toHaveBeenCalled();
            });

            it('should reject malformed watchers', () => {
                const {use} = state();
                expect(() => use({watcher: true}))
                    .toThrow(/watcher/);
            });

            it('should be able to add and use multiple watchers', () => {
                const {emit, use} = state();
                const test = jest.fn();
                use({watcher: test});
                use({watcher: test});
                use(testAction());
                emit({act: {type: 'TEST'}});
                expect(test)
                    .toHaveBeenCalledTimes(2);
            });
        });
    });
});
