'use strict';

const core = require('../src/core');

describe('core', () => {
    it('should return an okwolo function', () => {
        expect(core({}))
            .toBeInstanceOf(Function);
    });

    it('should return an okwolo function that returns an app', () => {
        expect(core()())
            .toBeInstanceOf(Function);
    });

    it('should add the kit name to the okwolo function', () => {
        const name = 'test';
        expect(core({options: {kit: name}}).kit)
            .toBe(name);
    });

    it('should expose the version', () => {
        expect(okwolo.version)
            .toBe(require('../package.json').version);
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

    describe('on/send', () => {
        it('should add "on" to the api', () => {
            expect(core()().on)
                .toBeInstanceOf(Function);
        });

        it('should add "send" to the api', () => {
            expect(core()().send)
                .toBeInstanceOf(Function);
        });

        it('should reject malformed events', () => {
            const app = core()();
            expect(() => app.send(true))
                .toThrow(/event/);
        });

        it('should call the function described in the event', () => {
            const test = jest.fn();
            const app = core()();
            app.on('test', test);
            app.send('test', null);
            expect(test)
                .toHaveBeenCalled();
        });

        it('should pass the object to the event handler function', () => {
            const test = jest.fn();
            const app = core()();
            app.on('test', test);
            app.send('test', {a: 'test123'});
            expect(test)
                .toHaveBeenCalledWith({a: 'test123'});
        });

        it('should do nothing if there is no event handler', () => {
            const app = core()();
            expect(() => app.send('test', null))
                .not.toThrow(Error);
        });
    });

    describe('use', () => {
        it('should add "use" to the api', () => {
            expect(core()().use)
                .toBeInstanceOf(Function);
        });

        it('should forward calls to send with blob prefix', () => {
            const test = jest.fn();
            const app = core()();
            app.on('blob.test', test);
            app.use('test', {test: true});
            expect(test)
                .toHaveBeenCalledWith({test: true});
        });

        it('should accept blob groups', () => {
            const test1 = jest.fn();
            const test2 = jest.fn();
            const app = core()();
            app.on('blob.test1', test1);
            app.on('blob.test2', test2);
            app.use({
                test1: true,
                test2: false,
            });
            expect(test1)
                .toHaveBeenCalledWith(true);
            expect(test2)
                .toHaveBeenCalledWith(false);
        });

        it('should reject malformed blob groups', () => {
            const app = core()();
            expect(() => app.use(null))
                .toThrow(/okwolo.*object/g);
        });

        it('should only accept one blob group of the same name', () => {
            const test = jest.fn();
            const app = core()();
            app.on('blob.test', test);
            app.use({test: 'test', name: 'name'});
            expect(test)
                .toHaveBeenCalledTimes(1);
            app.use({test: 'test', name: 'name'});
            expect(test)
                .toHaveBeenCalledTimes(1);
        });
    });

    describe('blobs', () => {
        describe('api', () => {
            it('should change the app\'s api', () => {
                const app = core()();
                const key = 'test';
                app.send('blob.api', {[key]: 'test'});
                expect(app[key])
                    .toBe('test');
            });

            it('should reject malformed additionnal api', () => {
                const app = core()();
                expect(() => app.send('blob.api', 'test'))
                    .toThrow(/api.*object[^]*test/);
            });

            it('should not allow overrides without the flag being set', () => {
                const app = core()();
                app.send('blob.api', {test: true});
                expect(() => app.send('blob.api', {test: true}))
                    .toThrow(/key.*test.*defined/g);
                expect(() => app.send('blob.api', {test: true}, true))
                    .not.toThrow(Error);
            });
        });

        describe('primary', () => {
            it('should replace the app function\'s primary action', () => {
                const test = jest.fn();
                const app = core()();
                app();
                expect(test)
                    .toHaveBeenCalledTimes(0);
                app.send('blob.primary', test);
                app();
                expect(test)
                    .toHaveBeenCalledTimes(1);
                app.send('blob.primary', () => 0);
                app();
                expect(test)
                    .toHaveBeenCalledTimes(1);
            });

            it('should pass all arguments to the new primary action', () => {
                const test = jest.fn();
                const app = core()();
                const arg1 = () => 0;
                const arg2 = {arg1};
                app.send('blob.primary', test);
                app(arg1, arg2);
                expect(test)
                    .toHaveBeenCalledWith(arg1, arg2);
            });

            it('should only accept functions', () => {
                const app = core()();
                expect(() => app.send('blob.primary', 0))
                    .toThrow(/primary.*function[^]*0/);
                expect(() => app.send('blob.primary', {}))
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
