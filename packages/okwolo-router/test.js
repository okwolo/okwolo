'use strict';

const router = require('./');

describe('@okwolo/router', () => {
    beforeEach(() => {
        window.history.pushState({}, '', '/');
    });

    it('should return a function', () => {
        expect(router)
            .toBeInstanceOf(Function);
    });

    it('should have a use function', () => {
        expect(router().use)
            .toBeInstanceOf(Function);
    });

    it('should have an exec function', () => {
        expect(router().exec)
            .toBeInstanceOf(Function);
    });

    describe('exec', () => {
        describe('redirect', () => {
            it('should reject malformed paths', () => {
                expect(() => router().exec({redirect: undefined}))
                    .toThrow(/path/);
            });

            it('should accept no params', () => {
                router().exec({redirect: {path: '/', params: undefined}});
            });

            it('should change the pathname', () => {
                router().exec({redirect: {path: '/test/xyz'}});
                expect(window.location.pathname)
                    .toBe('/test/xyz');
            });

            it('should accumulate params and pass them to the callback', () => {
                const test = jest.fn();
                let app = router();
                app.use({route: {
                    path: '/user/:id/fetch/:field',
                    callback: test,
                }});
                app.exec({redirect: {path: '/user/123/fetch/name'}});
                expect(test)
                    .toHaveBeenCalledWith({id: '123', field: 'name'});
            });
        });

        describe('show', () => {
            it('should reject malformed paths', () => {
                expect(() => router().exec({show: undefined}))
                    .toThrow(/path/);
            });

            it('should accept no params', () => {
                router().exec({show: {path: '/', params: undefined}});
            });

            it('should not change the pathname', () => {
                router().exec({show: {path: '/test/xyz'}});
                expect(window.location.pathname)
                    .not.toBe('/test/xyz');
            });

            it('should accumulate params and pass them to the callback', () => {
                const test = jest.fn();
                let app = router();
                app.use({route: {
                    path: '/user/:id/fetch/:field',
                    callback: test,
                }});
                app.exec({show: {path: '/user/123/fetch/name'}});
                expect(test)
                    .toHaveBeenCalledWith({id: '123', field: 'name'});
            });
        });
    });

    describe('use', () => {
        describe('route', () => {
            it('should reject malformed paths', () => {
                let app = router();
                expect(() => {
                    app.use({route: {
                        path: {},
                        callback: () => {},
                    }});
                })
                    .toThrow(/path/);
            });

            it('should reject malformed callback', () => {
                let app = router();
                expect(() => {
                    app.use({route: {
                        path: '',
                        callback: '',
                    }});
                })
                    .toThrow(/callback/);
            });

            it('should check the current pathname against new routes', () => {
                const test = jest.fn();
                window.history.pushState({}, '', '/test');
                router().use({route: {
                    path: '/test',
                    callback: test,
                }});
                expect(test)
                    .toHaveBeenCalled();
            });

            it('should save routes for future redirects', () => {
                const test = jest.fn();
                let app = router();
                app.use({route: {
                    path: '/test',
                    callback: test,
                }});
                app.exec({redirect: {path: '/test'}});
                expect(test)
                    .toHaveBeenCalled();
            });

            it('should prioritize the earliest routes', () => {
                const test1 = jest.fn();
                const test2 = jest.fn();
                let app = router();
                app.use({route: {
                    path: '/test',
                    callback: test1,
                }});
                app.use({route: {
                    path: '/*',
                    callback: test2,
                }});
                app.exec({redirect: {path: '/test'}});
                expect(test1)
                    .toHaveBeenCalled();
            });
        });

        describe('base', () => {
            it('should reject malformed inputs', () => {
                expect(() => {
                    router().use({base: true});
                })
                    .toThrow(/base/);
            });

            it('should add the base url to all new pathnames', () => {
                let app = router();
                app.use({base: '/testBase'});
                app.exec({redirect: {path: '/test'}});
                expect(window.location.pathname)
                    .toBe('/testBase/test');
            });

            it('should be applied to the current pathname', () => {
                const test = jest.fn();
                window.history.pushState({}, '', '/testBase/test');
                let app = router();
                app.use({route: {
                    path: '/test',
                    callback: test,
                }});
                expect(test)
                    .toHaveBeenCalledTimes(0);
                app.use({base: '/testBase'});
                expect(test)
                    .toHaveBeenCalled();
            });
        });

        describe('register', () => {
            it('should reject malformed register', () => {
                let app = router();
                expect(() => app.use({register: true}))
                    .toThrow(/register/);
            });

            it('should be used to register routes', () => {
                let app = router();
                let test = jest.fn();
                app.use({register: test});
                const callback = () => {};
                app.use({route: {
                    path: '/',
                    callback,
                }});
                expect(test)
                    .toHaveBeenCalledWith('/', callback);
            });
        });

        describe('fetch', () => {
            it('should reject malformed fetch', () => {
                let app = router();
                expect(() => app.use({fetch: true}))
                    .toThrow(/fetch/);
            });

            it('should be used to fetch routes', () => {
                let app = router();
                let test = jest.fn();
                app.use({fetch: test});
                app.exec({redirect: {path: '/redirect', params: {redirect: true}}});
                app.exec({show: {path: '/show', params: {show: true}}});
                expect(test)
                    .toHaveBeenCalledWith('/redirect', {redirect: true});
                expect(test)
                    .toHaveBeenCalledWith('/show', {show: true});
            });
        });
    });
});
