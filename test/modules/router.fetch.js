'use strict';

const rf = require('../../src/modules/router.fetch');

let fetch;
const use = (blob) => {
    fetch = blob.fetch;
};
rf({use});

describe('router.fetch', () => {
    it('should use a fetch blob', () => {
        expect(fetch)
            .toBeInstanceOf(Function);
    });

    it('should run the handler of a matching path', () => {
        const test = jest.fn();
        fetch([{
            pattern: /\/test.*/g,
            keys: [],
            handler: test,
        }], '/test');
        expect(test)
            .toHaveBeenCalledTimes(1);
    });

    it('should run only one handler', () => {
        const test = jest.fn();
        fetch([
            {
                pattern: /\/test.*/g,
                keys: [],
                handler: test,
            },
            {
                pattern: /\/test.*/g,
                keys: [],
                handler: test,
            },
        ], '/test');
        expect(test)
            .toHaveBeenCalledTimes(1);
    });

    it('should return true when match is found', () => {
        const test = jest.fn();
        expect(fetch([{
            pattern: /\/test.*/g,
            keys: [],
            handler: test,
        }], '/xxxx'))
            .toBe(false);
        expect(test)
            .toHaveBeenCalledTimes(0);
        expect(fetch([{
            pattern: /\/test.*/g,
            keys: [],
            handler: test,
        }], '/test'))
            .toBe(true);
        expect(test)
            .toHaveBeenCalledTimes(1);
    });

    it('should pass params to the handler', () => {
        const test = jest.fn();
        const params = {test};
        fetch([{
            pattern: /\/test.*/g,
            keys: [],
            handler: test,
        }], '/test', params);
        expect(test)
            .toHaveBeenCalledWith(params);
    });

    it('should add keys to the params', () => {
        const test = jest.fn();
        fetch([{
            pattern: /\/(\w+)\/test\/(\w+).*/g,
            keys: [
                {name: 'key1'},
                {name: 'key2'},
            ],
            handler: test,
        }], '/123/test/321', {test: true});
        expect(test)
            .toHaveBeenCalledWith({
                test: true,
                key1: '123',
                key2: '321',
            });
    });
});
