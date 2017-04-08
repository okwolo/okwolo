const should = require('chai').should();

const utils = require('./goo.utils');

describe('deepCopy', function() {
    const deepCopy = utils.deepCopy;

    it('should copy an object', function() {
        let obj = {};
        deepCopy(obj).should.not.equal(obj);
    });

    it('should not mutate inputs', function() {
        let obj = {a: 1};
        let wrapper = {b: obj};
        deepCopy(wrapper);
        wrapper.b.should.equal(obj);
    });

    it('should deep copy an object', function() {
        let obj = {a: 1};
        deepCopy({b: obj}).b.should.not.equal(obj);
    });

    it('should copy strings', function() {
        deepCopy('a').should.equal('a');
    });

    it('should copy numbers', function() {
        deepCopy(1).should.equal(1);
    });

    it('should copy arrays', function() {
        let arr = [1, 2, 3];
        deepCopy(arr).should.be.an('array');
        deepCopy({a: arr}).a.should.not.equal(arr);
    });

    it('should not copy functions', () => {
        let func = () => {};
        deepCopy({a: func}).a.should.equal(func);
    });
});

describe('isDefined', function() {
    const isDefined = utils.isDefined;

    it('should return false when undefined', function() {
        isDefined(undefined).should.equal(false);
    });

    it('should return true for all other values', function() {
        isDefined(null).should.equal(true);
        isDefined(0).should.equal(true);
        isDefined('a').should.equal(true);
        isDefined({}).should.equal(true);
        isDefined([]).should.equal(true);
        isDefined(() => {}).should.equal(true);
    });
});

describe('isArray', function() {
    const isArray = utils.isArray;

    it('should return true when array', function() {
        isArray([]).should.equal(true);
    });

    it('should return false for all other values', function() {
        isArray(undefined).should.equal(false);
        isArray(null).should.equal(false);
        isArray(0).should.equal(false);
        isArray('a').should.equal(false);
        isArray({}).should.equal(false);
        isArray(() => {}).should.equal(false);
    });
});

describe('isString', function() {
    const isString = utils.isString;

    it('should return true when string', function() {
        isString('a').should.equal(true);
    });

    it('should return false for all other values', function() {
        isString(undefined).should.equal(false);
        isString(null).should.equal(false);
        isString(0).should.equal(false);
        isString([]).should.equal(false);
        isString({}).should.equal(false);
        isString(() => {}).should.equal(false);
    });
});

describe('isFunction', function() {
    const isFunction = utils.isFunction;

    it('should return true when function', function() {
        isFunction(() => {}).should.equal(true);
    });

    it('should return false for all other values', function() {
        isFunction(undefined).should.equal(false);
        isFunction(null).should.equal(false);
        isFunction(0).should.equal(false);
        isFunction('a').should.equal(false);
        isFunction([]).should.equal(false);
        isFunction({}).should.equal(false);
    });
});

describe('isNode', function() {
    /* TODO fake DOM
    const isNode = utils.isNode;

    it('should return true when function', function() {
        isNode(document.createElement('html'));
    });

    it('should return false for all other values', function() {
        isNode(undefined).should.equal(false);
        isNode(null).should.equal(false);
        isNode(0).should.equal(false);
        isNode('a').should.equal(false);
        isNode([]).should.equal(false);
        isNode({}).should.equal(false);
        isNode(() => {}).should.equal(true);
    });
    */
});

describe('err', function() {
    const err = utils.err;

    it('should throw an error', function() {
        err.should.throw(Error);
    });

    it('should throw an error that blames goo', function() {
        err.should.throw(Error, /goo/);
    });

    it('should throw an error that includes the custom message', function() {
        let message = 'test123';
        (function() {
            err(message);
        }).should.throw(Error, new RegExp(message));
    });
});

describe('assert', function() {
    const assert = utils.assert;

    it('should throw an error when false', function() {
        (function() {
            assert(false);
        }).should.throw(Error);
    });

    it('should not throw an error when true', function() {
        (function() {
            assert(true);
        }).should.not.throw(Error);
    });

    it('should throw an error that blames goo', function() {
        (function() {
            assert(false);
        }).should.throw(Error, /goo/);
    });

    it('should throw an error that includes the custom message', function() {
        let message = 'test123';
        (function() {
            assert(false, message);
        }).should.throw(Error, new RegExp(message));
    });
});

describe('makeQueue', function() {
    const makeQueue = utils.makeQueue;

    it('should immediately call new functions when empty', function() {
        const queue = makeQueue();
        let test = false;
        queue.add(function() {
            test = true;
        });
        test.should.equal(true);
    });

    it('should not proceed until the first function calls done', function() {
        const queue = makeQueue();
        let test = false;
        queue.add(function() {
            test = true;
        });
        queue.add(function() {
            test = false;
        });
        test.should.equal(true);
    });

    it('should call functions in the order they were added', function(done) {
        const queue = makeQueue();
        let callOrder = [];
        let numTests = 2 + Math.floor(Math.random()*8);
        for(let i = 0; i < numTests; ++i) {
            queue.add(function() {
                setTimeout(function() {
                    callOrder.push(i);
                    queue.done();
                }, Math.random()*numTests*2);
            });
        }
        queue.add(function() {
            for (let i = 0; i < numTests; ++i) {
                callOrder[i].should.equal(i);
            }
            done();
        });
    });
});

describe('blobHandler', function() {
    const blobHandler = utils.blobHandler;

    it('should call the function described in the blob', function() {
        let test = false;
        blobHandler({
            test: function() {
                test = true;
            },
        }, {test: null});
        test.should.equal(true);
    });

    it('should pass the object to the blob handler function', function() {
        blobHandler({
            test: function(obj) {
                obj.a.should.equal('test123');
            },
        }, {test: {a: 'test123'}});
    });

    it('should call the blob handler function multiple times for an array', function() {
        let test = 0;
        blobHandler({
            test: function(num) {
                test += num;
            },
        }, {
            test: [1, 2],
        });
        test.should.equal(3);
    });

    it('should call the blob handler for each key in the blob object', function() {
        let test = 0;
        blobHandler({
            a: function(num) {
                test += num;
            },
            b: function(num) {
                test -= num;
            },
        }, {
            a: 1,
            b: 2,
        });
        test.should.equal(-1);
    });

    it('should do nothing if there are no blob handler function for a key in the blob object', function() {
        let test = false;
        (function() {
            blobHandler({
                test: function() {
                    test = true;
                },
            }, {differentTest: null});
        }).should.not.throw(Error);
        test.should.equal(false);
    });

    it('should use a queue if provided', function(done) {
        let queue = utils.makeQueue();
        let test = false;
        queue.add(function() {
            setTimeout(function() {
                queue.done();
            }, 30);
        });
        blobHandler({
            test: function(num) {
                test = true;
            },
        }, {test: null}, queue);
        queue.add(function() {
            test.should.equal(true);
            done();
        });
        test.should.equal(false);
    });
});
