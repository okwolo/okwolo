'use strict';

const s = require('../../src/modules/state');

describe('state', () => {
    describe('emit', () => {
        describe('state', () => {
            it('should listen for state and update the internal one', () => {
                const app = o(s);
                const test = {a: 'test'};
                app.emit({state: test});
                expect(app.getState())
                    .toEqual(test);
            });
        });

        describe('read', () => {
            it('should directly pass the state to the callback', () => {
                const test = jest.fn();
                const app = o(s);
                const temp = {};
                app.emit({state: temp});
                app.emit({read: (state) => {
                    test();
                    expect(state)
                        .toBe(temp);
                }});
                expect(test)
                    .toHaveBeenCalled();
            });
        });
    });

    describe('use', () => {
        describe('api', () => {
            describe('getState', () => {
                it('should add getState to the api', () => {
                    const test = jest.fn();
                    const app = o(({use}) => {
                        use.on('api', (api) => {
                            test();
                            expect(api.getState)
                                .toBeInstanceOf(Function);
                        });
                    }, s);
                    expect(app.getState)
                        .toBeInstanceOf(Function);
                    expect(test)
                        .toHaveBeenCalled();
                });

                it('should fail if the state has not been set', () => {
                    const test = jest.fn();
                    const app = o(({emit}) => {
                        emit.on('state', test);
                    }, s);
                    expect(test)
                        .toHaveBeenCalledTimes(0);
                    expect(() => app.getState())
                        .toThrow(/get.*state.*set/);
                    app.emit({state: 0});
                    expect(test)
                        .toHaveBeenCalledTimes(1);
                    expect(() => app.getState())
                        .not.toThrow(Error);
                });

                it('should return a copy of the state', () => {
                    const app = o(s);
                    const test = {};
                    app.setState(test);
                    expect(app.getState())
                        .toEqual(test);
                    expect(app.getState())
                        .not.toBe(test);
                });
            });

            describe('setState', () => {
                it('should add setState to the api', () => {
                    const test = jest.fn();
                    const app = o(({use}) => {
                        use.on('api', (api) => {
                            test();
                            expect(api.setState)
                                .toBeInstanceOf(Function);
                        });
                    }, s);
                    expect(app.setState)
                        .toBeInstanceOf(Function);
                    expect(test)
                        .toHaveBeenCalled();
                });

                it('should call the handler with the new state', () => {
                    const test = jest.fn();
                    const app = o(s);
                    const temp = {test: true};
                    app.use({handler: test});
                    expect(test)
                        .toHaveBeenCalledTimes(0);
                    app.setState(temp);
                    expect(test)
                        .toHaveBeenCalledWith(temp);
                });

                it('should accept a replacement function', () => {
                    const test = jest.fn();
                    const app = o(s);
                    const temp = {test: true};
                    app.setState(temp);
                    app.setState((prevState) => {
                        expect(prevState)
                            .toEqual(temp);
                        expect(prevState)
                            .not.toBe(temp);
                        test();
                        return 'test';
                    });
                    expect(test)
                        .toHaveBeenCalled();
                    expect(app.getState())
                        .toBe('test');
                });
            });
        });

        describe('handler', () => {
            it('should not accept malformed handlers', () => {
                const app = o(s);
                expect(() => app.use({handler: true}))
                    .toThrow(/handler.*function/);
            });

            it('should use the handler to handle new states', () => {
                const test = jest.fn();
                const app = o(s);
                const temp = {test: true};
                app.use({handler: test});
                expect(test)
                    .toHaveBeenCalledTimes(0);
                app.setState(temp);
                expect(test)
                    .toHaveBeenCalledWith(temp);
            });

            it('should add a default handler which emits new state', () => {
                const test1 = jest.fn();
                const test2 = jest.fn();
                const app = o(({use}) => {
                    use.on('handler', test1);
                }, s);
                expect(test1)
                    .toHaveBeenCalled();
                app.emit.on('state', test2);
                app.setState({});
                expect(test2)
                    .toHaveBeenCalled();
            });
        });
    });
});
