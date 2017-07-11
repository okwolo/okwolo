'use strict';

const goo = require('./');

let wrapper;

describe('goo-js', () => {
    beforeEach(() => {
        wrapper = document.createElement('div');
        document.body.appendChild(wrapper);
    });

    afterEach(() => {
        document.body.removeChild(wrapper);
        wrapper = null;
    });

    it('should add itself to the window object', () => {
        expect(window.goo)
            .toBeInstanceOf(Function);
    });

    it('should return a function', () => {
        expect(goo())
            .toBeInstanceOf(Function);
    });

    describe('app', () => {
        it('should expose the top level api', () => {
            const app = goo();
            expect(app.setState)
                .toBeInstanceOf(Function);
            expect(app.setState)
                .toBeInstanceOf(Function);
            expect(app.getState)
                .toBeInstanceOf(Function);
            expect(app.redirect)
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
            const app = goo(wrapper);
            app.setState({});
            app(() => () => ['test']);
            await sleep();
            expect(wrapper.innerHTML)
                .toBe('<test></test>');
        });

        it('should expect a function that returns a function', () => {
            const app = goo(wrapper);
            app.setState({});
            expect(() => app(() => ['test']))
                .toThrow(/builder/);
        });

        it('should register builders for specific routes', async () => {
            const app = goo(wrapper);
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
            const app = goo(wrapper);
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
            const app = goo();
            expect(() => app.getState())
                .toThrow(/state/);
        });

        it('should return the state', () => {
            const app = goo();
            app.setState({test: true});
            expect(app.getState())
                .toEqual({test: true});
        });

        it('should return a copy of the state', () => {
            const app = goo();
            const state = {test: true};
            app.setState(state);
            expect(app.getState())
                .not.toBe(state);
        });
    });

    describe('setState', () => {
        it('should change the state', () => {
            const app = goo();
            app.setState({test: true});
            expect(app.getState())
                .toEqual({test: true});
        });

        it('should accept a function', () => {
            const app = goo();
            app.setState(() => ({test: true}));
            expect(app.getState())
                .toEqual({test: true});
        });

        it('should update goo-dom\'s state', () => {
            const app = goo(wrapper);
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
            const app = goo();
            app.redirect('/test/xyz');
            expect(window.location.pathname)
                .toBe('/test/xyz');
        });
    });

    describe('act', () => {
        it('should not allow actions before state has been set', () => {
            const app = goo();
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

        it('should add an override action', () => {
            const app = goo();
            app.setState({});
            expect(() => app.act('__OVERRIDE__'))
                .not.toThrow(Error);
        });

        it('should add an UNDO action', () => {
            const app = goo();
            app.setState({});
            expect(() => app.act('UNDO'))
                .not.toThrow(Error);
        });

        it('should add a REDO action', () => {
            const app = goo();
            app.setState({});
            expect(() => app.act('REDO'))
                .not.toThrow(Error);
        });

        it('should accept a function', () => {
            const app = goo();
            app.setState({});
            app.act(() => ({test: true}));
            expect(app.getState())
                .toEqual({test: true});
        });
    });

    describe('use', () => {
        it('should forward use calls to all modules', () => {
            const app = goo();
            expect(app.use({}))
                .toHaveLength(3);
        });

        it('should support named blobs', () => {
            const app = goo();
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
            const app = goo(wrapper);
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
            const app = goo();
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
            const app = goo();
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
});
