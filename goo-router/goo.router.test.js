const should = require('chai').should();

const router = require('./goo.router');

const jsdom = require('jsdom');

const print = (obj) => {
    console.log(JSON.stringify(obj, (key, value) => {
        if (typeof value === 'function') return value.toString();
        else return value;
    }, 4));
};

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
                router.redirect('');
            }).should.not.throw(Error, /params/);
            done();
        });
    });
});
