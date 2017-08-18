'use strict';

const {bus} = require('@okwolo/utils')();

const router = () => {
    const exec = bus();
    const use = bus();
    require('./')({exec, use}, window);
    use(require('./blob')(window));
    return {exec, use};
};

describe('@okwolo/router', () => {
    beforeEach(() => {
        window.history.pushState({}, '', '/');
    });

    describe('exec', () => {
        describe('redirect', () => {
            it('should reject malformed paths', () => {
                const {exec} = router();
                expect(() => exec({redirect: undefined}))
                    .toThrow(/path/);
            });

            it('should accept no params', () => {
                const {exec} = router();
                expect(() => exec({redirect: {path: '/', params: undefined}}))
                    .not.toThrow(Error);
            });

            it('should change the pathname', () => {
                const {exec} = router();
                exec({redirect: {path: '/test/xyz'}});
                expect(window.location.pathname)
                    .toBe('/test/xyz');
            });

            it('should use a queue', () => {
                const test = jest.fn();
                const {exec, use} = router();
                use({route: {
                    path: '/xxx',
                    callback: () => {
                        exec({show: {path: '/test'}});
                        test();
                    },
                }});
                use({route: {
                    path: '/test',
                    callback: () => {
                        expect(test)
                            .toHaveBeenCalled();
                    },
                }});
                exec({redirect: {path: '/xxx'}});
            });

            it('should accumulate params and pass them to the callback', () => {
                const test = jest.fn();
                const {exec, use} = router();
                use({route: {
                    path: '/user/:id/fetch/:field',
                    callback: test,
                }});
                exec({redirect: {path: '/user/123/fetch/name'}});
                expect(test)
                    .toHaveBeenCalledWith({id: '123', field: 'name'});
            });
        });

        describe('show', () => {
            it('should reject malformed paths', () => {
                const {exec} = router();
                expect(() => exec({show: undefined}))
                    .toThrow(/path/);
            });

            it('should accept no params', () => {
                const {exec} = router();
                exec({show: {path: '/', params: undefined}});
            });

            it('should not change the pathname', () => {
                const {exec} = router();
                exec({show: {path: '/test/xyz'}});
                expect(window.location.pathname)
                    .not.toBe('/test/xyz');
            });

            it('should use a queue', () => {
                const test = jest.fn();
                const {exec, use} = router();
                use({route: {
                    path: '/xxx',
                    callback: () => {
                        exec({redirect: {path: '/test'}});
                        test();
                    },
                }});
                use({route: {
                    path: '/test',
                    callback: () => {
                        expect(test)
                            .toHaveBeenCalled();
                    },
                }});
                exec({show: {path: '/xxx'}});
            });

            it('should accumulate params and pass them to the callback', () => {
                const test = jest.fn();
                const {exec, use} = router();
                use({route: {
                    path: '/user/:id/fetch/:field',
                    callback: test,
                }});
                exec({show: {path: '/user/123/fetch/name'}});
                expect(test)
                    .toHaveBeenCalledWith({id: '123', field: 'name'});
            });
        });
    });

    describe('use', () => {
        describe('route', () => {
            it('should reject malformed paths', () => {
                const {use} = router();
                expect(() => {
                    use({route: {
                        path: {},
                        callback: () => {},
                    }});
                })
                    .toThrow(/path/);
            });

            it('should reject malformed callback', () => {
                const {use} = router();
                expect(() => {
                    use({route: {
                        path: '',
                        callback: '',
                    }});
                })
                    .toThrow(/callback/);
            });

            it('should check the current pathname against new routes', () => {
                const test = jest.fn();
                window.history.pushState({}, '', '/test');
                const {use} = router();
                use({route: {
                    path: '/test',
                    callback: test,
                }});
                expect(test)
                    .toHaveBeenCalled();
            });

            it('should save routes for future redirects', () => {
                const test = jest.fn();
                const {exec, use} = router();
                use({route: {
                    path: '/test',
                    callback: test,
                }});
                exec({redirect: {path: '/test'}});
                expect(test)
                    .toHaveBeenCalled();
            });

            it('should prioritize the earliest routes', () => {
                const test1 = jest.fn();
                const test2 = jest.fn();
                const {exec, use} = router();
                use({route: {
                    path: '/test',
                    callback: test1,
                }});
                use({route: {
                    path: '/*',
                    callback: test2,
                }});
                exec({redirect: {path: '/test'}});
                expect(test1)
                    .toHaveBeenCalled();
            });
        });

        describe('base', () => {
            it('should reject malformed inputs', () => {
                const {use} = router();
                expect(() => {
                    use({base: true});
                })
                    .toThrow(/base/);
            });

            it('should add the base url to all new pathnames', () => {
                const {exec, use} = router();
                use({base: '/testBase'});
                exec({redirect: {path: '/test'}});
                expect(window.location.pathname)
                    .toBe('/testBase/test');
            });

            it('should be applied to the current pathname', () => {
                const test = jest.fn();
                window.history.pushState({}, '', '/testBase/test');
                const {use} = router();
                use({route: {
                    path: '/test',
                    callback: test,
                }});
                expect(test)
                    .toHaveBeenCalledTimes(0);
                use({base: '/testBase'});
                expect(test)
                    .toHaveBeenCalled();
            });
        });

        describe('register', () => {
            it('should reject malformed register', () => {
                const {use} = router();
                expect(() => use({register: true}))
                    .toThrow(/register/);
            });

            it('should be used to register routes', () => {
                const {use} = router();
                let test = jest.fn();
                use({register: test});
                const callback = () => {};
                use({route: {
                    path: '/',
                    callback,
                }});
                expect(test)
                    .toHaveBeenCalledWith(undefined, '/', callback);
            });
        });

        describe('fetch', () => {
            it('should reject malformed fetch', () => {
                const {use} = router();
                expect(() => use({fetch: true}))
                    .toThrow(/fetch/);
            });

            it('should be used to fetch routes', () => {
                const {exec, use} = router();
                let test = jest.fn();
                use({fetch: test});
                exec({redirect: {path: '/redirect', params: {redirect: true}}});
                exec({show: {path: '/show', params: {show: true}}});
                expect(test)
                    .toHaveBeenCalledWith(undefined, '/redirect', {redirect: true});
                expect(test)
                    .toHaveBeenCalledWith(undefined, '/show', {show: true});
            });
        });
    });
});
