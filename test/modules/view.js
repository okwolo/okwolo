'use strict';

const v = require('../../src/modules/view');
const vb = require('../../src/modules/view.build');
const vd = require('../../src/modules/view.dom');

describe('view', () => {
    beforeEach(() => {
        wrapper = document.createElement('div');
        document.body.appendChild(wrapper);
    });

    afterEach(() => {
        document.body.removeChild(wrapper);
        wrapper = null;
    });

    it('should add the builder function\'s output to the target', async () => {
        const app = o(v, vb, vd);
        app.emit({state: {}});
        app.use({builder: () => ['span']});
        await sleep();
        expect(wrapper.children[0].tagName)
            .toBe('SPAN');
    });

    it('should not attempt to draw before it can', () => {
        const init = (events) => {
            const app = o(v);
            expect(() => {
                app.use(events);
                app.emit(events);
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
            draw: () => 0,
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

    describe('use', () => {
        it('should not accept multiple items per key', () => {
            const app = o(v, vb, vd);
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
        });

        describe('target', () => {
            it('should reject malformed targets', () => {
                const app = o(v, vb, vd);
                app.emit({state: {}});
                app.use({builder: () => 'test'});
                expect(() => app.use({target: null}))
                    .toThrow(/target/g);
            });

            it('should change the render target', async () => {
                const app = o(v, vb, vd);
                app.emit({state: {}});
                app.use({builder: () => 'test'});
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
                const app = o(v, vb, vd);
                expect(() => app.use({builder: null}))
                    .toThrow(/builder/g);
            });

            it('should change the builder function', async () => {
                const app = o(v, vb, vd);
                app.emit({state: {}});
                app.use({builder: () => 'test'});
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
                const app = o(v, vb, vd);
                expect(() => app.emit({state: undefined}))
                    .toThrow(/state/gi);
            });

            it('should trigger an update', async () => {
                const app = o(v, vb, vd);
                app.emit({state: 'initial'});
                app.use({builder: (s) => s});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('initial');
                app.emit({state: 'changed'});
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('changed');
            });
        });

        describe('draw', () => {
            it('should reject malformed draw', () => {
                const app = o(v, vb, vd);
                expect(() => app.use({draw: {}}))
                    .toThrow(/draw/g);
            });

            it('should trigger a redraw', async () => {
                const app = o(v, vb, vd);
                const test = jest.fn();
                app.emit({state: {}});
                app.use({builder: () => 'test'});
                app.use({draw: test});
                await sleep();
                expect(test)
                    .toHaveBeenCalled();
            });
        });

        describe('update', () => {
            it('should reject malformed update', () => {
                const app = o(v, vb, vd);
                expect(() => app.use({update: {}}))
                    .toThrow(/update/g);
            });
        });

        describe('build', () => {
            it('should reject malformed build', () => {
                const app = o(v, vb, vd);
                expect(() => app.use({build: {}}))
                    .toThrow(/build/g);
            });

            it('should trigger an update', async () => {
                const app = o(v, vb, vd);
                const test = jest.fn();
                app.emit({state: {}});
                app.use({builder: () => 'test'});
                app.use({build: test});
                await sleep();
                expect(test)
                    .toHaveBeenCalled();
            });

            it('should receive the builder\'s output and be able to edit it', async () => {
                const app = o(v, vb, vd);
                app.emit({state: {}});
                app.use({builder: () => 'test'});
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
    });
});
