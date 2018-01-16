'use strict';

const vb = require('../../src/modules/view.build');

let build;

o(
    ({on}) => on('blob.build', (b) => build = b),
    vb,
);

describe('view.build', () => {
    it('should accept null', () => {
        const element = null;
        const vdom = {
            text: '',
        };
        expect(build(element))
            .toEqual(vdom);
    });

    it('should accept booleans', () => {
        const element1 = true;
        const element2 = false;
        const vdom = {
            text: '',
        };
        expect(build(element1))
            .toEqual(vdom);
        expect(build(element2))
            .toEqual(vdom);
    });

    it('should accept numbers', () => {
        const element = 42;
        const vdom = {
            text: '42',
        };
        expect(build(element))
            .toEqual(vdom);
    });

    it('should accept text', () => {
        const element = 'test string';
        const vdom = {
            text: 'test string',
        };
        expect(build(element))
            .toEqual(vdom);
    });

    it('should accept tags', () => {
        const element = ['div', {}, []];
        const vdom = {
            tagName: 'div',
            attributes: {},
            children: {},
            childOrder: [],
        };
        expect(build(element))
            .toEqual(vdom);
    });

    it('should recur over child elements', () => {
        const element = (
            ['div', {}, [
                ['div'],
                'test',
            ]]
        );
        const vdom = {
            tagName: 'div',
            attributes: {},
            children: {
                '0': {
                    tagName: 'div',
                    attributes: {},
                    children: {},
                    childOrder: [],
                },
                '1': {
                    text: 'test',
                },
            },
            childOrder: [
                '0',
                '1',
            ],
        };
        expect(build(element))
            .toEqual(vdom);
    });

    it('should accept components', () => {
        const element = [() => () => 'test'];
        const vdom = {
            text: 'test',
        };
        expect(build(element))
            .toEqual(vdom);
    });

    it('should reject other types', () => {
        const element = undefined;
        expect(() => build(element))
            .toThrow(/type/g);
    });

    it('should give error context about the broken element\'s parent', () => {
        const element1 = undefined;
        const element2 = ['div.test', {}, [
            ['div'],
            ['span#test | height: 2px;', {}, [[]]],
        ]];
        expect(() => build(element1))
            .toThrow(/root/g);
        expect(() => build(element2))
            .toThrow(/root -> div\.test -> span#test \| heig\.\.\. -> \{\{0\}\}/g);
    });

    it('should pass props and children to components', () => {
        const component = ({test, children}) => () => {
            expect(test)
                .toBeTruthy();
            expect(children)
                .toEqual(['test']);
            return 'test';
        };
        const element = [component, {test: true}, ['test']];
        const vdom = {
            text: 'test',
        };
        expect(build(element))
            .toEqual(vdom);
    });

    it('should reject invalid element tag', () => {
        const element = [{}];
        expect(() => build(element))
            .toThrow(/tag.*string[^]*\{\}/g);
    });

    it('should reject invalid element attributes', () => {
        const element = ['div', 'attributes1'];
        expect(() => build(element))
            .toThrow(/attributes.*object[^]*attributes1/g);
    });

    it('should reject duplicate element keys', () => {
        const element = ['div', {}, [
            ['div', {key: 'duplicateKey'}],
            ['div', {key: 'duplicateKey'}],
        ]];
        expect(() => build(element))
            .toThrow(/duplicate.*key[^]*duplicateKey/g);
    });

    it('should reject invalid element key types', () => {
        const element = ['div', {}, [
            ['div', {key: {}}],
        ]];
        expect(() => build(element))
            .toThrow(/invalid.*key.*type[^]*{}/g);
    });

    it('should reject invalid element key characters', () => {
        const element = ['div', {}, [
            ['div', {key: '!@#$%^&*()'}],
        ]];
        expect(() => build(element))
            .toThrow(/invalid.*character.*key[^]*\!\@\#\$\%\^\&\*\(\)/g);
    });

    it('should prioritize given keys', () => {
        const element1 = ['div', {}, [
            ['div'],
        ]];
        const element2 = ['div', {}, [
            ['div', {key: 2}],
        ]];
        expect(build(element1))
            .toEqual({
                tagName: 'div',
                attributes: {},
                children: {
                    '0': {
                        tagName: 'div',
                        attributes: {},
                        children: {},
                        childOrder: [],
                    },
                },
                childOrder: ['0'],
            });
        expect(build(element2))
            .toEqual({
                tagName: 'div',
                attributes: {},
                children: {
                    '2': {
                        tagName: 'div',
                        attributes: {
                            key: 2,
                        },
                        children: {},
                        childOrder: [],
                    },
                },
                childOrder: ['2'],
            });
    });

    it('should reject invalid element children', () => {
        const element = ['div', 'attributes1'];
        expect(() => build(element))
            .toThrow(/attributes.*object[^]*attributes1/g);
    });

    it('should accept omitted children', () => {
        const element = ['div', {}];
        const vdom = {
            tagName: 'div',
            attributes: {},
            children: {},
            childOrder: [],
        };
        expect(build(element))
            .toEqual(vdom);
    });

    it('should accept omitted attributes', () => {
        const element = ['div'];
        const vdom = {
            tagName: 'div',
            attributes: {},
            children: {},
            childOrder: [],
        };
        expect(build(element))
            .toEqual(vdom);
    });

    it('should reject invalid component props', () => {
        const element = [() => () => 'test', 'props1'];
        expect(() => build(element))
            .toThrow(/props.*object[^]*props1/g);
    });

    it('should reject invalid component children', () => {
        const element = [() => () => 'test', {}, 'children1'];
        expect(() => build(element))
            .toThrow(/children.*array[^]*children1/g);
    });

    it('should extract element\'s id from the tag', () => {
        const element = ['div#id'];
        const vdom = {
            tagName: 'div',
            attributes: {
                id: 'id',
            },
            children: {},
            childOrder: [],
        };
        expect(build(element))
            .toEqual(vdom);
    });

    it('should prioritize attribute\'s id', () => {
        const element = ['div#id1', {id: 'id2'}];
        const vdom = {
            tagName: 'div',
            attributes: {
                id: 'id2',
            },
            children: {},
            childOrder: [],
        };
        expect(build(element))
            .toEqual(vdom);
    });

    it('should extract element\'s className(s) from the tag', () => {
        const element = ['div.class1.class2'];
        const vdom = {
            tagName: 'div',
            attributes: {
                className: 'class1 class2',
            },
            children: {},
            childOrder: [],
        };
        expect(build(element))
            .toEqual(vdom);
    });

    it('should combine classNames form the tag and the attributes', () => {
        const element = ['div.class1', {className: 'class2'}];
        const vdom = {
            tagName: 'div',
            attributes: {
                className: 'class2 class1',
            },
            children: {},
            childOrder: [],
        };
        expect(build(element))
            .toEqual(vdom);
    });

    it('should extract element\'s styles from the tag', () => {
        const element = ['div | width: 2px;'];
        const vdom = {
            tagName: 'div',
            attributes: {
                style: 'width: 2px;',
            },
            children: {},
            childOrder: [],
        };
        expect(build(element))
            .toEqual(vdom);
    });

    it('should place attribute\'s styles after tag\'s', () => {
        const element = ['div | width: 2px;', {style: 'width: 4px;'}];
        const vdom = {
            tagName: 'div',
            attributes: {
                style: 'width: 2px;width: 4px;',
            },
            children: {},
            childOrder: [],
        };
        expect(build(element))
            .toEqual(vdom);
    });
});
