const should = require('chai').should();

const utils = require('./');

describe('deepCopy', () => {
    const deepCopy = utils().deepCopy;

    it('should copy an object', () => {
        let obj = {};
        deepCopy(obj).should.not.equal(obj);
    });

    it('should not mutate inputs', () => {
        let obj = {a: 1};
        let wrapper = {b: obj};
        deepCopy(wrapper);
        wrapper.b.should.equal(obj);
    });

    it('should deep copy an object', () => {
        let obj = {a: 1};
        deepCopy({b: obj}).b.should.not.equal(obj);
    });

    it('should copy strings', () => {
        deepCopy('a').should.equal('a');
    });

    it('should copy numbers', () => {
        deepCopy(1).should.equal(1);
    });

    it('should copy arrays', () => {
        let arr = [1, 2, 3];
        deepCopy(arr).should.be.an('array');
        deepCopy({a: arr}).a.should.not.equal(arr);
    });

    it('should not copy functions', () => {
        let func = () => {};
        deepCopy({a: func}).a.should.equal(func);
    });

    it('should handle null and undefined', () => {
        should.equal(deepCopy(undefined), undefined);
        should.equal(deepCopy(null), null);
    });
});

describe('isDefined', () => {
    const isDefined = utils().isDefined;

    it('should return false when undefined', () => {
        isDefined(undefined).should.equal(false);
    });

    it('should return true for all other values', () => {
        isDefined(null).should.equal(true);
        isDefined(0).should.equal(true);
        isDefined('a').should.equal(true);
        isDefined({}).should.equal(true);
        isDefined([]).should.equal(true);
        isDefined(() => {}).should.equal(true);
    });
});

describe('isArray', () => {
    const isArray = utils().isArray;

    it('should return true when array', () => {
        isArray([]).should.equal(true);
    });

    it('should return false for all other values', () => {
        isArray(undefined).should.equal(false);
        isArray(null).should.equal(false);
        isArray(0).should.equal(false);
        isArray('a').should.equal(false);
        isArray({}).should.equal(false);
        isArray(() => {}).should.equal(false);
    });
});

describe('isString', () => {
    const isString = utils().isString;

    it('should return true when string', () => {
        isString('a').should.equal(true);
    });

    it('should return false for all other values', () => {
        isString(undefined).should.equal(false);
        isString(null).should.equal(false);
        isString(0).should.equal(false);
        isString([]).should.equal(false);
        isString({}).should.equal(false);
        isString(() => {}).should.equal(false);
    });
});

describe('isFunction', () => {
    const isFunction = utils().isFunction;

    it('should return true when function', () => {
        isFunction(() => {}).should.equal(true);
    });

    it('should return false for all other values', () => {
        isFunction(undefined).should.equal(false);
        isFunction(null).should.equal(false);
        isFunction(0).should.equal(false);
        isFunction('a').should.equal(false);
        isFunction([]).should.equal(false);
        isFunction({}).should.equal(false);
    });
});

describe('isObject', () => {
    const isObject = utils().isObject;

    it('should return true when object', () => {
        isObject({}).should.equal(true);
    });

    it('should return false for all other values', () => {
        isObject(undefined).should.equal(false);
        isObject(null).should.equal(false);
        isObject(0).should.equal(false);
        isObject('a').should.equal(false);
        isObject([]).should.equal(false);
        isObject(() => {}).should.equal(false);
        isObject(new Date()).should.equal(false);
    });
});

describe('isNode', () => {
    const isNode = utils().isNode;

    it('should return false for all other values', () => {
        isNode(undefined).should.equal(false);
        isNode(null).should.equal(false);
        isNode(0).should.equal(false);
        isNode('a').should.equal(false);
        isNode([]).should.equal(false);
        isNode({}).should.equal(false);
        isNode(() => {}).should.equal(false);
    });
});

describe('err', () => {
    const err = utils().err;

    it('should throw an error', () => {
        err.should.throw(Error);
    });

    it('should throw an error that blames goo', () => {
        err.should.throw(Error, /goo/);
    });

    it('should throw an error that includes the custom message', () => {
        let message = 'test123';
        (() => {
            err(message);
        }).should.throw(Error, new RegExp(message));
    });
});

describe('assert', () => {
    const assert = utils().assert;

    it('should throw an error when false', () => {
        (() => {
            assert(false);
        }).should.throw(Error);
    });

    it('should not throw an error when true', () => {
        (() => {
            assert(true);
        }).should.not.throw(Error);
    });

    it('should throw an error that blames goo', () => {
        (() => {
            assert(false);
        }).should.throw(Error, /goo/);
    });

    it('should throw an error that includes the custom message', () => {
        let message = 'test123';
        (() => {
            assert(false, message);
        }).should.throw(Error, new RegExp(message));
    });

    it('should append the contents of the culprit', () => {
        (() => {
            assert(false, 'test', {
                testKey: () => {},
            });
        }).should.throw(Error, /testKey[^\n]*\(\) *=> *{}/);
    });
});

describe('makeQueue', () => {
    const makeQueue = utils().makeQueue;

    it('should immediately call new functions when empty', () => {
        const queue = makeQueue();
        let test = false;
        queue.add(() => {
            test = true;
        });
        test.should.equal(true);
    });

    it('should not proceed until the first function calls done', () => {
        const queue = makeQueue();
        let test = false;
        queue.add(() => {
            test = true;
        });
        queue.add(() => {
            test = false;
        });
        test.should.equal(true);
    });

    it('should call functions in the order they were added', (done) => {
        const queue = makeQueue();
        let callOrder = [];
        let numTests = 2 + Math.floor(Math.random()*8);
        for(let i = 0; i < numTests; ++i) {
            queue.add(() => {
                setTimeout(() => {
                    callOrder.push(i);
                    queue.done();
                }, Math.random()*numTests*2);
            });
        }
        queue.add(() => {
            for (let i = 0; i < numTests; ++i) {
                callOrder[i].should.equal(i);
            }
            done();
        });
    });
});

describe('blobHandler', () => {
    const blobHandler = utils().blobHandler;

    it('should call the function described in the blob', () => {
        let test = false;
        blobHandler({
            test: () => {
                test = true;
            },
        }, {test: null});
        test.should.equal(true);
    });

    it('should pass the object to the blob handler function', () => {
        blobHandler({
            test: (obj) => {
                obj.a.should.equal('test123');
            },
        }, {test: {a: 'test123'}});
    });

    it('should call the blob handler function multiple times for an array', () => {
        let test = 0;
        blobHandler({
            test: (num) => {
                test += num;
            },
        }, {
            test: [1, 2],
        });
        test.should.equal(3);
    });

    it('should call the blob handler for each key in the blob object', () => {
        let test = 0;
        blobHandler({
            a: (num) => {
                test += num;
            },
            b: (num) => {
                test -= num;
            },
        }, {
            a: 1,
            b: 2,
        });
        test.should.equal(-1);
    });

    it('should do nothing if there are no blob handler function for a key in the blob object', () => {
        let test = false;
        (() => {
            blobHandler({
                test: () => {
                    test = true;
                },
            }, {differentTest: null});
        }).should.not.throw(Error);
        test.should.equal(false);
    });

    it('should use a queue if provided', (done) => {
        let queue = utils().makeQueue();
        let test = false;
        queue.add(() => {
            setTimeout(() => {
                queue.done();
            }, 30);
        });
        blobHandler({
            test: (num) => {
                test = true;
            },
        }, {test: null}, queue);
        queue.add(() => {
            test.should.equal(true);
            done();
        });
        test.should.equal(false);
    });

    it('should return an array', () => {
        blobHandler({}, {}).should.be.an('array');
    });

    it('should return an array for each key in blob', () => {
        blobHandler({}, {test: ''}).length.should.equal(1);
        blobHandler({}, {test: '', test2: ''}).length.should.equal(2);
    });

    it('should make each key\'s array the same length as the number of inputs', () => {
        blobHandler({}, {test: ''})[0].length.should.equal(1);
        blobHandler({}, {test: ['', '']})[0].length.should.equal(2);
    });

    it('should use null as the default value when there is no handler', () => {
        should.equal(blobHandler({}, {test: ''})[0][0], null);
    });

    it('should return the return values of handlers', () => {
        should.equal(blobHandler({
            test: () => true,
        }, {test: ''})[0][0], true);
    });

    it('should default to a null value for each element when using a queue', () => {
        let queue = utils().makeQueue();
        should.equal(blobHandler({
            test: () => true,
        }, {test: ''}, queue)[0][0], null);
    });

    it('should reject malformed blobs', () => {
        (() => {
            blobHandler({}, true);
        }).should.throw(Error, /blob/);
    });

    it('should only accept one blob of the same name', () => {
        let count = 0;
        const handler = {
            test: () => count++,
        };
        blobHandler(handler, {test: 'test', name: 'name'});
        count.should.equal(1);
        blobHandler(handler, {test: 'test', name: 'name'});
        count.should.equal(1);
    });
});
