'use strict';

const core = require('./core');
const standard = require('./');
const lite = require('./kits/lite');
const server = require('./kits/server');
const routerless = require('./kits/routerless');
const stateless = require('./kits/stateless');

const merge = require('lodash/merge');

let wrapper;

describe('core', () => {
    const c = (options, modules = [], blobs = []) => {
        return core({
            modules: [].concat(modules),
            blobs: [].concat(blobs),
            options: merge({
                modules: {},
            }, options),
        });
    };

    it('should return a function', () => {
        expect(c())
            .toBeInstanceOf(Function);
    });

    it('should add the kit name to the okwolo function', () => {
        expect(c({
            kit: 'test',
        }).kit)
            .toBe('test');
    });

    it('should expose the version', () => {
        expect(okwolo.version)
            .toMatch(/^(\d+\.){2}\d+$/g);
    });

    it('should use the modules', () => {
        const test = jest.fn();
        c({}, test)();
        expect(test)
            .toHaveBeenCalled();
    });

    it('should use the blobs', () => {
        const test = jest.fn();
        const blob = () => {
            test();
            return {};
        };
        c({}, [], blob)();
        expect(test)
            .toHaveBeenCalled();
    });

    it('should add use to the api', () => {
        expect(c()().use)
            .toBeInstanceOf(Function);
    });

    it('should add use to the api', () => {
        expect(c()().emit)
            .toBeInstanceOf(Function);
    });

    it('should add getState to the api', () => {
        expect(c()().getState)
            .toBeInstanceOf(Function);
    });

    describe('options', () => {
        describe('kit', () => {
            it('should add kit to the window', () => {
                c({
                    kit: 'test',
                });
                expect(window.okwolo.test)
                    .toBeDefined();
            });
        });

        describe('browser', () => {
            it('should check for a browser environemnt', () => {
                const _window = global.window;
                delete global.window;
                expect(() => c({
                    browser: true,
                })())
                    .toThrow('browser');
                global.window = _window;
                expect(() => c({
                    browser: true,
                })())
                    .not.toThrow(Error);
            });
        });

        describe('modules', () => {
            describe('state', () => {
                it('should add act to the api', () => {
                    expect(c({
                        modules: {
                            state: true,
                        },
                    })().act)
                        .toBeInstanceOf(Function);
                    expect(c({
                        modules: {
                            state: false,
                        },
                    })().act)
                        .toBeFalsy();
                });

                it('should use an action to setState', () => {
                    const test = jest.fn();
                    const app1 = c()();
                    app1.emit.on('act', test);
                    app1.setState({});
                    expect(test)
                        .not.toHaveBeenCalled();
                    const app2 = c({
                        modules: {
                            state: true,
                        },
                    })();
                    app2.emit.on('act', test);
                    app2.setState({});
                    expect(test)
                        .toHaveBeenCalled();
                });
            });

            describe('history', () => {
                it('should not be added without state', () => {
                    expect(() => c({
                        modules: {
                            history: true,
                        },
                    })())
                        .toThrow('state');
                    expect(() => c({
                        modules: {
                            state: true,
                            history: true,
                        },
                    })())
                        .not.toThrow(Error);
                });

                it('should add undo to the api', () => {
                    expect(c({
                        modules: {
                            state: true,
                            history: true,
                        },
                    })().undo)
                        .toBeInstanceOf(Function);
                    expect(c({
                        modules: {
                            state: true,
                            history: false,
                        },
                    })().undo)
                        .toBeFalsy();
                });

                it('should add redo to the api', () => {
                    expect(c({
                        modules: {
                            state: true,
                            history: true,
                        },
                    })().redo)
                        .toBeInstanceOf(Function);
                    expect(c({
                        modules: {
                            state: true,
                            history: false,
                        },
                    })().redo)
                        .toBeFalsy();
                });
            });

            describe('dom', () => {
                it('should use the target immediately', () => {
                    const test = jest.fn();
                    const target = {};
                    const _module = ({use}) => {
                        use.on('target', test);
                    };
                    c({}, _module)(target);
                    expect(test)
                        .not.toHaveBeenCalledWith(target);
                    c({
                        modules: {
                            dom: true,
                        },
                    }, _module)(target);
                    expect(test)
                        .toHaveBeenCalledWith(target);
                });

                it('should add update to the api', () => {
                    expect(c()().update)
                        .toBeFalsy();
                    expect(c({
                        modules: {
                            dom: true,
                        },
                    })().update)
                        .toBeInstanceOf(Function);
                });

                it('should emit the current state when updated', () => {
                    const test = jest.fn();
                    const app = c({
                        modules: {
                            dom: true,
                        },
                    })();
                    app.emit.on('state', test);
                    app.update();
                    expect(test)
                        .toHaveBeenCalled();
                });
            });

            describe('router', () => {
                it('should add redirect to the api', () => {
                    expect(c()().redirect)
                        .toBeFalsy();
                    expect(c({
                        modules: {
                            router: true,
                        },
                    })().redirect)
                        .toBeInstanceOf(Function);
                });

                it('should emit redirect when redirected', () => {
                    const test = jest.fn();
                    const _module = ({emit}) => {
                        emit.on('redirect', test);
                    };
                    const app = c({
                        modules: {
                            router: true,
                        },
                    }, _module)();
                    expect(test)
                        .not.toHaveBeenCalled();
                    app.redirect();
                    expect(test)
                        .toHaveBeenCalled();
                });

                it('should add show to the api', () => {
                    expect(c()().show)
                        .toBeFalsy();
                    expect(c({
                        modules: {
                            router: true,
                        },
                    })().show)
                        .toBeInstanceOf(Function);
                });

                it('should emit show when showed', () => {
                    const test = jest.fn();
                    const _module = ({emit}) => {
                        emit.on('show', test);
                    };
                    const app = c({
                        modules: {
                            router: true,
                        },
                    }, _module)();
                    expect(test)
                        .not.toHaveBeenCalled();
                    app.show();
                    expect(test)
                        .toHaveBeenCalled();
                });

                it('should allow registering paths', () => {
                    const app1 = c()();
                    expect(() => app1('test', () => 0))
                        .toThrow(Error);
                    const app2 = c({
                        modules: {
                            router: true,
                        },
                    })();
                    expect(() => app2('test', () => 0))
                        .not.toThrow(Error);
                });
            });
        });
    });
});

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

describe('lite', () => {
    beforeEach(() => {
        wrapper = document.createElement('div');
        document.body.appendChild(wrapper);
        window.history.pushState({}, '', '/');
    });

    afterEach(() => {
        document.body.removeChild(wrapper);
        wrapper = null;
    });

    it('should not have state api', () => {
        const app = lite();
        expect(app.act)
            .toBeFalsy();
        expect(app.undo)
            .toBeFalsy();
        expect(app.redo)
            .toBeFalsy();
    });

    it('should have the dom api', () => {
        const app = lite();
        expect(app.update)
            .toBeInstanceOf(Function);
    });

    it('should have the router api', () => {
        const app = lite();
        expect(app.show)
            .toBeInstanceOf(Function);
        expect(app.redirect)
            .toBeInstanceOf(Function);
        expect(() => app('/path', () => () => 'test'))
            .not.toThrow(Error);
    });

    it('should support url params', async () => {
        const app = lite(wrapper);
        app.setState({});
        app('/test/:content', ({content}) => () => content);
        app.redirect('/test/xyz');
        await sleep();
        expect(wrapper.innerHTML)
            .toBe('xyz');
    });

    it('should ignore query strings', async () => {
        const app = lite(wrapper);
        app.setState({});
        app('/test', () => () => 'xyz');
        await sleep();
        expect(wrapper.innerHTML)
            .toBe('');
        app.redirect('/test?q=test');
        await sleep();
        expect(wrapper.innerHTML)
            .toBe('xyz');
    });
});

describe('server', () => {
    it('should not require a browser window', () => {
        const _window = global.window;
        delete global.window;
        expect(() => server())
            .not.toThrow(Error);
        global.window = _window;
    });

    it('should not have state api', () => {
        const app = server();
        expect(app.act)
            .toBeFalsy();
        expect(app.undo)
            .toBeFalsy();
        expect(app.redo)
            .toBeFalsy();
    });

    it('should not have router api', () => {
        const app = server();
        expect(app.redirect)
            .toBeFalsy();
        expect(app.show)
            .toBeFalsy();
        expect(() => app('/', () => () => 'test'))
            .toThrow(Error);
    });

    it('should have the dom api', () => {
        const app = server();
        expect(app.update)
            .toBeInstanceOf(Function);
    });

    it('should render dom to the target', () => {
        const test = jest.fn();
        const app = server(test);
        app(() => () => (
            ['div']
        ));
        app.setState({});
        expect(test)
            .toHaveBeenCalledWith('<div>\n</div>');
    });

    it('should render attributes', () => {
        const test = jest.fn();
        const app = server(test);
        app(() => () => (
            ['div', {
                id: 'test',
                style: 'width: 20px;',
            }]
        ));
        app.setState({});
        expect(test)
            .toHaveBeenCalledWith('<div id="test" style="width: 20px;">\n</div>');
    });

    it('should translate classNames', () => {
        const test = jest.fn();
        const app = server(test);
        app.setState({});
        app(() => () => (
            ['div.test']
        ));
        expect(test)
            .toHaveBeenCalledWith('<div class="test">\n</div>');
        app(() => () => (
            ['div', {
                className: {
                    test1: true,
                    test2: false,
                    test3: true,
                },
            }]
        ));
        expect(test)
            .toHaveBeenCalledWith('<div class="test1 test3">\n</div>');
    });

    it('should recognize singleton html tags', () => {
        const test = jest.fn();
        const app = server(test);
        app.setState({});
        app(() => () => (
            ['div', {}, [
                ['area'],
                ['base'],
                ['br'],
                ['col'],
                ['command'],
                ['embed'],
                ['hr'],
                ['img'],
                ['input'],
                ['keygen'],
                ['link'],
                ['meta'],
                ['param'],
                ['source'],
                ['track'],
                ['wbr'],
            ]]
        ));
        expect(test)
            .toHaveBeenCalledWith(
                '<div>\n' +
                '  <area />\n' +
                '  <base />\n' +
                '  <br />\n' +
                '  <col />\n' +
                '  <command />\n' +
                '  <embed />\n' +
                '  <hr />\n' +
                '  <img />\n' +
                '  <input />\n' +
                '  <keygen />\n' +
                '  <link />\n' +
                '  <meta />\n' +
                '  <param />\n' +
                '  <source />\n' +
                '  <track />\n' +
                '  <wbr />\n' +
                '</div>'
            );
    });

    it('should correctly handle attributes on singletons', () => {
        const test = jest.fn();
        const app = server(test);
        app(() => () => (
            ['img', {
                src: 'https://example.com/test.png?q=test',
                alt: 'logo',
            }]
        ));
        app.setState({});
        expect(test)
            .toHaveBeenCalledWith('<img src="https://example.com/test.png?q=test" alt="logo" />');
    });

    it('should not use singletons when the tag has children', () => {
        const test = jest.fn();
        const app = server(test);
        app(() => () => (
            ['img', {}, [
                'test',
            ]]
        ));
        app.setState({});
        expect(test)
            .toHaveBeenCalledWith(
                '<img>\n' +
                '  test\n' +
                '</img>'
            );
    });

    it('should correctly render complex structures', () => {
        const app = server((output) => {
            expect(output)
                .toMatchSnapshot();
        });
        app(() => () => (
            ['span#body.center', {}, [
                ['center', {}, [
                    ['div#large | height: 200px; margin-top: 90px;', {}, [
                        ['div | padding-top: 100px;', {}, [
                            ['div#logo | background-size: 250px 90px; height: 90px; width: 250px;', {
                                title: 'Test',
                                align: 'left',
                            }, [
                                ['div.logo-subtext', {}, [
                                    'Subtext',
                                ]],
                            ]],
                        ]],
                    ]],
                    ['div | height: 120px;', {}],
                    ['div#prompt | margin-top: 10px;', {}, [
                        ['div#alias', {}, [
                            ['div#offer', {}, [
                                'Example.com offered in: ',
                                ['a', {
                                    href: 'https://example.com',
                                }, [
                                    'Français',
                                ]],
                            ]],
                        ]],
                        ['div#swimlanes', {}],
                    ]],
                ]],
            ]]
        ));
        app.setState({});
    });
});

describe('routerless', () => {
    it('should not have router api', () => {
        const app = routerless();
        expect(app.redirect)
            .toBeFalsy();
        expect(app.show)
            .toBeFalsy();
        expect(() => app('/', () => () => 'test'))
            .toThrow(Error);
    });
});

describe('stateless', () => {
    it('should not have state api', () => {
        const app = stateless();
        expect(app.act)
            .toBeFalsy();
        expect(app.undo)
            .toBeFalsy();
        expect(app.redo)
            .toBeFalsy();
    });
});
