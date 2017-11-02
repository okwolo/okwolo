'use strict';

const r = require('../../src/modules/router');
const rr = require('../../src/modules/router.register');
const rf = require('../../src/modules/router.fetch');

describe('router', () => {
    beforeEach(() => {
        window.history.pushState({}, '', '/');
    });

    describe('emit', () => {
        describe('redirect', () => {
            it('should reject malformed paths', () => {
                const {emit} = o(r);
                expect(() => emit({redirect: undefined}))
                    .toThrow(/path/);
            });

            it('should accept no params', () => {
                const {emit} = o(r, rf);
                expect(() => emit({redirect: {path: '/', params: undefined}}))
                    .not.toThrow(Error);
            });

            it('should change the pathname', () => {
                const {emit} = o(r, rf);
                emit({redirect: {path: '/test/xyz'}});
                expect(window.location.pathname)
                    .toBe('/test/xyz');
            });

            it('should use a queue', () => {
                const test = jest.fn();
                const {emit, use} = o(r, rr, rf);
                use({route: {
                    path: '/xxx',
                    handler: () => {
                        emit({show: {path: '/test'}});
                        test();
                    },
                }});
                use({route: {
                    path: '/test',
                    handler: () => {
                        expect(test)
                            .toHaveBeenCalled();
                    },
                }});
                emit({redirect: {path: '/xxx'}});
            });

            it('should accumulate params and pass them to the handler', () => {
                const test = jest.fn();
                const {emit, use} = o(r, rr, rf);
                use({route: {
                    path: '/user/:id/fetch/:field',
                    handler: test,
                }});
                emit({redirect: {path: '/user/123/fetch/name'}});
                expect(test)
                    .toHaveBeenCalledWith({id: '123', field: 'name'});
            });
        });

        describe('show', () => {
            it('should reject malformed paths', () => {
                const {emit} = o(r);
                expect(() => emit({show: undefined}))
                    .toThrow(/path/);
            });

            it('should accept no params', () => {
                const {emit} = o(r, rf);
                emit({show: {path: '/', params: undefined}});
            });

            it('should not change the pathname', () => {
                const {emit} = o(r, rf);
                emit({show: {path: '/test/xyz'}});
                expect(window.location.pathname)
                    .not.toBe('/test/xyz');
            });

            it('should use a queue', () => {
                const test = jest.fn();
                const {emit, use} = o(r, rr, rf);
                use({route: {
                    path: '/xxx',
                    handler: () => {
                        emit({redirect: {path: '/test'}});
                        test();
                    },
                }});
                use({route: {
                    path: '/test',
                    handler: () => {
                        expect(test)
                            .toHaveBeenCalled();
                    },
                }});
                emit({show: {path: '/xxx'}});
            });

            it('should accumulate params and pass them to the handler', () => {
                const test = jest.fn();
                const {emit, use} = o(r, rr, rf);
                use({route: {
                    path: '/user/:id/fetch/:field',
                    handler: test,
                }});
                emit({show: {path: '/user/123/fetch/name'}});
                expect(test)
                    .toHaveBeenCalledWith({id: '123', field: 'name'});
            });
        });
    });

    describe('use', () => {
        describe('route', () => {
            it('should reject malformed paths', () => {
                const {use} = o(r);
                expect(() => {
                    use({route: {
                        path: {},
                        handler: () => {},
                    }});
                })
                    .toThrow(/path/);
            });

            it('should reject malformed handler', () => {
                const {use} = o(r);
                expect(() => {
                    use({route: {
                        path: '',
                        handler: '',
                    }});
                })
                    .toThrow(/handler/);
            });

            it('should check the current pathname against new routes', () => {
                const test = jest.fn();
                window.history.pushState({}, '', '/test');
                const {use} = o(r, rr, rf);
                use({route: {
                    path: '/test',
                    handler: test,
                }});
                expect(test)
                    .toHaveBeenCalled();
            });

            it('should save routes for future redirects', () => {
                const test = jest.fn();
                const {emit, use} = o(r, rr, rf);
                use({route: {
                    path: '/test',
                    handler: test,
                }});
                emit({redirect: {path: '/test'}});
                expect(test)
                    .toHaveBeenCalled();
            });

            it('should prioritize the earliest routes', () => {
                const test1 = jest.fn();
                const test2 = jest.fn();
                const {emit, use} = o(r, rr, rf);
                use({route: {
                    path: '/test',
                    handler: test1,
                }});
                use({route: {
                    path: '/*',
                    handler: test2,
                }});
                emit({redirect: {path: '/test'}});
                expect(test1)
                    .toHaveBeenCalled();
            });
        });

        describe('base', () => {
            it('should reject malformed inputs', () => {
                const {use} = o(r);
                expect(() => {
                    use({base: true});
                })
                    .toThrow(/base/);
            });

            it('should add the base url to all new pathnames', () => {
                const {emit, use} = o(r, rf);
                use({base: '/testBase'});
                emit({redirect: {path: '/test'}});
                expect(window.location.pathname)
                    .toBe('/testBase/test');
            });

            it('should be applied to the current pathname', () => {
                const test = jest.fn();
                window.history.pushState({}, '', '/testBase/test');
                const {use} = o(r, rr, rf);
                use({route: {
                    path: '/test',
                    handler: test,
                }});
                expect(test)
                    .toHaveBeenCalledTimes(0);
                use({base: '/testBase'});
                expect(test)
                    .toHaveBeenCalled();
            });

            it('should not accept regex patterns', () => {
                const test = jest.fn();
                const {emit, use} = o(r, rr, rf);
                use({route: {
                    path: '/test',
                    handler: test,
                }});
                expect(test)
                    .toHaveBeenCalledTimes(0);
                emit({redirect: {path: '/abcdef/test'}});
                use({base: '/.[^/]*'});
                expect(test)
                    .toHaveBeenCalledTimes(0);
            });
        });

        describe('register', () => {
            it('should reject malformed register', () => {
                const {use} = o(r);
                expect(() => use({register: true}))
                    .toThrow(/register/);
            });

            it('should be used to register routes', () => {
                const {use} = o(r, rf);
                let test = jest.fn();
                use({register: test});
                const handler = () => {};
                use({route: {
                    path: '/',
                    handler,
                }});
                expect(test)
                    .toHaveBeenCalledWith(undefined, '/', handler);
            });

            it('should use register\'s return value as the new store', () => {
                const test = jest.fn();
                const {use} = o(r, rr, rf);
                const temp = [];
                let first = true;
                use({register: (store, path, handler) => {
                    if (first) {
                        first = false;
                        return temp;
                    }
                    test();
                    expect(store)
                        .toBe(temp);
                }});
                use({route: {
                    path: '/',
                    handler: () => 0,
                }});
                use({route: {
                    path: '/',
                    handler: () => 0,
                }});
                expect(test)
                    .toHaveBeenCalled();
            });
        });

        describe('fetch', () => {
            it('should reject malformed fetch', () => {
                const {use} = o(r);
                expect(() => use({fetch: true}))
                    .toThrow(/fetch/);
            });

            it('should be used to fetch routes', () => {
                const {emit, use} = o(r);
                let test = jest.fn();
                use({fetch: test});
                emit({redirect: {path: '/redirect', params: {redirect: true}}});
                emit({show: {path: '/show', params: {show: true}}});
                expect(test)
                    .toHaveBeenCalledWith(undefined, '/redirect', {redirect: true});
                expect(test)
                    .toHaveBeenCalledWith(undefined, '/show', {show: true});
            });
        });
    });

    describe('api', () => {
        describe('redirect', () => {
            it('should add redirect to the api', () => {
                const test = jest.fn();
                const app = o(({use}) => {
                    use.on('api', (api) => {
                        expect(api.redirect)
                            .toBeInstanceOf(Function);
                        test();
                    });
                }, r);
                expect(test)
                    .toHaveBeenCalled();
                expect(app.redirect)
                    .toBeInstanceOf(Function);
            });

            it('should emit a redirect event', () => {
                const test = jest.fn();
                const app = o(({emit}) => {
                    emit.on('redirect', test);
                }, r, rf);
                expect(test)
                    .toHaveBeenCalledTimes(0);
                app.redirect('/');
                expect(test)
                    .toHaveBeenCalledTimes(1);
            });
        });

        describe('show', () => {
            it('should add show to the api', () => {
                const test = jest.fn();
                const app = o(({use}) => {
                    use.on('api', (api) => {
                        expect(api.show)
                            .toBeInstanceOf(Function);
                        test();
                    });
                }, r);
                expect(test)
                    .toHaveBeenCalled();
                expect(app.show)
                    .toBeInstanceOf(Function);
            });

            it('should emit a show event', () => {
                const test = jest.fn();
                const app = o(({emit}) => {
                    emit.on('show', test);
                }, r, rf);
                expect(test)
                    .toHaveBeenCalledTimes(0);
                app.show('/');
                expect(test)
                    .toHaveBeenCalledTimes(1);
            });
        });
    });

    describe('primary', () => {
        it('should replace the primary', () => {
            const test = jest.fn();
            o(({use}) => {
                use.on('primary', test);
            }, r);
            expect(test)
                .toHaveBeenCalled();
        });

        it('should use a builder if no path is provided', () => {
            const test = jest.fn();
            const app = o(r, ({use}) => {
                use.on('builder', test);
            });
            expect(test)
                .toHaveBeenCalledTimes(0);
            app(() => 0);
            expect(test)
                .toHaveBeenCalledTimes(1);
        });

        it('should use a route that uses a builder when a path is given', () => {
            const testBuilder = jest.fn();
            const testRoute = jest.fn();
            const app = o(r, rr, rf, ({use}) => {
                use.on('route', testRoute);
                use.on('builder', testBuilder);
            });
            expect(testBuilder)
                .toHaveBeenCalledTimes(0);
            expect(testRoute)
                .toHaveBeenCalledTimes(0);
            app('/test', () => 0);
            expect(testRoute)
                .toHaveBeenCalledTimes(1);
            expect(testBuilder)
                .toHaveBeenCalledTimes(0);
            app.show('/test');
            expect(testBuilder)
                .toHaveBeenCalledTimes(1);
        });

        it('should pass route handler params to the builder generator', () => {
            const test = jest.fn();
            const app = o(r, rr, rf);
            const params = {test, app};
            app('/test', test);
            app.redirect('/test', params);
            expect(test)
                .toHaveBeenCalledWith(params);
        });
    });
});
