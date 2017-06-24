const should = require('chai').should();

const dom = require('./goo.dom');

const jsdom = require('jsdom');

// fake dom object that will pass the isNode test in goo-utils
let pseudom = {tagName: true, nodeName: true, ownerDocument: true, removeAttribute: true};

testWindow = null;

const newWindow = (builder, initialState, callback) => {
    jsdom.env(
        '<div class="wrapper"></div>',
        [],
        (err, window) => {
            if (err) {
                console.error(err);
            }
            testWindow = window;
            window.requestAnimationFrame = (f) => setTimeout(f, 0);
            const wrapper = window.document.querySelector('.wrapper');
            const handler = dom(wrapper, window);
            handler.use({builder, state: initialState});
            setTimeout(() => {
                callback(wrapper, (newState, callback) => {
                    handler.use({state: newState});
                    setTimeout(callback, 0);
                });
            }, 0);
        }
    );
};

// creating testWindow
newWindow(() => '', {}, () => {});

describe('goo-dom', () => {
    it('should be a function', () => {
        dom.should.be.a('function');
    });

    it('should return a function', () => {
        dom(undefined, testWindow).should.be.a('function');
    });

    it('should have a use function', () => {
        const test = dom(undefined, testWindow);
        test.use.should.be.a('function');
    });

    it('should have a setState function', () => {
        const test = dom(undefined, testWindow);
        test.setState.should.be.a('function');
    });
});

describe('dom -> use', () => {
    it('should return an array', () => {
        dom(undefined, testWindow).use({}).should.be.an('array');
    });
});

describe('use -> controller', () => {
    it('should reject malformed targets', () => {
        const test = dom(undefined, testWindow);
        (() => {
            test.use({
                target: '',
                builder: () => {},
                state: {},
            });
        }).should.throw(Error, /target/g);
    });

    it('should reject malformed builders', () => {
        const test = dom(undefined, testWindow);
        (() => {
            test.use({
                target: pseudom,
                builder: {},
                state: {},
            });
        }).should.throw(Error, /builder/g);
    });

    it('should reject undefined state', () => {
        const test = dom(undefined, testWindow);
        (() => {
            test.use({
                target: pseudom,
                builder: () => {},
                state: undefined,
            });
        }).should.throw(Error, /state/gi);
    });
});

describe('createController', () => {
    it('should render the initial state immediately', (done) => {
        newWindow(() => ['test'], {}, (wrapper, update) => {
            wrapper.children[0].should.not.equal(undefined);
            done();
        });
    });

    it('should remove all other elements in the target', (done) => {
        jsdom.env(
            '<div class="wrapper"><span></span></div>',
            [],
            (err, window) => {
                window.requestAnimationFrame = (f) => setTimeout(f, 0);
                const wrapper = window.document.querySelector('.wrapper');
                dom(wrapper, window).use({builder: () => 'a', state: {}});
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

describe('build/render', () => {
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

    it('should create nothing when given null', (done) => {
        newWindow(() => null, {}, (wrapper, update) => {
            wrapper.innerHTML.should.equal('');
            done();
        });
    });

    it('should read the tagName from the first element in the array', (done) => {
        newWindow(() => ['test'], {}, (wrapper, update) => {
            wrapper.innerHTML.should.equal('<test></test>');
            done();
        });
    });

    it('should read the attributes from the second element in the array', (done) => {
        newWindow(() => ['test', {id: 'test'}], {}, (wrapper, update) => {
            wrapper.innerHTML.should.equal('<test id="test"></test>');
            done();
        });
    });

    it('should be possible to append an id to the tagName using #', (done) => {
        newWindow(() => ['test#test'], {}, (wrapper, update) => {
            wrapper.innerHTML.should.equal('<test id="test"></test>');
            done();
        });
    });

    it('should be possible to append an classNames to the tagName using .', (done) => {
        newWindow(() => ['test.test.test'], {}, (wrapper, update) => {
            wrapper.innerHTML.should.equal('<test class="test test"></test>');
            done();
        });
    });

    it('should be possible to append styles to the tagName using |', (done) => {
        newWindow(() => ['test|height:2px;'], {}, (wrapper, update) => {
            wrapper.innerHTML.should.equal('<test style="height: 2px;"></test>');
            done();
        });
    });

    it('should read the children from the third element in the array', (done) => {
        newWindow(() => ['test', {}, ['test']], {}, (wrapper, update) => {
            wrapper.innerHTML.should.equal('<test>test</test>');
            done();
        });
    });

    it('should should accept components', (done) => {
        newWindow(() => [() => 'test'], {}, (wrapper, update) => {
            wrapper.innerHTML.should.equal('test');
            done();
        });
    });

    it('should should pass arguments to components', (done) => {
        newWindow(() => [(a) => a, 'test'], {}, (wrapper, update) => {
            wrapper.innerHTML.should.equal('test');
            done();
        });
    });

    it('should should support nested components', (done) => {
        newWindow(() => [(a) => [(b) => [(c) => c, b], a], 'test'], {}, (wrapper, update) => {
            wrapper.innerHTML.should.equal('test');
            done();
        });
    });
});

describe('update', () => {
    it('should rerender the new dom', (done) => {
        newWindow((s) => [s, {}, [s]], 'a', (wrapper, update) => {
            wrapper.innerHTML.should.equal('<a>a</a>');
            update('b', () => {
                wrapper.innerHTML.should.equal('<b>b</b>');
                done();
            });
        });
    });

    it('should not replace elements when the tagName doesn\'t change', (done) => {
        let element = null;
        newWindow((s) => ['test' + s], '', (wrapper, update) => {
            element = wrapper.children[0];
            update('#id.class|height:0px;', () => {
                wrapper.children[0].should.equal(element);
                done();
            });
        });
    });

    it('should be able to replace all elements', (done) => {
        newWindow((s) => s, '', (wrapper, update) => {
            wrapper.innerHTML.should.equal('');
            update('test1', () => {
                wrapper.innerHTML.should.equal('test1');
                update('test2', () => {
                    wrapper.innerHTML.should.equal('test2');
                    update(['test3', {}, ['test3']], () => {
                        wrapper.innerHTML.should.equal('<test3>test3</test3>');
                        update(['test4', {}, [['test4']]], () => {
                            wrapper.innerHTML.should.equal('<test4><test4></test4></test4>');
                            update('', () => {
                                wrapper.innerHTML.should.equal('');
                                update('test5', () => {
                                    wrapper.innerHTML.should.equal('test5');
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
