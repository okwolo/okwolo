'use strict';

const core = require('../src/core');

describe('core', () => {
    it('should return an okwolo function', () => {
        expect(core({}))
            .toBeInstanceOf(Function);
    });

    it('should return an okwolo function that returns an app', () => {
        expect(core({})())
            .toBeInstanceOf(Function);
    });

    it('should add the kit name to the okwolo function', () => {
        const name = 'test';
        expect(core({options: {kit: name}}).kit)
            .toBe(name);
    });

    it('should expose the version', () => {
        expect(okwolo.version)
            .toMatch(/^(\d+\.){2}\d+$/g);
    });

    it('should initialize the modules', () => {
        const _window = {};
        const test = ({on, send}, window) => {
            expect(on)
                .toBeInstanceOf(Function);
            expect(send)
                .toBeInstanceOf(Function);
            expect(window)
                .toBe(_window);
        };
        core({modules: [test]})(null, _window);
    });

    it('should add "on" to the api', () => {
        expect(core({})().on)
            .toBeInstanceOf(Function);
    });

    it('should add "send" to the api', () => {
        expect(core({})().send)
            .toBeInstanceOf(Function);
    });

    it('should add "use" to the api', () => {
        expect(core({})().use)
            .toBeInstanceOf(Function);
    });

    describe('use', () => {
        describe('api', () => {
            it('should change the app\'s api', () => {
                const app = core({})();
                const key = 'test';
                app.use('api', {[key]: 'test'});
                expect(app[key])
                    .toBe('test');
            });

            it('should reject malformed additionnal api', () => {
                const app = core({})();
                expect(() => app.use({api: 'test'}))
                    .toThrow(/api.*object[^]*test/);
            });
        });

        describe('primary', () => {
            it('should replace the app function\'s primary action', () => {
                const test = jest.fn();
                const app = core({})();
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
                const app = core({})();
                const arg1 = () => 0;
                const arg2 = {arg1};
                app.use({primary: test});
                app(arg1, arg2);
                expect(test)
                    .toHaveBeenCalledWith(arg1, arg2);
            });

            it('should only accept functions', () => {
                const app = core({})();
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
                core({options: {kit: name}});
                expect(window.okwolo['name'])
                    .toBeDefined();
            });
        });

        describe('browser', () => {
            it('should check for a browser environemnt', () => {
                const _window = global.window;
                delete global.window;
                expect(() => core({options: {
                    browser: true,
                }})())
                    .toThrow('browser');
                global.window = _window;
                expect(() => core({options: {
                    browser: true,
                }})())
                    .not.toThrow(Error);
            });
        });
    });
});
