'use strict';

const utils = require('../src/utils');

describe('utils', () => {
    describe('deepCopy', () => {
        const {deepCopy} = utils;

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
        const {isDefined} = utils;

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
        const {isNull} = utils;

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
        const {isArray} = utils;

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
        const {isString} = utils;

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
        const {isFunction} = utils;

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
        const {isNumber} = utils;

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
        const {isBoolean} = utils;

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
        const {isObject} = utils;

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
        const {isNode} = utils;

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
        const {isRegExp} = utils;

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
        const {assert} = utils;

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
        const {makeQueue} = utils;

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

    describe('cache', () => {
        const {cache} = utils;

        it('should cache values', () => {
            const c = cache();
            c.set('a', '1');
            expect(c.get('a'))
                .toBe('1');
            c.set('ab', '2');
            c.set('abc', '3');
            expect(c.get('a'))
                .toBe('1');
            expect(c.get('ab'))
                .toBe('2');
            expect(c.get('abc'))
                .toBe('3');
        });

        it('should return undefined on miss', () => {
            const c = cache();
            expect(c.get('a'))
                .toBe(undefined);
        });

        it('should allow size limit', () => {
            const c = cache(2);
            const test = {};
            c.set('1', test);
            c.set('2', test);
            c.set('3', test);
            expect(c.get('3'))
                .toBe(test);
            expect(c.get('2'))
                .toBe(test);
            expect(c.get('1'))
                .not.toBe(test);
        });

        it('erased cache items should be undefined', () => {
            const c = cache(0);
            c.set('test', null);
            expect(c.get('test'))
                .toBe(undefined);
        });
    });

    describe('classnames', () => {
        const {classnames} = utils;

        it('should concat string arguments', () => {
            expect(classnames())
                .toBe('');
            expect(classnames('a', 'b', 'c'))
                .toBe('a b c');
        });

        it('should spread array arguments', () => {
            expect(classnames(['a', 'b', 'c']))
                .toBe('a b c');
            expect(classnames(['a', 'b'], ['c']))
                .toBe('a b c');
        });

        it('should spread nested array arguments', () => {
            expect(classnames([['a', ['b']], 'c']))
                .toBe('a b c');
        });

        it('should extract truthy object keys', () => {
            expect(classnames({
                a: true,
                1: false,
                b: new Date(),
                2: null,
                c: {},
            }))
                .toBe('a b c');
            expect(classnames({a: 1, b: 1}, {c: 1, d: 0}))
                .toBe('a b c');
        });

        it('should extract truthy keys from arrays of objects', () => {
            expect(classnames([{a: 1, b: 2}, [[{c: 1}]]]))
                .toBe('a b c');
        });

        it('should ignore falsy values', () => {
            expect(classnames(null, [undefined], [[false]]))
                .toBe('');
        });
    });

    describe('Genealogist', () => {
        const {Genealogist} = utils;

        describe('add', () => {
            it('should add an ancestor to the list', () => {
                let g = new Genealogist();
                g = g.add('tag1', 'key1');
                expect(g.list.length)
                    .toBe(1);
                g = g.add('tag2', 'key2');
                expect(g.list.length)
                    .toBe(2);
            });

            it('should not mutate the list', () => {
                let g = new Genealogist();
                g = g.add('tag1', 'key1');
                expect(g.list.length)
                    .toBe(1);
                g.add('tag2', 'key2');
                expect(g.list.length)
                    .toBe(1);
            });
        });

        describe('addUnsafe', () => {
            it('should add an ancestor to the list', () => {
                let g = new Genealogist();
                g = g.addUnsafe('tag1', 'key1');
                expect(g.list.length)
                    .toBe(1);
                g = g.addUnsafe('tag2', 'key2');
                expect(g.list.length)
                    .toBe(2);
            });

            it('should mutate the list', () => {
                const g = new Genealogist();
                g.addUnsafe('tag1', 'key1');
                expect(g.list.length)
                    .toBe(1);
                g.addUnsafe('tag2', 'key2');
                expect(g.list.length)
                    .toBe(2);
            });
        });

        describe('f', () => {
            it('should print a formatted view of all tags', () => {
                let g = new Genealogist();
                expect(g.f())
                    .toBe('#');
                g = g.add('tag1', 'key1');
                g = g.add('tag2', 'key2');
                expect(g.f())
                    .toBe('#→ tag1→ tag2');
            });

            it('should include the final key if passed as arg', () => {
                let g = new Genealogist();
                g = g.add('tag1', 'key1');
                g = g.add('tag2', 'key2');
                expect(g.f(0))
                    .toBe('#→ tag1→ tag2→ {{0}}');
                expect(g.f('test'))
                    .toBe('#→ tag1→ tag2→ {{test}}');
            });

            it('should pre-compute formatted view on creation', () => {
                let g = new Genealogist();
                g = g.add('tag1', 'key1');
                expect(g.f())
                    .toBe('#→ tag1');
                g.addUnsafe('tag2', 'key2');
                expect(g.f())
                    .toBe('#→ tag1');
            });
        });

        describe('copy', () => {
            it('should copy the ancestry', () => {
                let g = new Genealogist();
                g = g.add('tag1', 'key1');
                const g1 = g.add('tag2', 'key2');
                const g2 = g1.copy();
                expect(g1.list.length)
                    .toBe(g2.list.length);
                expect(g1.f())
                    .toBe(g2.f());
                expect(g1.keys())
                    .toEqual(g2.keys());
            });

            it('should have independent ancestry', () => {
                const g = new Genealogist();
                const g1 = g.add('tag1', 'key1');
                const g2 = g1.copy();
                g2.addUnsafe('tag2', 'key2');
                expect(g1.list.length)
                    .not.toBe(g2.list.length);
                expect(g1.keys())
                    .not.toEqual(g2.keys());
            });
        });

        describe('keys', () => {
            it('should return all keys except the first', () => {
                let g = new Genealogist();
                expect(g.keys())
                    .toEqual([]);
                g = g.add('tag1', 'key1');
                expect(g.keys())
                    .toEqual([]);
                g = g.add('tag2', 'key2');
                expect(g.keys())
                    .toEqual(['key2']);
                g = g.add('tag3', 'key3');
                expect(g.keys())
                    .toEqual(['key2', 'key3']);
            });

            it('should compute compute keys at call time', () => {
                let g = new Genealogist();
                g = g.add('tag1', 'key1');
                expect(g.keys())
                    .toEqual([]);
                g = g.add('tag2', 'key2');
                expect(g.keys())
                    .toEqual(['key2']);
                g.addUnsafe('tag3', 'key3');
                expect(g.keys())
                    .toEqual(['key2', 'key3']);
            });
        });
    });

    // NOTE: longestChain function requires both arrays to be of the same
    //       length, that all the keys are unique and that both arrays have
    //       all the keys. (same values but randomized order)
    describe('longestChain', () => {
        const {longestChain} = utils;

        it('should return the start/end index in first array', () => {
            expect(longestChain(
                ['a', 'b', 'c', 'd', 'e'],
                ['a', 'b', 'c', 'e', 'd'],
            ))
                .toEqual({
                    start: 0,
                    end: 2,
                });
        });

        it('should find the longestChain', () => {
            const cases = 128;
            const scale = 256;

            for (let i = 0; i < cases; i++) {
                const total = 2 + scale * Math.random() >> 0;
                const chain = 1 + (total - 1) * Math.random() >> 0;

                const start = (total - chain) * Math.random() >> 0;
                const end = start + chain;

                const orderedList = Array(total).fill(0).map((a, i) => i);
                const mixedList = orderedList.map((i) => {
                    if (i < start || i > end) {
                        return Math.random();
                    }
                    return i;
                });

                expect(longestChain(orderedList, mixedList))
                    .toEqual({start, end});
            }
        });
    });

    describe('diff', () => {
        const {diff} = utils;

        it('should report modified keys', () => {
            expect(diff({
                a: 0,
                b: 2,
            }, {
                b: 2,
                a: 1,
            }))
                .toEqual(['a']);
        });

        it('should report deleted keys', () => {
            expect(diff({
                a: 0,
                b: 2,
            }, {
                a: 1,
            }))
                .toEqual(['a', 'b']);
        });

        it('should report added keys', () => {
            expect(diff({
                a: 0,
            }, {
                a: 1,
                b: 2,
            }))
                .toEqual(['a', 'b']);
        });

        it('should correctly compare key types', () => {
            const obj = {};
            expect(diff({
                a: 0,
                b: 'b',
                c: null,
                d: undefined,
                e: obj,
            }, {
                a: 0,
                b: 'b',
                c: null,
                d: undefined,
                e: obj,
            }))
                .toEqual([]);
        });

        it('should always report functions', () => {
            const fn = () => 0;
            expect(diff({
                a: fn,
                b: () => 1,
            }, {
                a: fn,
                b: () => 1,
            }))
                .toEqual(['a', 'b']);
        });
    });
});
