'use strict';

const v = require('../../src/modules/view');
const vb = require('../../src/modules/view.build');
const vd = require('../../src/modules/view.dom');

describe('view.dom', () => {
    beforeEach(() => {
        wrapper = document.createElement('div');
        document.body.appendChild(wrapper);
    });

    afterEach(() => {
        document.body.removeChild(wrapper);
        wrapper = null;
    });

    describe('blob', () => {
        describe('draw', () => {
            it('should render the initial state immediately', async () => {
                const app = o(v, vb, vd);
                app.send('state', {});
                app.send('blob.builder', () => ['test']);
                await sleep();
                expect(wrapper.innerHTML.length)
                    .toBeGreaterThan(0);
            });

            it('should remove all other elements in the target', async () => {
                const app = o(v, vb, vd);
                wrapper.innerHTML = '<div></div>';
                expect(wrapper.querySelectorAll('div'))
                    .toHaveLength(1);
                app.send('state', {});
                app.send('blob.builder', () => 'test');
                await sleep();
                expect(wrapper.querySelectorAll('div'))
                    .toHaveLength(0);
            });
        });

        describe('build', () => {
            it('should create textNodes out of strings', async () => {
                const app = o(v, vb, vd);
                app.send('state', {});
                app.send('blob.builder', () => 'test');
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test');
            });

            it('should create elements out of arrays', async () => {
                const app = o(v, vb, vd);
                app.send('state', {});
                app.send('blob.builder', () => ['span']);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<span></span>');
            });

            it('should create nothing when given null', async () => {
                const app = o(v, vb, vd);
                app.send('state', {});
                app.send('blob.builder', () => null);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('');
            });

            it('should create nothing when given a boolean', async () => {
                const app = o(v, vb, vd);
                app.send('state', {});
                app.send('blob.builder', () => true);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('');
                app.send('blob.builder', () => false);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('');
            });

            it('should render numbers', async () => {
                const app = o(v, vb, vd);
                app.send('state', {});
                app.send('blob.builder', () => 123456789);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('123456789');
            });

            it('should read the tagName from the first element in the array', async () => {
                const app = o(v, vb, vd);
                app.send('state', {});
                app.send('blob.builder', () => ['test']);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test></test>');
            });

            it('should read the attributes from the second element in the array', async () => {
                const app = o(v, vb, vd);
                app.send('state', {});
                app.send('blob.builder', () => ['test', {id: 'test'}]);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test id="test"></test>');
            });

            it('should implement classnames logic', async () => {
                const app = o(v, vb, vd);
                app.send('state', {});
                app.send('blob.builder', () => ['test', {className: {
                    test1: true,
                    test2: undefined,
                }}]);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test class="test1"></test>');
                app.send('blob.builder', () => ['test.test4', {className: [
                    'test1',
                    {test2: false, test3: true},
                    ['test5', {test6: true}],
                ]}]);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test class="test1 test3 test5 test6 test4"></test>');
            });

            it('should be possible to append an id to the tagName using #', async () => {
                const app = o(v, vb, vd);
                app.send('state', {});
                app.send('blob.builder', () => ['test#test']);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test id="test"></test>');
            });

            it('should be possible to append an classNames to the tagName using .', async () => {
                const app = o(v, vb, vd);
                app.send('state', {});
                app.send('blob.builder', () => ['test.test.test', {className: 'tt'}]);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test class="tt test test"></test>');
            });

            it('should be possible to append styles to the tagName using |', async () => {
                const app = o(v, vb, vd);
                app.send('state', {});
                app.send('blob.builder', () => ['test|height:2px;', {style: 'width: 2px;'}]);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test style="height: 2px; width: 2px;"></test>');
            });

            it('should read the children from the third element in the array', async () => {
                const app = o(v, vb, vd);
                app.send('state', {});
                app.send('blob.builder', () => ['test', {}, ['test']]);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test>test</test>');
            });

            it('should accept components', async () => {
                const app = o(v, vb, vd);
                app.send('state', {});
                const component = () => 'test';
                app.send('blob.builder', () => [component]);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test');
            });

            it('should pass arguments to components', async () => {
                const app = o(v, vb, vd);
                app.send('state', {});
                const component = ({a}) => a;
                app.send('blob.builder', () => [component, {a: 'test'}]);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test');
            });

            it('should pass children to component', async () => {
                const app = o(v, vb, vd);
                app.send('state', {});
                const component = ({children}) => children[0];
                app.send('blob.builder', () => [component, {}, ['test']]);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test');
            });

            it('should support nested components', async () => {
                const app = o(v, vb, vd);
                app.send('state', {});
                const component3 = ({c}) => c;
                const component2 = ({b}) => [component3, {c: b}];
                const component1 = ({a}) => [component2, {b: a}];
                app.send('blob.builder', () => [component1, {a: 'test'}]);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test');
            });

            it('should fail when given malformed tagName', () => {
                const app = o(v, vb, vd);
                app.send('state', {});
                expect(() => app.send('blob.builder', () => [{}]))
                    .toThrow(/tag/);
            });

            it('should fail when given malformed attributes', () => {
                const app = o(v, vb, vd);
                app.send('state', {});
                expect(() => app.send('blob.builder', () => ['div', 'test']))
                    .toThrow(/attribute/);
            });

            it('should not fail when attributes or children are ommitted', () => {
                const app = o(v, vb, vd);
                app.send('state', {});
                expect(() => app.send('blob.builder', () => ['div']))
                    .not.toThrow(Error);
            });
        });

        describe('update', () => {
            it('should rerender the new dom', async () => {
                const app = o(v, vb, vd);
                app.send('blob.builder', (s) => [s, {}, [s]]);
                app.send('state', 'a');
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<a>a</a>');
                app.send('state', 'b');
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<b>b</b>');
            });

            it('should correctly add tag elements', async () => {
                const app = o(v, vb, vd);
                app.send('blob.builder', (s) => s);
                app.send('state', (
                    ['div', {}, [
                        ['first', {key: 'key2'}],
                        ['fourth'],
                    ]]
                ));
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe(
                        '<div>' +
                            '<first></first>' +
                            '<fourth></fourth>' +
                        '</div>'
                    );
                app.send('state', (
                    ['div', {}, [
                        ['first', {key: 'key1'}],
                        ['second', {key: 'key2'}],
                        ['third', {key: 'key3'}],
                        ['fourth', {key: 'key4'}],
                    ]]
                ));
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe(
                        '<div>' +
                            '<first></first>' +
                            '<second></second>' +
                            '<third></third>' +
                            '<fourth></fourth>' +
                        '</div>'
                    );
            });

            it('should correctly add text elements', async () => {
                const app = o(v, vb, vd);
                app.send('blob.builder', (s) => s);
                app.send('state', (
                    ['div', {}, [
                        'first',
                        'fourth',
                    ]]
                ));
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe(
                        '<div>' +
                            'first' +
                            'fourth' +
                        '</div>'
                    );
                app.send('state', (
                    ['div', {}, [
                        'first',
                        'second',
                        'third',
                        'fourth',
                    ]]
                ));
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe(
                        '<div>' +
                            'first' +
                            'second' +
                            'third' +
                            'fourth' +
                        '</div>'
                    );
            });

            it('should correctly add mixed elements', async () => {
                const app = o(v, vb, vd);
                app.send('blob.builder', (s) => s);
                app.send('state', (
                    ['div', {}, [
                        'first',
                        ['third', {key: 'key1'}],
                    ]]
                ));
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe(
                        '<div>' +
                            'first' +
                            '<third></third>' +
                        '</div>'
                    );
                app.send('state', (
                    ['div', {}, [
                        'first',
                        'second',
                        ['third', {key: 'key1'}],
                        ['fourth'],
                        'fifth',
                    ]]
                ));
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe(
                        '<div>' +
                            'first' +
                            'second' +
                            '<third></third>' +
                            '<fourth></fourth>' +
                            'fifth' +
                        '</div>'
                    );
            });

            it('should be able to swap keyed elements', async () => {
                const app = o(v, vb, vd);
                app.send('blob.builder', (s) => s);
                app.send('state', (
                    ['div', {}, [
                        ['first', {key: 'key1'}],
                        ['second', {key: 'key2'}],
                        ['third', {key: 'key3'}],
                        ['fourth', {key: 'key4'}],
                        ['fifth', {key: 'key5'}],
                    ]]
                ));
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe(
                        '<div>' +
                            '<first></first>' +
                            '<second></second>' +
                            '<third></third>' +
                            '<fourth></fourth>' +
                            '<fifth></fifth>' +
                        '</div>'
                    );
                app.send('state', (
                    ['div', {}, [
                        ['first', {key: 'key1'}],
                        ['fourth', {key: 'key4'}],
                        ['third', {key: 'key3'}],
                        ['second', {key: 'key2'}],
                        ['fifth', {key: 'key5'}],
                    ]]
                ));
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe(
                        '<div>' +
                            '<first></first>' +
                            '<fourth></fourth>' +
                            '<third></third>' +
                            '<second></second>' +
                            '<fifth></fifth>' +
                        '</div>'
                    );
            });

            it('should reorder keyed elements', async () => {
                const app = o(v, vb, vd);
                app.send('blob.builder', (s) => s);
                app.send('state', (
                    ['div', {}, [
                        ['first', {key: 'key1'}],
                        ['second', {key: 'key2'}],
                    ]]
                ));
                await sleep();
                const first = wrapper.querySelector('first');
                expect(wrapper.innerHTML)
                    .toBe(
                        '<div>' +
                            '<first></first>' +
                            '<second></second>' +
                        '</div>'
                    );
                app.send('state', (
                    ['div', {}, [
                        ['second', {key: 'key2'}],
                        ['third', {key: 'key3'}],
                        ['first', {key: 'key1'}],
                    ]]
                ));
                await sleep();
                expect(wrapper.querySelector('first'))
                    .toBe(first);
                expect(wrapper.innerHTML)
                    .toBe(
                        '<div>' +
                            '<second></second>' +
                            '<third></third>' +
                            '<first></first>' +
                        '</div>'
                    );
            });

            it('should not replace elements when the tagName doesn\'t change', async () => {
                const app = o(v, vb, vd);
                app.send('blob.builder', (s) => ['div' + s]);
                app.send('state', '');
                await sleep();
                const element = wrapper.children[0];
                app.send('state', '#id.class|height:0px;');
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<div id="id" class="class" style="height: 0px;"></div>');
                expect(wrapper.children[0])
                    .toBe(element);
            });

            it('should be able to delete elements', async () => {
                const app = o(v, vb, vd);
                app.send('blob.builder', (s) => ['div', {}, s.split('').map((l) => [l])]);
                app.send('state', 'abc');
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe(
                        '<div>' +
                            '<a></a>' +
                            '<b></b>' +
                            '<c></c>' +
                        '</div>'
                    );
                app.send('state', 'a');
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe(
                        '<div>' +
                            '<a></a>' +
                        '</div>'
                    );
                app.send('state', 'cd');
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe(
                        '<div>' +
                            '<c></c>' +
                            '<d></d>' +
                        '</div>'
                    );
            });

            it('should be able to replace all elements', async () => {
                const app = o(v, vb, vd);
                app.send('blob.builder', (s) => s);
                app.send('state', '');
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('');
                app.send('state', 'test1');
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test1');
                app.send('state', 'test2');
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test2');
                app.send('state', ['test3', {}, ['test3']]);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test3>test3</test3>');
                app.send('state', ['test4', {}, [['test4']]]);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test4><test4></test4></test4>');
                app.send('state', '');
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('');
                app.send('state', 'test5');
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test5');
            });

            it('should diff according to the element keys', async () => {
                const app = o(v, vb, vd);
                app.send('blob.builder', (s) => s);
                app.send('state', (
                    ['div', {}, [
                        ['div.first', {key: 'first'}],
                        ['div.second', {key: 'second'}],
                    ]]
                ));
                await sleep();
                const first = wrapper.querySelector('.first');
                const second = wrapper.querySelector('.second');
                app.send('state', (
                    ['div', {}, [
                        ['div.second', {key: 'second'}],
                        ['div.first', {key: 'first'}],
                    ]]
                ));
                await sleep();
                expect(wrapper.querySelector('.first'))
                    .toBe(first);
                expect(wrapper.querySelector('.second'))
                    .toBe(second);
            });
        });
    });
});
