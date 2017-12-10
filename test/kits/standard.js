'use strict';

const standard = require('../../src/kits/standard');

let wrapper;

describe('standard', () => {
    beforeEach(() => {
        wrapper = document.createElement('div');
        document.body.appendChild(wrapper);
        window.history.pushState({}, '', '/');
    });

    afterEach(() => {
        document.body.removeChild(wrapper);
        wrapper = null;
    });

    it('should add itself to the window object', () => {
        expect(window.okwolo)
            .toBeInstanceOf(Function);
    });

    it('should return a function', () => {
        expect(standard())
            .toBeInstanceOf(Function);
    });

    describe('app', () => {
        it('should expose the top level api', () => {
            const app = standard();
            expect(app.setState)
                .toBeInstanceOf(Function);
            expect(app.setState)
                .toBeInstanceOf(Function);
            expect(app.getState)
                .toBeInstanceOf(Function);
            expect(app.redirect)
                .toBeInstanceOf(Function);
            expect(app.show)
                .toBeInstanceOf(Function);
            expect(app.act)
                .toBeInstanceOf(Function);
            expect(app.act)
                .toBeInstanceOf(Function);
            expect(app.use)
                .toBeInstanceOf(Function);
            expect(app.update)
                .toBeInstanceOf(Function);
            expect(app.undo)
                .toBeInstanceOf(Function);
            expect(app.redo)
                .toBeInstanceOf(Function);
        });

        it('should replace the builder when called', async () => {
            const app = standard(wrapper);
            app.setState({});
            app(() => () => ['test']);
            await sleep();
            expect(wrapper.innerHTML)
                .toBe('<test></test>');
        });

        it('should expect a function that returns a function', () => {
            const app = standard(wrapper);
            app.setState({});
            expect(() => app(() => ['test']))
                .toThrow(/builder/);
        });

        it('should register builders for specific routes', async () => {
            const app = standard(wrapper);
            app.setState({});
            app('/test', () => () => ['test']);
            await sleep();
            expect(wrapper.innerHTML)
                .toBe('');
            app.redirect('/test');
            await sleep();
            expect(wrapper.innerHTML)
                .toBe('<test></test>');
        });

        it('should should pas route params to the builder', async () => {
            const app = standard(wrapper);
            const test = jest.fn();
            app.setState({});
            app('/test/:id/profile', (params) => () => {
                test(params);
                return ['test'];
            });
            app.redirect('/test/123/profile');
            await sleep();
            expect(test)
                .toHaveBeenCalledWith({id: '123'});
        });
    });

    describe('getState', () => {
        it('should fail when state has not been set', () => {
            const app = standard();
            expect(() => app.getState())
                .toThrow(/state/);
        });

        it('should return the state', () => {
            const app = standard();
            app.setState({test: true});
            expect(app.getState())
                .toEqual({test: true});
        });

        it('should return a copy of the state', () => {
            const app = standard();
            const state = {test: true};
            app.setState(state);
            expect(app.getState())
                .not.toBe(state);
        });
    });

    describe('setState', () => {
        it('should change the state', () => {
            const app = standard();
            app.setState({test: true});
            expect(app.getState())
                .toEqual({test: true});
        });

        it('should accept a function', () => {
            const app = standard();
            app.setState(() => ({test: true}));
            expect(app.getState())
                .toEqual({test: true});
        });

        it('should update okwolo-dom\'s state', () => {
            const app = standard(wrapper);
            const test = jest.fn();
            app(() => (state) => {
                test(state);
                return 'test';
            });
            app.setState({test: true});
            expect(test)
                .toHaveBeenCalledWith({test: true});
        });
    });

    describe('redirect', () => {
        it('should change the pathname', () => {
            const app = standard();
            app.redirect('/test/xyz');
            expect(window.location.pathname)
                .toBe('/test/xyz');
        });

        it('should change the layout', async () => {
            const app = standard(wrapper);
            app.setState({});
            app('/test/:content', ({content}) => () => content);
            app.redirect('/test/xyz');
            await sleep();
            expect(wrapper.innerHTML)
                .toBe('xyz');
        });
    });

    describe('show', () => {
        it('should change the pathname', () => {
            const app = standard();
            app.show('/test/xyz');
            expect(window.location.pathname)
                .not.toBe('/test/xyz');
        });

        it('should change the layout', async () => {
            const app = standard(wrapper);
            app.setState({});
            app('/test/:content', ({content}) => () => content);
            app.show('/test/xyz');
            await sleep();
            expect(wrapper.innerHTML)
                .toBe('xyz');
        });
    });

    describe('act', () => {
        it('should not allow actions before state has been set', () => {
            const app = standard();
            app.use({action: {
                type: 'TEST',
                target: [],
                handler: (params) => params,
            }});
            expect(() => app.act('TEST'))
                .toThrow(/state/);
            app.setState({});
            expect(() => app.act('TEST'))
                .not.toThrow(Error);
        });

        it('should add an SET_STATE action', () => {
            const app = standard();
            app.setState({});
            expect(() => app.act('SET_STATE'))
                .not.toThrow(Error);
        });

        it('should add an UNDO action', () => {
            const app = standard();
            app.setState({});
            expect(() => app.act('UNDO'))
                .not.toThrow(Error);
        });

        it('should add a REDO action', () => {
            const app = standard();
            app.setState({});
            expect(() => app.act('REDO'))
                .not.toThrow(Error);
        });
    });

    describe('use', () => {
        it('should support named blobs', () => {
            const app = standard();
            app.setState({});
            const test = jest.fn();
            const action = {
                type: 'TEST',
                target: [],
                handler: () => {
                    test();
                    return null;
                },
            };
            app.use({name: 'test', action});
            app.use({name: 'test', action});
            app.act('TEST');
            expect(test)
                .toHaveBeenCalledTimes(1);
        });
    });

    describe('update', () => {
        it('should trigger a rerender', () => {
            const app = standard(wrapper);
            const test = jest.fn();
            app.setState({});
            app(() => () => {
                test();
                return 'test';
            });
            app.update();
            expect(test)
                .toHaveBeenCalledTimes(2);
        });
    });

    describe('undo', () => {
        it('should execute an UNDO action', () => {
            const app = standard();
            const test = jest.fn();
            app.setState({});
            app.use({action: {
                type: 'UNDO',
                target: [],
                handler: () => {
                    test();
                    return null;
                },
            }});
            app.undo();
            expect(test)
                .toHaveBeenCalled();
        });
    });

    describe('redo', () => {
        it('should execute a REDO action', () => {
            const app = standard();
            const test = jest.fn();
            app.setState({});
            app.use({action: {
                type: 'REDO',
                target: [],
                handler: () => {
                    test();
                    return null;
                },
            }});
            app.redo();
            expect(test)
                .toHaveBeenCalled();
        });
    });

    describe('examples', () => {
        it('should correctly render the fruit example', async () => {
            const app = standard(wrapper);
            app.setState(['orange', 'apple', 'pear']);
            let FruitItem = ({type}) => (
                ['li.fruit', {}, [
                    type,
                ]]
            );
            app(() => (fruits) => (
                ['ul.fruit-list', {},
                    fruits.map((type) => (
                        [FruitItem, {type}]
                    )),
                ]
            ));
            await sleep();
            expect(wrapper.innerHTML).toMatchSnapshot();
        });

        it('should correctly render the button example', async () => {
            const app = standard(wrapper);
            app.setState([
                {text: 'abc', count: 0},
                {text: 'def', count: 0},
                {text: 'ghi', count: 0},
            ]);
            app.use({action: {
                type: 'INC',
                target: [],
                handler: (state, params) => {
                    state[params].count++;
                    return state;
                },
            }});
            app(() => (state) => (
                ['div.buttons', {},
                    state.map(({text, count}, index) => (
                        ['button', {onclick: () => app.act('INC', index)}, [
                            text,
                            ['span | font-size: 6px;', {}, [
                                String(count),
                            ]],
                        ]]
                    )),
                ]
            ));
            await sleep();
            expect(wrapper.innerHTML)
                .toMatchSnapshot();
            wrapper.querySelectorAll('button')[0].click();
            await sleep();
            expect(wrapper.innerHTML).toMatchSnapshot();
            wrapper.querySelectorAll('button')[1].click();
            wrapper.querySelectorAll('button')[1].click();
            wrapper.querySelectorAll('button')[1].click();
            await sleep();
            expect(wrapper.innerHTML)
                .toMatchSnapshot();
            app.undo();
            app.undo();
            await sleep();
            expect(wrapper.innerHTML)
                .toMatchSnapshot();
            app.redo();
            await sleep();
            expect(wrapper.innerHTML)
                .toMatchSnapshot();
        });

        it('should correctly render the router example', async () => {
            const app = standard(wrapper);
            app.setState({
                articles: [
                    {title: 'title1', content: 'content1'},
                    {title: 'title2', content: 'content2'},
                    {title: 'title3', content: 'content3'},
                ],
            });
            app('/articles', () => ({articles}) => (
                ['div', {},
                    articles.map(({title}) => (
                        ['span', {onclick: () => app.redirect(`/article/${title}`)}, [
                            title,
                        ]]
                    )),
                ]
            ));
            app('/article/:title', ({title}) => ({articles}) => (
                ['div', {}, [
                    ['button', {onclick: () => app.redirect('/articles')}, [
                        'home',
                    ]],
                    ['br'],
                    ['h1', {}, [
                        title,
                    ]],
                    ['p', {}, [
                        articles.find((a) => a.title === title).content,
                    ]],
                ]]
            ));
            app.redirect('/articles');
            await sleep();
            expect(wrapper.innerHTML)
                .toMatchSnapshot();
            wrapper.querySelectorAll('span')[1].click();
            await sleep();
            expect(wrapper.innerHTML)
                .toMatchSnapshot();
            wrapper.querySelector('button').click();
            await sleep();
            expect(wrapper.innerHTML)
                .toMatchSnapshot();
        });
    });
});
