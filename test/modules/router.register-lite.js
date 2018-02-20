'use strict';

const rrl = require('../../src/modules/router.register-lite');

let register;

o(({on}) => {
    on('blob.register', (f) => register = f);
}, rrl);

describe('router.register-lite', () => {
    it('should use a register blob', () => {
        expect(register)
            .toBeInstanceOf(Function);
    });

    it('should apped to and return the store', () => {
        const store = register([0, 0], '/test', null);
        expect(store)
            .toHaveLength(3);
    });

    it('should register paths in the correct format', () => {
        const handler = () => 0;
        const [path] = register([], '/test', handler);
        expect(path)
            .toBeInstanceOf(Object);
        expect(path.keys)
            .toBeInstanceOf(Array);
        expect(path.pattern)
            .toBeInstanceOf(RegExp);
        expect(path.handler)
            .toBe(handler);
    });

    it('should support the catch-all path', () => {
        const handler = () => 0;
        const [path] = register([], '**', handler);
        expect(path.keys)
            .toEqual([]);
        expect(path.pattern.toString())
            .toBe('/.*/g');
        expect(path.handler)
            .toBe(handler);
    });

    it('should support raw regexp', () => {
        const handler = () => 0;
        const [path] = register([], /test/gi, handler);
        expect(path.keys)
            .toEqual([]);
        expect(path.pattern.toString())
            .toBe('/test/gi');
        expect(path.handler)
            .toBe(handler);
    });

    it('should support raw regexp capture groups', () => {
        const handler = () => 0;
        const [path] = register([], /\/(\w+-)?test(?:\/(id))?/g, handler);
        expect(path.keys)
            .toEqual([
                {name: 0},
                {name: 1},
            ]);
    });

    it('should correctly identify the path\'s keys', () => {
        let [{keys}] = register([], '/:test:key/:id::0:');
        expect(keys)
            .toEqual([
                {name: 'test'},
                {name: 'key'},
                {name: 'id'},
                {name: '0'},
            ]);
    });

    it('should generate a pattern that accepts keys', () => {
        let [{pattern}] = register([], '/:test/:id-:0');
        expect(pattern.exec('/abcd/abc-d'))
            .toBeTruthy();
        expect(pattern.exec('/abcd/abc'))
            .toBeFalsy();
        expect(pattern.exec('/456/0-321'))
            .toBeTruthy();
    });

    it('should generate a pattern that ignores query strings', () => {
        let [{pattern}] = register([], '/:test');
        expect(pattern.exec('/abcd'))
            .toBeTruthy();
        expect(pattern.exec('/dcba?key=value'))
            .toBeTruthy();

        [{pattern}] = register([], '/test');
        expect(pattern.exec('/test'))
            .toBeTruthy();
        expect(pattern.exec('/test?key=value'))
            .toBeTruthy();
    });

    it('should generate a pattern that ignores hash changes', () => {
        let [{pattern}] = register([], '/:test');
        expect(pattern.exec('/abcd#'))
            .toBeTruthy();
        expect(pattern.exec('/dcba#anchor'))
            .toBeTruthy();

        [{pattern}] = register([], '/test');
        expect(pattern.exec('/test#'))
            .toBeTruthy();
        expect(pattern.exec('/test#anchor'))
            .toBeTruthy();
    });

    it('should generate a pattern with escaped special characters', () => {
        let [{pattern}] = register([], '/^[^]*?(\\w+)?$');
        expect(pattern.exec('/^[^]*?(\\w+)?$'))
            .toBeTruthy();
        expect(pattern.exec('/11oo'))
            .toBeFalsy();
    });

    it('should generate a pattern with capture groups for keys', () => {
        let [{pattern}] = register([], '/:test/:id-:0');
        const [, ...result] = pattern.exec('/abcd/abc-d');
        expect(result[0])
            .toBe('abcd');
        expect(result[1])
            .toBe('abc');
        expect(result[2])
            .toBe('d');
    });
});
