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

describe('router -> use', () => {
    it('should return an array', () => {
        router({location: '', document: {origin: ''}}).use({}).should.be.an('array');
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

    it('should prioritize the earliest routes', (done) => {
        let test = false;
        newWindow('/', (window, router) => {
            router.use({
                route: [
                    {
                        path: '/*',
                        callback: () => {
                            test = 1;
                        },
                    },
                    {
                        path: '/test',
                        callback: () => {
                            test = 2;
                        },
                    },
                ],
            });
            router.redirect('/test');
            test.should.equal(1);
            done();
        });
    });
});

describe('use -> fallback', () => {
    it('should reject malformed fallbacks', (done) => {
        newWindow('/', (window, router) => {
            (() => {
                router.use({fallback: true});
            }).should.throw(Error, /fallback/);
            done();
        });
    });

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

describe('use -> base', () => {
    it('should reject malformed inputs', (done) => {
        newWindow('/', (window, router) => {
            (() => {
                router.use({base: true});
            }).should.throw(Error, /base/);
            done();
        });
    });

    it('should add the base url to all new pathnames', (done) => {
        newWindow('/', (window, router) => {
            router.use({route: {path: '/test', callback: () => {}}});
            router.use({base: '/testBase'});
            router.redirect('/test');
            window.location.pathname.should.equal('/testBase/test');
            done();
        });
    });

    it('should be applied to the current pathname', (done) => {
        newWindow('/testBase', (window, router) => {
            let test = false;
            router.use({route: {
                path: '',
                callback: () => {
                    test = true;
                },
            }});
            test.should.equal(false);
            router.use({base: '/testBase'});
            test.should.equal(true);
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

    it('should change the pathname', (done) => {
        newWindow('/', (window, router) => {
            router.use({route: {path: '/test/xyz', callback: () => {}}});
            router.redirect('/test/xyz');
            window.location.pathname.should.equal('/test/xyz');
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
