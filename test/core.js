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
