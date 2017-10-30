'use strict';

const core = require('../src/core');

describe('core', () => {
    const c = (modules = [], options = {}) => {
        return core({modules, options});
    };

    it('should return an okwolo function', () => {
        expect(c())
            .toBeInstanceOf(Function);
    });

    it('should return an okwolo function that returns an app', () => {
        expect(c()())
            .toBeInstanceOf(Function);
    });

    it('should add the kit name to the okwolo function', () => {
        const name = 'test';
        expect(c([], {kit: name}).kit)
            .toBe(name);
    });

    it('should expose the version', () => {
        expect(okwolo.version)
            .toMatch(/^(\d+\.){2}\d+$/g);
    });

    it('should initialize the modules', () => {
        const _window = {};
        const test = ({use, emit}, window) => {
            expect(use)
                .toBeInstanceOf(Function);
            expect(use.on)
                .toBeInstanceOf(Function);
            expect(emit)
                .toBeInstanceOf(Function);
            expect(emit.on)
                .toBeInstanceOf(Function);
            expect(window)
                .toBe(_window);
        };
        c([test])(null, _window);
    });

    it('should add use to the api', () => {
        expect(c()().use)
            .toBeInstanceOf(Function);
        expect(c()().use.on)
            .toBeInstanceOf(Function);
    });

    it('should add emit to the api', () => {
        expect(c()().emit)
            .toBeInstanceOf(Function);
        expect(c()().emit.on)
            .toBeInstanceOf(Function);
    });

    describe('use', () => {
        describe('api', () => {
            it('should change the app\'s api', () => {
                const app = c()();
                const key = 'test';
                app.use({api: {[key]: 'test'}});
                expect(app[key])
                    .toBe('test');
            });

            it('should reject malformed additionnal api', () => {
                const app = c()();
                expect(() => app.use({api: 'test'}))
                    .toThrow(/api.*object[^]*test/);
            });
        });

        describe('primary', () => {
            it('should replace the app function\'s primary action', () => {
                const test = jest.fn();
                const app = c()();
                app();
                expect(test)
                    .toHaveBeenCalledTimes(0);
                app.use({primary: test});
                app();
                expect(test)
                    .toHaveBeenCalledTimes(1);
                app.use({primary: () => 0});
                app();
                expect(test)
                    .toHaveBeenCalledTimes(1);
            });

            it('should pass all arguments to the new primary action', () => {
                const test = jest.fn();
                const app = c()();
                const arg1 = () => 0;
                const arg2 = {arg1};
                app.use({primary: test});
                app(arg1, arg2);
                expect(test)
                    .toHaveBeenCalledWith(arg1, arg2);
            });

            it('should only accept functions', () => {
                const app = c()();
                expect(() => app.use({primary: 0}))
                    .toThrow(/primary.*function[^]*0/);
                expect(() => app.use({primary: {}}))
                    .toThrow(/primary.*function[^]*{}/);
            });
        });
    });

    describe('options', () => {
        describe('kit', () => {
            it('should add the kit to the window', () => {
                const name = 'test';
                c([], {kit: name});
                expect(window.okwolo['name'])
                    .toBeDefined();
            });
        });

        describe('browser', () => {
            it('should check for a browser environemnt', () => {
                const _window = global.window;
                delete global.window;
                expect(() => c([], {
                    browser: true,
                })())
                    .toThrow('browser');
                global.window = _window;
                expect(() => c([], {
                    browser: true,
                })())
                    .not.toThrow(Error);
            });
        });
    });
});

describe('modules', () => {
    describe('state', () => {
        xit('should add act to the api', () => {
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

        xit('should use an action to setState', () => {
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
        xit('should not be added without state', () => {
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

        xit('should add undo to the api', () => {
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

        xit('should add redo to the api', () => {
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
        xit('should use the target immediately', () => {
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

        xit('should add update to the api', () => {
            expect(c()().update)
                .toBeFalsy();
            expect(c({
                modules: {
                    dom: true,
                },
            })().update)
                .toBeInstanceOf(Function);
        });

        xit('should emit the current state when updated', () => {
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
        xit('should add redirect to the api', () => {
            expect(c()().redirect)
                .toBeFalsy();
            expect(c({
                modules: {
                    router: true,
                },
            })().redirect)
                .toBeInstanceOf(Function);
        });

        xit('should emit redirect when redirected', () => {
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

        xit('should add show to the api', () => {
            expect(c()().show)
                .toBeFalsy();
            expect(c({
                modules: {
                    router: true,
                },
            })().show)
                .toBeInstanceOf(Function);
        });

        xit('should emit show when showed', () => {
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

        xit('should allow registering paths', () => {
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
