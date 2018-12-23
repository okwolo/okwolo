'use strict';

const h = require('../src/h');

describe('h', () => {
    it('should read the tagName from the first argument', () => {
        expect(h('div')[0])
            .toEqual('div');
    });

    it('should fail when given malformed tagName', () => {
        expect(() => h({}))
            .toThrow(/tagName/);
    });

    it('should read attributes from the second argument', () => {
        expect(h('div', {id: 'test'}))
            .toEqual(['div', {id: 'test'}, []]);
    });

    it('should fail when given malformed attributes', () => {
        expect(() => h('div', 'test'))
            .toThrow(/attribute/);
    });

    it('should not fail when attributes or children are omitted', () => {
        expect(() => h('div'))
            .not.toThrow(Error);
    });

    it('should accumulate children after the second argument', () => {
        expect(h('div', null, 'apple', 'orange', 'watermelon'))
            .toEqual(['div', {}, ['apple', 'orange', 'watermelon']]);
    });

    it('should be nestable', () => {
        expect(h('div', null, h('span', null, 'test')))
            .toEqual(['div', {}, [['span', {}, ['test']]]]);
    });

    it('should support object spread output', () => {
        expect(
            h('div', null,
                h('div'),
                {
                    0: h('div', null, 'a'),
                    1: h('div', null, 'b'),
                },
                h('div', null,
                    {},
                )
            )
        ).toEqual(
            ['div', {}, [
                ['div', {}, []],
                ['div', {}, ['a']],
                ['div', {}, ['b']],
                ['div', {}, []],
            ]]
        );
    });
});
