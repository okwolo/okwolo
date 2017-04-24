const should = require('chai').should();

const router = require('./goo.router');

const jsdom = require('jsdom');

const newWindow = (initialPath, callback) => {
    jsdom.env({
        url: 'https://example.com' + initialPath,
        done: (err, window) => {
            const app = router(window);
            callback(window, app);
        },
    });
};

describe('goo-router', () => {
    it('should return a function', () => {
        router.should.be.a('function');
    });

    it('should have a use function', () => {
        const test = router({location: '', document: {origin: ''}});
        test.use.should.be.a('function');
    });

    it('should have a redirect function', () => {
        const test = router({location: '', document: {origin: ''}});
        test.redirect.should.be.a('function');
    });
});

describe('use -> route', () => {
    it('should reject malformed paths', (done) => {
        newWindow('/', (window, router) => {
            (() => {
                router.use({
                    route: {
                        path: {},
                        callback: () => {},
                    },
                });
            }).should.throw(Error, /path/);
            done();
        });
    });

    it('should reject malformed callback', (done) => {
        newWindow('/', (window, router) => {
            (() => {
                router.use({
                    route: {
                        path: '',
                        callback: '',
                    },
                });
            }).should.throw(Error, /callback/);
            done();
        });
    });

    it('should check the current pathname against new routes', (done) => {
        let test = false;
        newWindow('/test', (window, router) => {
            router.use({
                route: {
                    path: '/test',
                    callback: () => {
                        test = true;
                    },
                },
            });
            test.should.equal(true);
            done();
        });
    });

    it('should save routes for future redirects', (done) => {
        let test = false;
        newWindow('/', (window, router) => {
            router.use({
                route: {
                    path: '/test',
                    callback: () => {
                        test = true;
                    },
                },
            });
            router.redirect('/test');
            test.should.equal(true);
            done();
        });
    });

    it('should accumulate params and pass them to the callback', (done) => {
        let test = null;
        newWindow('/', (window, router) => {
            router.use({
                route: {
                    path: '/user/:id/fetch/:field',
                    callback: (params) => {
                        test = params;
                    },
                },
            });
            router.redirect('/user/123/fetch/name');
            test.id.should.equal('123');
            test.field.should.equal('name');
            done();
        });
    });
});

describe('use -> fallback', () => {
    it('should call the fallback when the route is not found', (done) => {
        let test = false;
        newWindow('/', (window, router) => {
            router.use({
                fallback: () => {
                    test = true;
                },
            });
            router.redirect('/test');
            test.should.equal(true);
            done();
        });
    });

    it('should call the fallback with the path as argument', (done) => {
        let test = null;
        newWindow('/', (window, router) => {
            router.use({
                fallback: (path) => {
                    test = path;
                },
            });
            router.redirect('/test');
            test.should.equal('/test');
            done();
        });
    });
});

describe('redirect', () => {
    it('should reject malformed paths', (done) => {
        newWindow('/', (window, router) => {
            (() => {
                router.redirect(undefined);
            }).should.throw(Error, /path/);
            done();
        });
    });

    it('should accept empty params', (done) => {
        newWindow('/', (window, router) => {
            (() => {
                router.use({route: {
                    path: '/',
                    callback: () => {},
                }});
                router.redirect('/');
            }).should.not.throw(Error, /params/);
            done();
        });
    });
});
