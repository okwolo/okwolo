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
                app.emit({state: {}});
                app.use({builder: () => ['test']});
                await sleep();
                expect(wrapper.innerHTML.length)
                    .toBeGreaterThan(0);
            });

            it('should remove all other elements in the target', async () => {
                const app = o(v, vb, vd);
                wrapper.innerHTML = '<div></div>';
                expect(wrapper.querySelectorAll('div'))
                    .toHaveLength(1);
                app.emit({state: {}});
                app.use({builder: () => 'test'});
                await sleep();
                expect(wrapper.querySelectorAll('div'))
                    .toHaveLength(0);
            });
        });

        describe('build', () => {
            it('should create textNodes out of strings', async () => {
                const app = o(v, vb, vd);
                app.emit({state: {}});
                app.use({builder: () => 'test'});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test');
            });

            it('should create elements out of arrays', async () => {
                const app = o(v, vb, vd);
                app.emit({state: {}});
                app.use({builder: () => ['span']});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<span></span>');
            });

            it('should create nothing when given null', async () => {
                const app = o(v, vb, vd);
                app.emit({state: {}});
                app.use({builder: () => null});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('');
            });

            it('should create nothing when given a boolean', async () => {
                const app = o(v, vb, vd);
                app.emit({state: {}});
                app.use({builder: () => true});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('');
                app.use({builder: () => false});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('');
            });

            it('should render numbers', async () => {
                const app = o(v, vb, vd);
                app.emit({state: {}});
                app.use({builder: () => 123456789});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('123456789');
            });

            it('should read the tagName from the first element in the array', async () => {
                const app = o(v, vb, vd);
                app.emit({state: {}});
                app.use({builder: () => ['test']});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test></test>');
            });

            it('should read the attributes from the second element in the array', async () => {
                const app = o(v, vb, vd);
                app.emit({state: {}});
                app.use({builder: () => ['test', {id: 'test'}]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test id="test"></test>');
            });

            it('should implement classnames logic', async () => {
                const app = o(v, vb, vd);
                app.emit({state: {}});
                app.use({builder: () => ['test', {className: {
                    test1: true,
                    test2: undefined,
                }}]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test class="test1"></test>');
                app.use({builder: () => ['test.test4', {className: [
                    'test1',
                    {test2: false, test3: true},
                    ['test5', {test6: true}],
                ]}]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test class="test1 test3 test5 test6 test4"></test>');
            });

            it('should be possible to append an id to the tagName using #', async () => {
                const app = o(v, vb, vd);
                app.emit({state: {}});
                app.use({builder: () => ['test#test']});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test id="test"></test>');
            });

            it('should be possible to append an classNames to the tagName using .', async () => {
                const app = o(v, vb, vd);
                app.emit({state: {}});
                app.use({builder: () => ['test.test.test', {className: 'tt'}]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test class="tt test test"></test>');
            });

            it('should be possible to append styles to the tagName using |', async () => {
                const app = o(v, vb, vd);
                app.emit({state: {}});
                app.use({builder: () => ['test|height:2px;', {style: 'width: 2px;'}]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test style="height: 2px; width: 2px;"></test>');
            });

            it('should read the children from the third element in the array', async () => {
                const app = o(v, vb, vd);
                app.emit({state: {}});
                app.use({builder: () => ['test', {}, ['test']]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test>test</test>');
            });

            it('should accept components', async () => {
                const app = o(v, vb, vd);
                app.emit({state: {}});
                const component = () => 'test';
                app.use({builder: () => [component]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test');
            });

            it('should pass arguments to components', async () => {
                const app = o(v, vb, vd);
                app.emit({state: {}});
                const component = ({a}) => a;
                app.use({builder: () => [component, {a: 'test'}]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test');
            });

            it('should pass children to component', async () => {
                const app = o(v, vb, vd);
                app.emit({state: {}});
                const component = ({children}) => children[0];
                app.use({builder: () => [component, {}, ['test']]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test');
            });

            it('should support nested components', async () => {
                const app = o(v, vb, vd);
                app.emit({state: {}});
                const component3 = ({c}) => c;
                const component2 = ({b}) => [component3, {c: b}];
                const component1 = ({a}) => [component2, {b: a}];
                app.use({builder: () => [component1, {a: 'test'}]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test');
            });

            it('should fail when given malformed tagName', () => {
                const app = o(v, vb, vd);
                app.emit({state: {}});
                expect(() => app.use({builder: () => [{}]}))
                    .toThrow(/tag/);
            });

            it('should fail when given malformed attributes', () => {
                const app = o(v, vb, vd);
                app.emit({state: {}});
                expect(() => app.use({builder: () => ['div', 'test']}))
                    .toThrow(/attribute/);
            });

            it('should not fail when attributes or children are ommitted', () => {
                const app = o(v, vb, vd);
                app.emit({state: {}});
                expect(() => app.use({builder: () => ['div']}))
                    .not.toThrow(Error);
            });
        });

        describe('update', () => {
            it('should rerender the new dom', async () => {
                const app = o(v, vb, vd);
                app.use({builder: (s) => [s, {}, [s]]});
                app.emit({state: 'a'});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<a>a</a>');
                app.emit({state: 'b'});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<b>b</b>');
            });

            it('should correctly add tag elements', async () => {
                const app = o(v, vb, vd);
                app.use({builder: (s) => s});
                app.emit({state: (
                    ['div', {}, [
                        ['first', {key: 'key2'}],
                        ['fourth'],
                    ]]
                )});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe(
                        '<div>' +
                            '<first></first>' +
                            '<fourth></fourth>' +
                        '</div>'
                    );
                app.emit({state: (
                    ['div', {}, [
                        ['first', {key: 'key1'}],
                        ['second', {key: 'key2'}],
                        ['third', {key: 'key3'}],
                        ['fourth', {key: 'key4'}],
                    ]]
                )});
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
                app.use({builder: (s) => s});
                app.emit({state: (
                    ['div', {}, [
                        'first',
                        'fourth',
                    ]]
                )});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe(
                        '<div>' +
                            'first' +
                            'fourth' +
                        '</div>'
                    );
                app.emit({state: (
                    ['div', {}, [
                        'first',
                        'second',
                        'third',
                        'fourth',
                    ]]
                )});
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
                app.use({builder: (s) => s});
                app.emit({state: (
                    ['div', {}, [
                        'first',
                        ['third', {key: 'key1'}],
                    ]]
                )});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe(
                        '<div>' +
                            'first' +
                            '<third></third>' +
                        '</div>'
                    );
                app.emit({state: (
                    ['div', {}, [
                        'first',
                        'second',
                        ['third', {key: 'key1'}],
                        ['fourth'],
                        'fifth',
                    ]]
                )});
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

            it('should not replace elements when the tagName doesn\'t change', async () => {
                const app = o(v, vb, vd);
                app.use({builder: (s) => ['div' + s]});
                app.emit({state: ''});
                await sleep();
                const element = wrapper.children[0];
                app.emit({state: '#id.class|height:0px;'});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<div id="id" class="class" style="height: 0px;"></div>');
                expect(wrapper.children[0])
                    .toBe(element);
            });

            it('should be able to delete elements', async () => {
                const app = o(v, vb, vd);
                app.use({builder: (s) => ['div', {}, s.split('').map((l) => [l])]});
                app.emit({state: 'abc'});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe(
                        '<div>' +
                            '<a></a>' +
                            '<b></b>' +
                            '<c></c>' +
                        '</div>'
                    );
                app.emit({state: 'a'});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe(
                        '<div>' +
                            '<a></a>' +
                        '</div>'
                    );
                app.emit({state: 'cd'});
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
                app.use({builder: (s) => s});
                app.emit({state: ''});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('');
                app.emit({state: 'test1'});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test1');
                app.emit({state: 'test2'});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test2');
                app.emit({state: ['test3', {}, ['test3']]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test3>test3</test3>');
                app.emit({state: ['test4', {}, [['test4']]]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test4><test4></test4></test4>');
                app.emit({state: ''});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('');
                app.emit({state: 'test5'});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test5');
            });

            it('should diff according to the element keys', async () => {
                const app = o(v, vb, vd);
                app.use({builder: (s) => s});
                app.emit({state: (
                    ['div', {}, [
                        ['div.first', {key: 'first'}],
                        ['div.second', {key: 'second'}],
                    ]]
                )});
                await sleep();
                const first = wrapper.querySelector('.first');
                const second = wrapper.querySelector('.second');
                app.emit({state: (
                    ['div', {}, [
                        ['div.second', {key: 'second'}],
                        ['div.first', {key: 'first'}],
                    ]]
                )});
                await sleep();
                expect(wrapper.querySelector('.first'))
                    .toBe(first);
                expect(wrapper.querySelector('.second'))
                    .toBe(second);
            });
        });
    });
});
