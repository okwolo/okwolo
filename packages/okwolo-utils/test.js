'use strict';

const utils = require('./');

describe('@okwolo/utils', () => {
    describe('deepCopy', () => {
        const {deepCopy} = utils();

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
                .not.toBe(func);
        });

        it('should handle null and undefined', () => {
            expect(deepCopy(undefined))
                .toBe(undefined);
            expect(deepCopy(null))
                .toBe(null);
        });

        it('should reject circular structures', () => {
            const a = {};
            const b = {a};
            a.b = b;
            expect(() => deepCopy(a))
                .toThrow(/circular/);
        });
    });

    describe('isDefined', () => {
        const {isDefined} = utils();

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
        const {isNull} = utils();

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
        const {isArray} = utils();

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
        const {isString} = utils();

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
        const {isFunction} = utils();

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

    describe('isNumber', () => {
        const {isNumber} = utils();

        it('should return true when number', () => {
            expect(isNumber(0))
                .toBe(true);
            expect(isNumber(123456789))
                .toBe(true);
        });

        it('should return false for all other values', () => {
            expect(isNumber(undefined))
                .toBe(false);
            expect(isNumber(null))
                .toBe(false);
            expect(isNumber(true))
                .toBe(false);
            expect(isNumber('a'))
                .toBe(false);
            expect(isNumber({}))
                .toBe(false);
            expect(isNumber([]))
                .toBe(false);
            expect(isNumber(() => {}))
                .toBe(false);
            expect(isNumber(new Date()))
                .toBe(false);
        });
    });

    describe('isBoolean', () => {
        const {isBoolean} = utils();

        it('should return true when boolean', () => {
            expect(isBoolean(true))
                .toBe(true);
            expect(isBoolean(false))
                .toBe(true);
        });

        it('should return false for all other values', () => {
            expect(isBoolean(undefined))
                .toBe(false);
            expect(isBoolean(null))
                .toBe(false);
            expect(isBoolean(0))
                .toBe(false);
            expect(isBoolean('a'))
                .toBe(false);
            expect(isBoolean({}))
                .toBe(false);
            expect(isBoolean([]))
                .toBe(false);
            expect(isBoolean(() => {}))
                .toBe(false);
            expect(isBoolean(new Date()))
                .toBe(false);
        });
    });

    describe('isObject', () => {
        const {isObject} = utils();

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
        const {isNode} = utils();

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

    describe('isRegExp', () => {
        const {isRegExp} = utils();

        it('should return true when RegExp', () => {
            expect(isRegExp(/.*/g))
                .toBe(true);
        });

        it('should return false for all other values', () => {
            expect(isRegExp(undefined))
                .toBe(false);
            expect(isRegExp(null))
                .toBe(false);
            expect(isRegExp(0))
                .toBe(false);
            expect(isRegExp('a'))
                .toBe(false);
            expect(isRegExp([]))
                .toBe(false);
            expect(isRegExp({}))
                .toBe(false);
            expect(isRegExp(() => {}))
                .toBe(false);
        });
    });

    describe('assert', () => {
        const {assert} = utils();

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
        const {makeQueue} = utils();

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

    describe('bus', () => {
        let bus;

        beforeEach(() => {
            bus = utils().bus();
        });

        it('should reject malformed events', () => {
            expect(() => bus(true))
                .toThrow(/event/);
        });

        it('should call the function described in the event', () => {
            const test = jest.fn();
            bus.on('test', test);
            bus({test: null});
            expect(test)
                .toHaveBeenCalled();
        });

        it('should pass the object to the event handler function', () => {
            const test = jest.fn();
            bus.on('test', test);
            bus({test: {a: 'test123'}});
            expect(test)
                .toHaveBeenCalledWith({a: 'test123'});
        });

        it('should call the event handler for each key in the event object', () => {
            const test1 = jest.fn();
            const test2 = jest.fn();
            bus.on('test1', test1);
            bus.on('test2', test2);
            bus({test1: null, test2: null});
            expect(test1)
                .toHaveBeenCalled();
            expect(test2)
                .toHaveBeenCalled();
        });

        it('should do nothing if there are no event handler functions for a key in the event object', () => {
            const test = jest.fn();
            bus.on('test', test);
            expect(() => bus({differentTest: null}))
                .not.toThrow(Error);
            expect(test)
                .toHaveBeenCalledTimes(0);
        });

        it('should use a queue if provided', (done) => {
            const test = jest.fn();
            const queue = utils().makeQueue();
            bus = utils().bus(queue);
            bus.on('test', test);
            queue.add(() => setTimeout(queue.done, 30));
            bus({test: null});
            queue.add(() => {
                expect(test)
                    .toHaveBeenCalled();
                done();
            });
            expect(test)
                .toHaveBeenCalledTimes(0);
        });

        it('should only accept one event of the same name', () => {
            const test = jest.fn();
            bus.on('test', test);
            bus({test: 'test', name: 'name'});
            expect(test)
                .toHaveBeenCalledTimes(1);
            bus({test: 'test', name: 'name'});
            expect(test)
                .toHaveBeenCalledTimes(1);
        });
    });
});
