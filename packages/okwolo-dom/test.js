'use strict';

const {bus} = require('@okwolo/utils')();

const h = require('./h');

const dom = (target) => {
    const exec = bus();
    const use = bus();
    require('./')({exec, use}, window);
    use(require('./blob')(window));
    use({target});
    return {exec, use};
};

let wrapper;

describe('@okwolo/dom', () => {
    beforeEach(() => {
        wrapper = document.createElement('div');
        document.body.appendChild(wrapper);
    });

    afterEach(() => {
        document.body.removeChild(wrapper);
        wrapper = null;
    });

    it('should add the builder function\'s output to the target', async () => {
        const {exec, use} = dom(wrapper);
        exec({state: {}});
        use({builder: () => ['span']});
        await sleep();
        expect(wrapper.children[0].tagName)
            .toBe('SPAN');
    });

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

        it('should not fail when attributes or children are ommitted', () => {
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
    });

    describe('blob', () => {
        describe('draw', () => {
            it('should render the initial state immediately', async () => {
                const {exec, use} = dom(wrapper);
                exec({state: {}});
                use({builder: () => ['test']});
                await sleep();
                expect(wrapper.innerHTML.length)
                    .toBeGreaterThan(0);
            });

            it('should remove all other elements in the target', async () => {
                const {exec, use} = dom(wrapper);
                wrapper.innerHTML = '<div></div>';
                expect(wrapper.querySelectorAll('div'))
                    .toHaveLength(1);
                exec({state: {}});
                use({builder: () => 'test'});
                await sleep();
                expect(wrapper.querySelectorAll('div'))
                    .toHaveLength(0);
            });
        });

        describe('build', () => {
            it('should create textNodes out of strings', async () => {
                const {exec, use} = dom(wrapper);
                exec({state: {}});
                use({builder: () => 'test'});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test');
            });

            it('should create elements out of arrays', async () => {
                const {exec, use} = dom(wrapper);
                exec({state: {}});
                use({builder: () => ['span']});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<span></span>');
            });

            it('should create nothing when given null', async () => {
                const {exec, use} = dom(wrapper);
                exec({state: {}});
                use({builder: () => null});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('');
            });

            it('should read the tagName from the first element in the array', async () => {
                const {exec, use} = dom(wrapper);
                exec({state: {}});
                use({builder: () => ['test']});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test></test>');
            });

            it('should read the attributes from the second element in the array', async () => {
                const {exec, use} = dom(wrapper);
                exec({state: {}});
                use({builder: () => ['test', {id: 'test'}]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test id="test"></test>');
            });

            it('should implement classnames logic', async () => {
                const {exec, use} = dom(wrapper);
                exec({state: {}});
                use({builder: () => ['test', {className: {
                    test1: true,
                    test2: undefined,
                }}]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test class="test1"></test>');
                use({builder: () => ['test.test4', {className: [
                    'test1',
                    {test2: false, test3: true},
                    ['test5', {test6: true}],
                ]}]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test class="test1 test3 test5 test6 test4"></test>');
            });

            it('should be possible to append an id to the tagName using #', async () => {
                const {exec, use} = dom(wrapper);
                exec({state: {}});
                use({builder: () => ['test#test']});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test id="test"></test>');
            });

            it('should be possible to append an classNames to the tagName using .', async () => {
                const {exec, use} = dom(wrapper);
                exec({state: {}});
                use({builder: () => ['test.test.test', {className: 'tt'}]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test class="tt test test"></test>');
            });

            it('should be possible to append styles to the tagName using |', async () => {
                const {exec, use} = dom(wrapper);
                exec({state: {}});
                use({builder: () => ['test|height:2px;', {style: 'width: 2px;'}]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test style="width: 2px; height: 2px;"></test>');
            });

            it('should read the children from the third element in the array', async () => {
                const {exec, use} = dom(wrapper);
                exec({state: {}});
                use({builder: () => ['test', {}, ['test']]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test>test</test>');
            });

            it('should accept components', async () => {
                const {exec, use} = dom(wrapper);
                exec({state: {}});
                const component = () => 'test';
                use({builder: () => [component]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test');
            });

            it('should pass arguments to components', async () => {
                const {exec, use} = dom(wrapper);
                exec({state: {}});
                const component = ({a}) => a;
                use({builder: () => [component, {a: 'test'}]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test');
            });

            it('should pass children to component', async () => {
                const {exec, use} = dom(wrapper);
                exec({state: {}});
                const component = ({children}) => children[0];
                use({builder: () => [component, {}, ['test']]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test');
            });

            it('should support nested components', async () => {
                const {exec, use} = dom(wrapper);
                exec({state: {}});
                const component3 = ({c}) => c;
                const component2 = ({b}) => [component3, {c: b}];
                const component1 = ({a}) => [component2, {b: a}];
                use({builder: () => [component1, {a: 'test'}]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test');
            });

            it('should fail when given malformed tagName', () => {
                const {exec, use} = dom(wrapper);
                exec({state: {}});
                expect(() => use({builder: () => [{}]}))
                    .toThrow(/tag/);
            });

            it('should fail when given malformed attributes', () => {
                const {exec, use} = dom(wrapper);
                exec({state: {}});
                expect(() => use({builder: () => ['div', 'test']}))
                    .toThrow(/attribute/);
            });

            it('should not fail when attributes or children are ommitted', () => {
                const {exec, use} = dom(wrapper);
                exec({state: {}});
                expect(() => use({builder: () => ['div']}))
                    .not.toThrow(Error);
            });
        });

        describe('update', () => {
            it('should rerender the new dom', async () => {
                const {exec, use} = dom(wrapper);
                use({builder: (s) => [s, {}, [s]]});
                exec({state: 'a'});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<a>a</a>');
                exec({state: 'b'});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<b>b</b>');
            });

            it('should not replace elements when the tagName doesn\'t change', async () => {
                const {exec, use} = dom(wrapper);
                use({builder: (s) => ['div' + s]});
                exec({state: ''});
                await sleep();
                const element = wrapper.children[0];
                exec({state: '#id.class|height:0px;'});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<div id="id" class="class" style="height: 0px;"></div>');
                expect(wrapper.children[0])
                    .toBe(element);
            });

            it('should be able to delete elements', async () => {
                const {exec, use} = dom(wrapper);
                use({builder: (s) => ['div', {}, s.split('').map((l) => [l])]});
                exec({state: 'abc'});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe(
                        '<div>' +
                            '<a></a>' +
                            '<b></b>' +
                            '<c></c>' +
                        '</div>'
                    );
                exec({state: 'a'});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe(
                        '<div>' +
                            '<a></a>' +
                        '</div>'
                    );
                exec({state: 'cd'});
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
                const {exec, use} = dom(wrapper);
                use({builder: (s) => s});
                exec({state: ''});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('');
                exec({state: 'test1'});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test1');
                exec({state: 'test2'});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test2');
                exec({state: ['test3', {}, ['test3']]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test3>test3</test3>');
                exec({state: ['test4', {}, [['test4']]]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test4><test4></test4></test4>');
                exec({state: ''});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('');
                exec({state: 'test5'});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test5');
            });
        });
    });

    describe('use', () => {
        it('should not accept multiple items per key', () => {
            const {use} = dom();
            expect(() => use({name: ['name']}))
                .toThrow(Error);
            expect(() => use({builder: [() => 'test']}))
                .toThrow(Error);
            expect(() => use({draw: [() => {}]}))
                .toThrow(Error);
            expect(() => use({update: [() => {}]}))
                .toThrow(Error);
            expect(() => use({build: [() => ({text: 'test'})]}))
                .toThrow(Error);
            expect(() => use({prebuild: [() => 'test']}))
                .toThrow(Error);
            expect(() => use({postbuild: [() => ({text: 'test'})]}))
                .toThrow(Error);
        });

        describe('target', () => {
            it('should reject malformed targets', () => {
                const {exec, use} = dom();
                exec({state: {}});
                use({builder: () => 'test'});
                expect(() => use({target: null}))
                    .toThrow(/target/g);
            });

            it('should change the render target', async () => {
                const {exec, use} = dom(wrapper);
                exec({state: {}});
                use({builder: () => 'test'});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test');
                const newTarget = document.createElement('div');
                wrapper.innerHTML = '';
                wrapper.appendChild(newTarget);
                expect(wrapper.innerHTML)
                    .toBe('<div></div>');
                use({target: newTarget});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<div>test</div>');
            });
        });

        describe('builder', () => {
            it('should reject malformed builders', () => {
                const {use} = dom();
                expect(() => use({builder: null}))
                    .toThrow(/builder/g);
            });

            it('should change the builder function', async () => {
                const {exec, use} = dom(wrapper);
                exec({state: {}});
                use({builder: () => 'test'});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test');
                use({builder: () => 'content'});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('content');
            });
        });

        describe('state', () => {
            it('should reject undefined state', () => {
                const {exec} = dom();
                expect(() => exec({state: undefined}))
                    .toThrow(/state/gi);
            });

            it('should trigger an update', async () => {
                const {exec, use} = dom(wrapper);
                exec({state: 'initial'});
                use({builder: (s) => s});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('initial');
                exec({state: 'changed'});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('changed');
            });
        });

        describe('draw', () => {
            it('should reject malformed draw', () => {
                const {use} = dom();
                expect(() => use({draw: {}}))
                    .toThrow(/draw/g);
            });

            it('should trigger a redraw', async () => {
                const {exec, use} = dom(wrapper);
                const test = jest.fn();
                exec({state: {}});
                use({builder: () => 'test'});
                use({draw: test});
                await sleep();
                expect(test)
                    .toHaveBeenCalled();
            });
        });

        describe('update', () => {
            it('should reject malformed update', () => {
                const {use} = dom();
                expect(() => use({update: {}}))
                    .toThrow(/update/g);
            });
        });

        describe('build', () => {
            it('should reject malformed build', () => {
                const {use} = dom();
                expect(() => use({build: {}}))
                    .toThrow(/build/g);
            });

            it('should trigger an update', async () => {
                const {exec, use} = dom(wrapper);
                const test = jest.fn();
                exec({state: {}});
                use({builder: () => 'test'});
                use({build: test});
                await sleep();
                expect(test)
                    .toHaveBeenCalled();
            });

            it('should receive the builder\'s output and be able to edit it', async () => {
                const {exec, use} = dom(wrapper);
                exec({state: {}});
                use({builder: () => 'test'});
                use({build: (element) => {
                    expect(element)
                        .toEqual('test');
                    return {text: 'changed'};
                }});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('changed');
            });
        });

        describe('prebuild', () => {
            it('should reject malformed prebuild', () => {
                const {use} = dom();
                expect(() => use({prebuild: {}}))
                    .toThrow(/prebuild/g);
            });

            it('should trigger an update', async () => {
                const {exec, use} = dom(wrapper);
                const test = jest.fn();
                exec({state: {}});
                use({builder: () => 'test'});
                use({prebuild: () => {
                    test();
                    return 'test';
                }});
                await sleep();
                expect(test)
                    .toHaveBeenCalled();
            });

            it('should receive the builder\'s output and be able to edit it', async () => {
                const {exec, use} = dom(wrapper);
                exec({state: {}});
                use({builder: () => 'test'});
                use({prebuild: (element) => {
                    expect(element)
                        .toEqual('test');
                    return ['div.test'];
                }});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<div class="test"></div>');
            });
        });

        describe('postbuild', () => {
            it('should reject malformed postbuild', () => {
                const {use} = dom();
                expect(() => use({postbuild: {}}))
                    .toThrow(/postbuild/g);
            });

            it('should trigger an update', async () => {
                const {exec, use} = dom(wrapper);
                const test = jest.fn();
                exec({state: {}});
                use({builder: () => 'test'});
                use({postbuild: test});
                await sleep();
                expect(test)
                    .toHaveBeenCalled();
            });

            it('should receive the built vdom and be able to edit it', async () => {
                const {exec, use} = dom(wrapper);
                exec({state: {}});
                use({builder: () => 'test'});
                use({postbuild: (vdom) => {
                    expect(vdom)
                        .toEqual({text: 'test'});
                    return Object.assign({}, vdom, {text: 'changed'});
                }});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('changed');
            });
        });
    });
});
