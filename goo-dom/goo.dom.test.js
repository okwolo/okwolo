const should = require('chai').should();

const dom = require('./goo.dom');

const jsdom = require('jsdom');

let pseudom = {tagName: true, nodeName: true, ownerDocument: true, removeAttribute: true};

const newWindow = (builder, initialState, callback) => {
    jsdom.env(
        '<div class="wrapper"></div>',
        [],
        (err, window) => {
            if (err) {
                console.error(err);
            }
            window.requestAnimationFrame = (f) => setTimeout(f, 0);
            const controller = dom();
            let update = null;
            const wrapper = window.document.querySelector('.wrapper');
            controller.use({
                controller: {
                    window: window,
                    target: wrapper,
                    builder: builder,
                    initialState: initialState,
                    update: (u) => update = u,
                },
            });
            setTimeout(() => {
                callback(wrapper, (newState, callback) => {
                    update(newState);
                    setTimeout(callback, 0);
                });
            }, 0);
        }
    );
};

describe('goo-dom', () => {
    it('should return a function', () => {
        dom.should.be.a('function');
    });

    it('should have a use function', () => {
        const test = dom();
        test.use.should.be.a('function');
    });
});

describe('use -> controller', () => {
    it('should reject malformed targets', () => {
        const test = dom();
        (() => {
            test.use({
                controller: {
                    target: '',
                    builder: () => {},
                    initialState: {},
                    update: () => {},
                },
            });
        }).should.throw(Error, /target/g);
    });

    it('should reject malformed builders', () => {
        const test = dom();
        (() => {
            test.use({
                controller: {
                    target: pseudom,
                    builder: {},
                    initialState: {},
                    update: () => {},
                },
            });
        }).should.throw(Error, /builder/g);
    });

    it('should reject undefined state', () => {
        const test = dom();
        (() => {
            test.use({
                controller: {
                    target: pseudom,
                    builder: () => {},
                    initialState: undefined,
                    update: () => {},
                },
            });
        }).should.throw(Error, /state/gi);
    });

    it('should reject malformed update function', () => {
        const test = dom();
        (() => {
            test.use({
                controller: {
                    target: pseudom,
                    builder: () => {},
                    initialState: {},
                    update: {},
                },
            });
        }).should.throw(Error, /update/g);
    });

    it('should should call the update function with a function as argument', (done) => {
        (() => {
            newWindow(() => '', {}, (wrapper, update) => {
                update.should.be.a('function');
                done();
            });
        }).should.not.throw(Error);
    });
});

describe('createController', () => {
    it('should render the initial state immediately', (done) => {
        newWindow(() => 'a', {}, (wrapper, update) => {
            wrapper.should.not.equal(undefined);
            done();
        });
    });

    it('should remove all other elements in the target', (done) => {
        jsdom.env(
            '<div class="wrapper"><span></span></div>',
            [],
            (err, window) => {
                window.requestAnimationFrame = (f) => setTimeout(f, 0);
                const controller = dom();
                const wrapper = window.document.querySelector('.wrapper');
                controller.use({
                    controller: {
                        window: window,
                        target: wrapper,
                        builder: () => 'a',
                        initialState: {},
                        update: () => {},
                    },
                });
                setTimeout(() => {
                    wrapper.children.length.should.equal(0);
                    done();
                }, 0);
            }
        );
    });

    it('should add the builder function\s output to the target', (done) => {
        newWindow(() => ['span'], {}, (wrapper, update) => {
            wrapper.children[0].tagName.should.equal('SPAN');
            done();
        });
    });
});

describe('build', () => {
    it('should create textNodes out of strings', (done) => {
        newWindow(() => 'test', {}, (wrapper, update) => {
            wrapper.innerHTML.should.equal('test');
            done();
        });
    });

    it('should create elements out of arrays', (done) => {
        newWindow(() => ['span'], {}, (wrapper, update) => {
            wrapper.innerHTML.should.equal('<span></span>');
            done();
        });
    });
});

/*newWindow((s) => (
    ['span  .test  |  height: 20px;', {}, [s]]
), 'test', (wrapper, update) => {
    console.log(wrapper.outerHTML);
    update('test2', () => {
        console.log(wrapper.outerHTML);
    });
});*/
