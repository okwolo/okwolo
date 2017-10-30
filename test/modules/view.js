'use strict';

const {makeBus} = require('../../src/utils')();

const dom = (target) => {
    const emit = makeBus();
    const use = makeBus();
    require('../../src/modules/view')({emit, use}, window);
    require('../../src/modules/view.build')({emit, use}, window);
    require('../../src/modules/view.dom')({emit, use}, window);
    use({target});
    return {emit, use};
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
        const {emit, use} = dom(wrapper);
        emit({state: {}});
        use({builder: () => ['span']});
        await sleep();
        expect(wrapper.children[0].tagName)
            .toBe('SPAN');
    });

    it('should not attempt to draw before it can', () => {
        const init = (events) => {
            const emit = makeBus();
            const use = makeBus();
            require('../../src/modules/view')({emit, use}, window);
            expect(() => {
                use(events);
                emit(events);
            })
                .not.toThrow(Error);
        };
        // missing build
        init({
            target: wrapper,
            builder: () => 'test',
            state: () => 'test',
        });
        // missing target
        init({
            build: () => 'test',
            builder: () => 'test',
            state: () => 'test',
        });
        // missing builder
        init({
            build: () => 'test',
            target: wrapper,
            state: () => 'test',
        });
        // missing state
        init({
            build: () => 'test',
            target: wrapper,
            builder: () => 'test',
        });
    });

    describe('blob', () => {
        describe('draw', () => {
            it('should render the initial state immediately', async () => {
                const {emit, use} = dom(wrapper);
                emit({state: {}});
                use({builder: () => ['test']});
                await sleep();
                expect(wrapper.innerHTML.length)
                    .toBeGreaterThan(0);
            });

            it('should remove all other elements in the target', async () => {
                const {emit, use} = dom(wrapper);
                wrapper.innerHTML = '<div></div>';
                expect(wrapper.querySelectorAll('div'))
                    .toHaveLength(1);
                emit({state: {}});
                use({builder: () => 'test'});
                await sleep();
                expect(wrapper.querySelectorAll('div'))
                    .toHaveLength(0);
            });
        });

        describe('build', () => {
            it('should create textNodes out of strings', async () => {
                const {emit, use} = dom(wrapper);
                emit({state: {}});
                use({builder: () => 'test'});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test');
            });

            it('should create elements out of arrays', async () => {
                const {emit, use} = dom(wrapper);
                emit({state: {}});
                use({builder: () => ['span']});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<span></span>');
            });

            it('should create nothing when given null', async () => {
                const {emit, use} = dom(wrapper);
                emit({state: {}});
                use({builder: () => null});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('');
            });

            it('should create nothing when given a boolean', async () => {
                const {emit, use} = dom(wrapper);
                emit({state: {}});
                use({builder: () => true});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('');
                use({builder: () => false});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('');
            });

            it('should render numbers', async () => {
                const {emit, use} = dom(wrapper);
                emit({state: {}});
                use({builder: () => 123456789});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('123456789');
            });

            it('should read the tagName from the first element in the array', async () => {
                const {emit, use} = dom(wrapper);
                emit({state: {}});
                use({builder: () => ['test']});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test></test>');
            });

            it('should read the attributes from the second element in the array', async () => {
                const {emit, use} = dom(wrapper);
                emit({state: {}});
                use({builder: () => ['test', {id: 'test'}]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test id="test"></test>');
            });

            it('should implement classnames logic', async () => {
                const {emit, use} = dom(wrapper);
                emit({state: {}});
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
                const {emit, use} = dom(wrapper);
                emit({state: {}});
                use({builder: () => ['test#test']});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test id="test"></test>');
            });

            it('should be possible to append an classNames to the tagName using .', async () => {
                const {emit, use} = dom(wrapper);
                emit({state: {}});
                use({builder: () => ['test.test.test', {className: 'tt'}]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test class="tt test test"></test>');
            });

            it('should be possible to append styles to the tagName using |', async () => {
                const {emit, use} = dom(wrapper);
                emit({state: {}});
                use({builder: () => ['test|height:2px;', {style: 'width: 2px;'}]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test style="width: 2px; height: 2px;"></test>');
            });

            it('should read the children from the third element in the array', async () => {
                const {emit, use} = dom(wrapper);
                emit({state: {}});
                use({builder: () => ['test', {}, ['test']]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test>test</test>');
            });

            it('should accept components', async () => {
                const {emit, use} = dom(wrapper);
                emit({state: {}});
                const component = () => 'test';
                use({builder: () => [component]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test');
            });

            it('should pass arguments to components', async () => {
                const {emit, use} = dom(wrapper);
                emit({state: {}});
                const component = ({a}) => a;
                use({builder: () => [component, {a: 'test'}]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test');
            });

            it('should pass children to component', async () => {
                const {emit, use} = dom(wrapper);
                emit({state: {}});
                const component = ({children}) => children[0];
                use({builder: () => [component, {}, ['test']]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test');
            });

            it('should support nested components', async () => {
                const {emit, use} = dom(wrapper);
                emit({state: {}});
                const component3 = ({c}) => c;
                const component2 = ({b}) => [component3, {c: b}];
                const component1 = ({a}) => [component2, {b: a}];
                use({builder: () => [component1, {a: 'test'}]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test');
            });

            it('should fail when given malformed tagName', () => {
                const {emit, use} = dom(wrapper);
                emit({state: {}});
                expect(() => use({builder: () => [{}]}))
                    .toThrow(/tag/);
            });

            it('should fail when given malformed attributes', () => {
                const {emit, use} = dom(wrapper);
                emit({state: {}});
                expect(() => use({builder: () => ['div', 'test']}))
                    .toThrow(/attribute/);
            });

            it('should not fail when attributes or children are ommitted', () => {
                const {emit, use} = dom(wrapper);
                emit({state: {}});
                expect(() => use({builder: () => ['div']}))
                    .not.toThrow(Error);
            });
        });

        describe('update', () => {
            it('should rerender the new dom', async () => {
                const {emit, use} = dom(wrapper);
                use({builder: (s) => [s, {}, [s]]});
                emit({state: 'a'});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<a>a</a>');
                emit({state: 'b'});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<b>b</b>');
            });

            it('should not replace elements when the tagName doesn\'t change', async () => {
                const {emit, use} = dom(wrapper);
                use({builder: (s) => ['div' + s]});
                emit({state: ''});
                await sleep();
                const element = wrapper.children[0];
                emit({state: '#id.class|height:0px;'});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<div id="id" class="class" style="height: 0px;"></div>');
                expect(wrapper.children[0])
                    .toBe(element);
            });

            it('should be able to delete elements', async () => {
                const {emit, use} = dom(wrapper);
                use({builder: (s) => ['div', {}, s.split('').map((l) => [l])]});
                emit({state: 'abc'});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe(
                        '<div>' +
                            '<a></a>' +
                            '<b></b>' +
                            '<c></c>' +
                        '</div>'
                    );
                emit({state: 'a'});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe(
                        '<div>' +
                            '<a></a>' +
                        '</div>'
                    );
                emit({state: 'cd'});
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
                const {emit, use} = dom(wrapper);
                use({builder: (s) => s});
                emit({state: ''});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('');
                emit({state: 'test1'});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test1');
                emit({state: 'test2'});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test2');
                emit({state: ['test3', {}, ['test3']]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test3>test3</test3>');
                emit({state: ['test4', {}, [['test4']]]});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test4><test4></test4></test4>');
                emit({state: ''});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('');
                emit({state: 'test5'});
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
                const {emit, use} = dom();
                emit({state: {}});
                use({builder: () => 'test'});
                expect(() => use({target: null}))
                    .toThrow(/target/g);
            });

            it('should change the render target', async () => {
                const {emit, use} = dom(wrapper);
                emit({state: {}});
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
                const {emit, use} = dom(wrapper);
                emit({state: {}});
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
                const {emit} = dom();
                expect(() => emit({state: undefined}))
                    .toThrow(/state/gi);
            });

            it('should trigger an update', async () => {
                const {emit, use} = dom(wrapper);
                emit({state: 'initial'});
                use({builder: (s) => s});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('initial');
                emit({state: 'changed'});
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
                const {emit, use} = dom(wrapper);
                const test = jest.fn();
                emit({state: {}});
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
                const {emit, use} = dom(wrapper);
                const test = jest.fn();
                emit({state: {}});
                use({builder: () => 'test'});
                use({build: test});
                await sleep();
                expect(test)
                    .toHaveBeenCalled();
            });

            it('should receive the builder\'s output and be able to edit it', async () => {
                const {emit, use} = dom(wrapper);
                emit({state: {}});
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
                const {emit, use} = dom(wrapper);
                const test = jest.fn();
                emit({state: {}});
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
                const {emit, use} = dom(wrapper);
                emit({state: {}});
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
                const {emit, use} = dom(wrapper);
                const test = jest.fn();
                emit({state: {}});
                use({builder: () => 'test'});
                use({postbuild: test});
                await sleep();
                expect(test)
                    .toHaveBeenCalled();
            });

            it('should receive the built vdom and be able to edit it', async () => {
                const {emit, use} = dom(wrapper);
                emit({state: {}});
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
