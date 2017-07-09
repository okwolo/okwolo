'use strict';

const dom = require('./');

window.requestAnimationFrame = (f) => setTimeout(f, 0);

let sleep = async (t = 1) => new Promise((resolve) => setTimeout(resolve, t));

let wrapper;

describe('goo-dom', () => {
    beforeEach(() => {
        wrapper = document.createElement('div');
        document.body.appendChild(wrapper);
    });

    afterEach(() => {
        document.body.removeChild(wrapper);
        wrapper = null;
    });

    it('should be a function', () => {
        expect(dom)
            .toBeInstanceOf(Function);
    });

    it('should return a function', () => {
        const app = dom(wrapper);
        expect(app)
            .toBeInstanceOf(Function);
    });

    it('should have a use function', () => {
        const app = dom(wrapper);
        expect(app.use)
            .toBeInstanceOf(Function);
    });

    it('should have a setState function', () => {
        const app = dom(wrapper);
        expect(app.setState)
            .toBeInstanceOf(Function);
    });

    it('should add the builder function\'s output to the target', async () => {
        const app = dom(wrapper);
        app.setState({});
        app(() => ['span']);
        await sleep();
        expect(wrapper.children[0].tagName)
            .toBe('SPAN');
    });

    it('should change its state with setState', async () => {
        const app = dom(wrapper);
        app((s) => s);
        app.setState('test1');
        expect(app.getState())
            .toBe('test1');
        app.setState((state) => {
            expect(state)
                .toBe('test1');
            return 'test2';
        });
        expect(app.getState())
            .toBe('test2');
    });

    it('should get the current state with getState', () => {
        const app = dom(wrapper);
        app.setState('test');
        expect(app.getState())
            .toBe('test');
    });

    describe('/blob', () => {
        describe('draw', () => {
            it('should render the initial state immediately', async () => {
                const app = dom(wrapper);
                app.setState({});
                app(() => ['test']);
                await sleep();
                expect(wrapper.innerHTML.length)
                    .toBeGreaterThan(0);
            });

            it('should remove all other elements in the target', async () => {
                const app = dom(wrapper);
                wrapper.innerHTML = '<div></div>';
                expect(wrapper.querySelectorAll('div'))
                    .toHaveLength(1);
                app.setState({});
                app(() => 'test');
                await sleep();
                expect(wrapper.querySelectorAll('div'))
                    .toHaveLength(0);
            });
        });

        describe('build', () => {
            it('should create textNodes out of strings', async () => {
                const app = dom(wrapper);
                app.setState({});
                app(() => 'test');
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test');
            });

            it('should create elements out of arrays', async () => {
                const app = dom(wrapper);
                app.setState({});
                app(() => ['span']);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<span></span>');
            });

            it('should create nothing when given null', async () => {
                const app = dom(wrapper);
                app.setState({});
                app(() => null);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('');
            });

            it('should read the tagName from the first element in the array', async () => {
                const app = dom(wrapper);
                app.setState({});
                app(() => ['test']);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test></test>');
            });

            it('should read the attributes from the second element in the array', async () => {
                const app = dom(wrapper);
                app.setState({});
                app(() => ['test', {id: 'test'}]);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test id="test"></test>');
            });

            it('should be possible to append an id to the tagName using #', async () => {
                const app = dom(wrapper);
                app.setState({});
                app(() => ['test#test']);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test id="test"></test>');
            });

            it('should be possible to append an classNames to the tagName using .', async () => {
                const app = dom(wrapper);
                app.setState({});
                app(() => ['test.test.test', {className: 'tt'}]);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test class="tt test test"></test>');
            });

            it('should be possible to append styles to the tagName using |', async () => {
                const app = dom(wrapper);
                app.setState({});
                app(() => ['test|height:2px;', {style: 'width: 2px;'}]);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test style="width: 2px; height: 2px;"></test>');
            });

            it('should read the children from the third element in the array', async () => {
                const app = dom(wrapper);
                app.setState({});
                app(() => ['test', {}, ['test']]);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test>test</test>');
            });

            it('should accept components', async () => {
                const app = dom(wrapper);
                app.setState({});
                const component = () => 'test';
                app(() => [component]);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test');
            });

            it('should pass arguments to components', async () => {
                const app = dom(wrapper);
                app.setState({});
                const component = ({a}) => a;
                app(() => [component, {a: 'test'}]);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test');
            });

            it('should pass children to component', async () => {
                const app = dom(wrapper);
                app.setState({});
                const component = ({children}) => children[0];
                app(() => [component, {}, ['test']]);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test');
            });

            it('should support nested components', async () => {
                const app = dom(wrapper);
                app.setState({});
                const component3 = ({c}) => c;
                const component2 = ({b}) => [component3, {c: b}];
                const component1 = ({a}) => [component2, {b: a}];
                app(() => [component1, {a: 'test'}]);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test');
            });
        });

        describe('update', () => {
            it('should rerender the new dom', async () => {
                const app = dom(wrapper);
                app((s) => [s, {}, [s]]);
                app.setState('a');
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<a>a</a>');
                app.setState('b');
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<b>b</b>');
            });

            it('should not replace elements when the tagName doesn\'t change', async () => {
                const app = dom(wrapper);
                app((s) => ['div' + s]);
                app.setState('');
                await sleep();
                const element = wrapper.children[0];
                app.setState('#id.class|height:0px;');
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<div id="id" class="class" style="height: 0px;"></div>');
                expect(wrapper.children[0])
                    .toBe(element);
            });

            it('should be able to delete elements', async () => {
                const app = dom(wrapper);
                app((s) => ['div', {}, s.split('').map((l) => [l])]);
                app.setState('abc');
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe(
                        '<div>' +
                            '<a></a>' +
                            '<b></b>' +
                            '<c></c>' +
                        '</div>'
                    );
                app.setState('a');
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe(
                        '<div>' +
                            '<a></a>' +
                        '</div>'
                    );
                app.setState('cd');
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
                const app = dom(wrapper);
                app((s) => s);
                app.setState('');
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('');
                app.setState('test1');
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test1');
                app.setState('test2');
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test2');
                app.setState(['test3', {}, ['test3']]);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test3>test3</test3>');
                app.setState(['test4', {}, [['test4']]]);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<test4><test4></test4></test4>');
                app.setState('');
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('');
                app.setState('test5');
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test5');
            });
        });
    });

    describe('use', () => {
        it('should return an array', () => {
            const app = dom();
            expect(app.use({}))
                .toBeInstanceOf(Array);
        });

        it('should not accept multiple items per key', () => {
            const app = dom();
            expect(() => app.use({name: ['name']}))
                .toThrow(Error);
            expect(() => app.use({builder: [() => 'test']}))
                .toThrow(Error);
            expect(() => app.use({draw: [() => {}]}))
                .toThrow(Error);
            expect(() => app.use({update: [() => {}]}))
                .toThrow(Error);
            expect(() => app.use({build: [() => ({text: 'test'})]}))
                .toThrow(Error);
            expect(() => app.use({prebuild: [() => 'test']}))
                .toThrow(Error);
            expect(() => app.use({postbuild: [() => ({text: 'test'})]}))
                .toThrow(Error);
        });

        describe('target', () => {
            it('should reject malformed targets', () => {
                const app = dom();
                app.setState({});
                app(() => 'test');
                expect(() => app.use({target: null}))
                    .toThrow(/target/g);
            });

            it('should change the render target', async () => {
                const app = dom(wrapper);
                app.setState({});
                app(() => 'test');
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test');
                const newTarget = document.createElement('div');
                wrapper.innerHTML = '';
                wrapper.appendChild(newTarget);
                expect(wrapper.innerHTML)
                    .toBe('<div></div>');
                app.use({target: newTarget});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<div>test</div>');
            });
        });

        describe('builder', () => {
            it('should reject malformed builders', () => {
                const app = dom();
                expect(() => app.use({builder: null}))
                    .toThrow(/builder/g);
            });

            it('should change the builder function', async () => {
                const app = dom(wrapper);
                app.setState({});
                app(() => 'test');
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test');
                app.use({builder: () => 'content'});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('content');
            });
        });

        describe('state', () => {
            it('should reject undefined state', () => {
                const app = dom();
                expect(() => app.use({state: undefined}))
                    .toThrow(/state/gi);
            });

            it('should trigger an update', async () => {
                const app = dom(wrapper);
                app.setState('initial');
                app((s) => s);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('initial');
                app.use({state: 'changed'});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('changed');
            });
        });

        describe('draw', () => {
            it('should reject malformed draw', () => {
                const app = dom();
                expect(() => app.use({draw: {}}))
                    .toThrow(/draw/g);
            });

            it('should trigger a redraw', async () => {
                const app = dom(wrapper);
                const test = jest.fn();
                app.setState({});
                app(() => 'test');
                app.use({draw: test});
                await sleep();
                expect(test)
                    .toHaveBeenCalled();
            });
        });

        describe('update', () => {
            it('should reject malformed update', () => {
                const app = dom();
                expect(() => app.use({update: {}}))
                    .toThrow(/update/g);
            });
        });

        describe('build', () => {
            it('should reject malformed build', () => {
                const app = dom();
                expect(() => app.use({build: {}}))
                    .toThrow(/build/g);
            });

            it('should trigger an update', async () => {
                const app = dom(wrapper);
                const test = jest.fn();
                app.setState({});
                app(() => 'test');
                app.use({build: test});
                await sleep();
                expect(test)
                    .toHaveBeenCalled();
            });

            it('should receive the builder\'s output and be able to edit it', async () => {
                const app = dom(wrapper);
                app.setState({});
                app(() => 'test');
                app.use({build: (element) => {
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
                const app = dom();
                expect(() => app.use({prebuild: {}}))
                    .toThrow(/prebuild/g);
            });

            it('should trigger an update', async () => {
                const app = dom(wrapper);
                const test = jest.fn();
                app.setState({});
                app(() => 'test');
                app.use({prebuild: () => {
                    test();
                    return 'test';
                }});
                await sleep();
                expect(test)
                    .toHaveBeenCalled();
            });

            it('should receive the builder\'s output and be able to edit it', async () => {
                const app = dom(wrapper);
                app.setState({});
                app(() => 'test');
                app.use({prebuild: (element) => {
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
                const app = dom();
                expect(() => app.use({postbuild: {}}))
                    .toThrow(/postbuild/g);
            });

            it('should trigger an update', async () => {
                const app = dom(wrapper);
                const test = jest.fn();
                app.setState({});
                app(() => 'test');
                app.use({postbuild: test});
                await sleep();
                expect(test)
                    .toHaveBeenCalled();
            });

            it('should receive the built vdom and be able to edit it', async () => {
                const app = dom(wrapper);
                app.setState({});
                app(() => 'test');
                app.use({postbuild: (vdom) => {
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
