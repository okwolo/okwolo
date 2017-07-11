'use strict';

const router = require('./');

describe('goo-router', () => {
    it('should return a function', () => {
        expect(router)
            .toBeInstanceOf(Function);
    });

    it('should have a use function', () => {
        expect(router().use)
            .toBeInstanceOf(Function);
    });

    it('should have a redirect function', () => {
        expect(router().redirect)
            .toBeInstanceOf(Function);
    });

    describe('redirect', () => {
        it('should reject malformed paths', () => {
            expect(() => router().redirect(undefined))
                .toThrow(/path/);
        });

        it('should accept no params', () => {
            router().redirect('/', undefined);
        });

        it('should change the pathname', () => {
            router().redirect('/test/xyz');
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
            app.redirect('/user/123/fetch/name');
            expect(test)
                .toHaveBeenCalledWith({id: '123', field: 'name'});
        });
    });

    describe('use', () => {
        it('should return an array', () => {
            expect(router().use({}))
                .toBeInstanceOf(Array);
        });

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
                app.redirect('/test');
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
                app.redirect('/test');
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
                app.redirect('/test');
                expect(window.location.pathname)
                    .toBe('/testBase/test');
            });

            it('should be applied to the current pathname', () => {
                const test = jest.fn();
                let app = router();
                window.history.pushState({}, '', '/testBase/test');
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
    });
});
