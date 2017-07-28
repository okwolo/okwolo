'use strict';

const utils = require('./');

describe('@okwolo/utils', () => {
    describe('deepCopy', () => {
        const deepCopy = utils().deepCopy;

        it('should copy an object', () => {
            let obj = {};
            expect(deepCopy(obj))
                .not.toBe(obj);
        });

        it('should not mutate inputs', () => {
            let obj = {a: 1};
            let wrapper = {b: obj};
            deepCopy(wrapper);
            expect(wrapper.b)
                .toBe(obj);
        });

        it('should deep copy an object', () => {
            let obj = {a: 1};
            expect(deepCopy({b: obj}).b)
                .not.toBe(obj);
        });

        it('should copy strings', () => {
            expect(deepCopy('a'))
                .toBe('a');
        });

        it('should copy numbers', () => {
            expect(deepCopy(1))
                .toBe(1);
        });

        it('should copy arrays', () => {
            let arr = [1, 2, 3];
            expect(deepCopy(arr))
                .toBeInstanceOf(Array);
            expect(deepCopy({a: arr}).a)
                .not.toBe(arr);
        });

        it('should not copy functions', () => {
            let func = () => {};
            expect(deepCopy({a: func}).a)
                .toBe(func);
        });

        it('should handle null and undefined', () => {
            expect(deepCopy(undefined))
                .toBe(undefined);
            expect(deepCopy(null))
                .toBe(null);
        });
    });

    describe('isDefined', () => {
        const isDefined = utils().isDefined;

        it('should return false when undefined', () => {
            expect(isDefined(undefined))
                .toBe(false);
        });

        it('should return true for all other values', () => {
            expect(isDefined(null))
                .toBe(true);
            expect(isDefined(0))
                .toBe(true);
            expect(isDefined('a'))
                .toBe(true);
            expect(isDefined({}))
                .toBe(true);
            expect(isDefined([]))
                .toBe(true);
            expect(isDefined(() => {}))
                .toBe(true);
        });
    });

    describe('isNull', () => {
        const isNull = utils().isNull;

        it('should return true when null', () => {
            expect(isNull(null))
                .toBe(true);
        });

        it('should return false for all other values', () => {
            expect(isNull(undefined))
                .toBe(false);
            expect(isNull(0))
                .toBe(false);
            expect(isNull('a'))
                .toBe(false);
            expect(isNull({}))
                .toBe(false);
            expect(isNull([]))
                .toBe(false);
            expect(isNull(() => {}))
                .toBe(false);
        });
    });

    describe('isArray', () => {
        const isArray = utils().isArray;

        it('should return true when array', () => {
            expect(isArray([]))
                .toBe(true);
        });

        it('should return false for all other values', () => {
            expect(isArray(undefined))
                .toBe(false);
            expect(isArray(null))
                .toBe(false);
            expect(isArray(0))
                .toBe(false);
            expect(isArray('a'))
                .toBe(false);
            expect(isArray({}))
                .toBe(false);
            expect(isArray(() => {}))
                .toBe(false);
        });
    });

    describe('isString', () => {
        const isString = utils().isString;

        it('should return true when string', () => {
            expect(isString('a'))
                .toBe(true);
        });

        it('should return false for all other values', () => {
            expect(isString(undefined))
                .toBe(false);
            expect(isString(null))
                .toBe(false);
            expect(isString(0))
                .toBe(false);
            expect(isString([]))
                .toBe(false);
            expect(isString({}))
                .toBe(false);
            expect(isString(() => {}))
                .toBe(false);
        });
    });

    describe('isFunction', () => {
        const isFunction = utils().isFunction;

        it('should return true when function', () => {
            expect(isFunction(() => {}))
                .toBe(true);
        });

        it('should return false for all other values', () => {
            expect(isFunction(undefined))
                .toBe(false);
            expect(isFunction(null))
                .toBe(false);
            expect(isFunction(0))
                .toBe(false);
            expect(isFunction('a'))
                .toBe(false);
            expect(isFunction([]))
                .toBe(false);
            expect(isFunction({}))
                .toBe(false);
        });
    });

    describe('isObject', () => {
        const isObject = utils().isObject;

        it('should return true when object', () => {
            expect(isObject({}))
                .toBe(true);
        });

        it('should return false for all other values', () => {
            expect(isObject(undefined))
                .toBe(false);
            expect(isObject(null))
                .toBe(false);
            expect(isObject(0))
                .toBe(false);
            expect(isObject('a'))
                .toBe(false);
            expect(isObject([]))
                .toBe(false);
            expect(isObject(() => {}))
                .toBe(false);
            expect(isObject(new Date()))
                .toBe(false);
        });
    });

    describe('isNode', () => {
        const isNode = utils().isNode;

        it('should return false for all other values', () => {
            expect(isNode(undefined))
                .toBe(false);
            expect(isNode(null))
                .toBe(false);
            expect(isNode(0))
                .toBe(false);
            expect(isNode('a'))
                .toBe(false);
            expect(isNode([]))
                .toBe(false);
            expect(isNode({}))
                .toBe(false);
            expect(isNode(() => {}))
                .toBe(false);
        });
    });

    describe('err', () => {
        const err = utils().err;

        it('should throw an error', () => {
            expect(err)
                .toThrow(Error);
        });

        it('should throw an error that blames okwolo', () => {
            expect(err)
                .toThrow(/okwolo/);
        });

        it('should throw an error that includes the custom message', () => {
            let message = 'test123';
            expect(() => err(message))
                .toThrow(new RegExp(message));
        });
    });

    describe('assert', () => {
        const assert = utils().assert;

        it('should throw an error when false', () => {
            expect(() => assert(false))
                .toThrow(Error);
        });

        it('should not throw an error when true', () => {
            expect(() => assert(true))
                .not.toThrow(Error);
        });

        it('should throw an error that blames okwolo', () => {
            expect(() => assert(false))
                .toThrow(/okwolo/);
        });

        it('should throw an error that includes the custom message', () => {
            let message = 'test123';
            expect(() => assert(false, message))
                .toThrow(new RegExp(message));
        });

        it('should append the contents of the culprit', () => {
            expect(() => assert(false, 'test', {testKey: () => {}}))
                .toThrow(/testKey[^\n]*\(\) *=> *{}/);
        });
    });

    describe('makeQueue', () => {
        const makeQueue = utils().makeQueue;

        it('should immediately call new functions when empty', () => {
            const test = jest.fn();
            const queue = makeQueue();
            queue.add(test);
            expect(test)
                .toHaveBeenCalled();
        });

        it('should not proceed until the first function call is done', () => {
            const test1 = jest.fn();
            const test2 = jest.fn();
            const queue = makeQueue();
            queue.add(test1);
            queue.add(test2);
            expect(test2)
                .toHaveBeenCalledTimes(0);
        });

        it('should call functions in the order they were added', (done) => {
            const queue = makeQueue();
            let callOrder = [];
            let numTests = 2 + Math.floor(Math.random()*8);
            for (let i = 0; i < numTests; ++i) {
                queue.add(() => {
                    setTimeout(() => {
                        callOrder.push(i);
                        queue.done();
                    }, Math.random()*numTests*2);
                });
            }
            queue.add(() => {
                for (let i = 0; i < numTests; ++i) {
                    expect(callOrder[i])
                        .toBe(i);
                }
                done();
            });
        });
    });

    describe('blobHandler', () => {
        const blobHandler = utils().blobHandler;

        it('should reject malformed blobs', () => {
            expect(() => blobHandler({}, true))
                .toThrow(/blob/);
        });

        it('should call the function described in the blob', () => {
            const test = jest.fn();
            blobHandler({test}, {test: null});
            expect(test)
                .toHaveBeenCalled();
        });

        it('should pass the object to the blob handler function', () => {
            const test = jest.fn();
            blobHandler({test}, {test: {a: 'test123'}});
            expect(test)
                .toHaveBeenCalledWith({a: 'test123'});
        });

        it('should call the blob handler function multiple times for an array', () => {
            const test = jest.fn();
            blobHandler({test}, {test: [null, null]});
            expect(test)
                .toHaveBeenCalledTimes(2);
        });

        it('should call the blob handler for each key in the blob object', () => {
            const test1 = jest.fn();
            const test2 = jest.fn();
            blobHandler({test1, test2}, {test1: null, test2: null});
            expect(test1)
                .toHaveBeenCalled();
            expect(test2)
                .toHaveBeenCalled();
        });

        it('should do nothing if there are no blob handler functions for a key in the blob object', () => {
            const test = jest.fn();
            expect(() => blobHandler({test}, {differentTest: null}))
                .not.toThrow(Error);
            expect(test)
                .toHaveBeenCalledTimes(0);
        });

        it('should use a queue if provided', (done) => {
            const test = jest.fn();
            let queue = utils().makeQueue();
            queue.add(() => setTimeout(queue.done, 30));
            blobHandler({test}, {test: null}, queue);
            queue.add(() => {
                expect(test)
                    .toHaveBeenCalled();
                done();
            });
            expect(test)
                .toHaveBeenCalledTimes(0);
        });

        it('should return an array', () => {
            expect(blobHandler({}, {}))
                .toBeInstanceOf(Array);
        });

        it('should return an array for each key in blob', () => {
            expect(blobHandler({}, {test: ''}))
                .toHaveLength(1);
            expect(blobHandler({}, {test: '', test2: ''}))
                .toHaveLength(2);
        });

        it('should make each key\'s array the same length as the number of inputs', () => {
            expect(blobHandler({}, {test: ''})[0])
                .toHaveLength(1);
            expect(blobHandler({}, {test: ['', '']})[0])
                .toHaveLength(2);
        });

        it('should use null as the default value when there is no handler', () => {
            expect(blobHandler({}, {test: ''})[0][0])
                .toBe(null);
        });

        it('should return the return values of handlers', () => {
            expect(blobHandler({
                test: () => true,
            }, {test: ''})[0][0])
                .toBe(true);
        });

        it('should default to a null value for each element when using a queue', () => {
            let queue = utils().makeQueue();
            expect(blobHandler({
                test: () => true,
            }, {test: ''}, queue)[0][0])
                .toBe(null);
        });

        it('should only accept one blob of the same name', () => {
            const test = jest.fn();
            blobHandler({test}, {test: 'test', name: 'name'});
            expect(test)
                .toHaveBeenCalledTimes(1);
            blobHandler({test}, {test: 'test', name: 'name'});
            expect(test)
                .toHaveBeenCalledTimes(1);
        });
    });
});
