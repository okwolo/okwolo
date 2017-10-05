'use strict';

const {makeBus} = require('@okwolo/utils')();

const router = () => {
    const emit = makeBus();
    const use = makeBus();
    require('./')({emit, use}, window);
    use(require('./blob')(window));
    return {emit, use};
};

describe('@okwolo/router', () => {
    beforeEach(() => {
        window.history.pushState({}, '', '/');
    });

    describe('emit', () => {
        describe('redirect', () => {
            it('should reject malformed paths', () => {
                const {emit} = router();
                expect(() => emit({redirect: undefined}))
                    .toThrow(/path/);
            });

            it('should accept no params', () => {
                const {emit} = router();
                expect(() => emit({redirect: {path: '/', params: undefined}}))
                    .not.toThrow(Error);
            });

            it('should change the pathname', () => {
                const {emit} = router();
                emit({redirect: {path: '/test/xyz'}});
                expect(window.location.pathname)
                    .toBe('/test/xyz');
            });

            it('should use a queue', () => {
                const test = jest.fn();
                const {emit, use} = router();
                use({route: {
                    path: '/xxx',
                    callback: () => {
                        emit({show: {path: '/test'}});
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
                emit({redirect: {path: '/xxx'}});
            });

            it('should accumulate params and pass them to the callback', () => {
                const test = jest.fn();
                const {emit, use} = router();
                use({route: {
                    path: '/user/:id/fetch/:field',
                    callback: test,
                }});
                emit({redirect: {path: '/user/123/fetch/name'}});
                expect(test)
                    .toHaveBeenCalledWith({id: '123', field: 'name'});
            });
        });

        describe('show', () => {
            it('should reject malformed paths', () => {
                const {emit} = router();
                expect(() => emit({show: undefined}))
                    .toThrow(/path/);
            });

            it('should accept no params', () => {
                const {emit} = router();
                emit({show: {path: '/', params: undefined}});
            });

            it('should not change the pathname', () => {
                const {emit} = router();
                emit({show: {path: '/test/xyz'}});
                expect(window.location.pathname)
                    .not.toBe('/test/xyz');
            });

            it('should use a queue', () => {
                const test = jest.fn();
                const {emit, use} = router();
                use({route: {
                    path: '/xxx',
                    callback: () => {
                        emit({redirect: {path: '/test'}});
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
                emit({show: {path: '/xxx'}});
            });

            it('should accumulate params and pass them to the callback', () => {
                const test = jest.fn();
                const {emit, use} = router();
                use({route: {
                    path: '/user/:id/fetch/:field',
                    callback: test,
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
                const {emit, use} = router();
                use({route: {
                    path: '/test',
                    callback: test,
                }});
                emit({redirect: {path: '/test'}});
                expect(test)
                    .toHaveBeenCalled();
            });

            it('should prioritize the earliest routes', () => {
                const test1 = jest.fn();
                const test2 = jest.fn();
                const {emit, use} = router();
                use({route: {
                    path: '/test',
                    callback: test1,
                }});
                use({route: {
                    path: '/*',
                    callback: test2,
                }});
                emit({redirect: {path: '/test'}});
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
                const {emit, use} = router();
                use({base: '/testBase'});
                emit({redirect: {path: '/test'}});
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
                const {emit, use} = router();
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
});
