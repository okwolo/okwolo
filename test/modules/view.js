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
        app.send('state', {});
        app.send('blob.builder', () => ['span']);
        await sleep();
        expect(wrapper.children[0].tagName)
            .toBe('SPAN');
    });

    it('should not attempt to draw before it can', () => {
        const init = (e) => {
            const app = o(v);
            expect(() => e(app.send))
                .not.toThrow(Error);
        };
        // missing build
        init((send) => {
            send('blob.target', wrapper);
            send('blob.builder', () => 'test');
            send('blob.state', () => 'test');
        });
        // missing target
        init((send) => {
            send('blob.draw', () => 0);
            send('blob.build', () => 'test');
            send('blob.builder', () => 'test');
            send('blob.state', () => 'test');
        });
        // missing builder
        init((send) => {
            send('blob.build', () => 'test');
            send('blob.target', wrapper);
            send('blob.state', () => 'test');
        });
        // missing state
        init((send) => {
            send('blob.build', () => 'test');
            send('blob.target', wrapper);
            send('blob.builder', () => 'test');
        });
    });

    describe('blobs', () => {
        it('should not accept multiple items per key', () => {
            const app = o(v, vb, vd);
            expect(() => app.send('blob.builder', [() => 'test']))
                .toThrow(Error);
            expect(() => app.send('blob.draw', [() => {}]))
                .toThrow(Error);
            expect(() => app.send('blob.update', [() => {}]))
                .toThrow(Error);
            expect(() => app.send('blob.build', [() => ({text: 'test'})]))
                .toThrow(Error);
        });

        describe('target', () => {
            it('should reject malformed targets', () => {
                const app = o(v, vb, vd);
                app.send('state', {});
                app.send('blob.builder', () => 'test');
                expect(() => app.send('blob.target', null))
                    .toThrow(/target/g);
            });

            it('should change the render target', async () => {
                const app = o(v, vb, vd);
                app.send('state', {});
                app.send('blob.builder', () => 'test');
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test');
                const newTarget = document.createElement('div');
                wrapper.innerHTML = '';
                wrapper.appendChild(newTarget);
                expect(wrapper.innerHTML)
                    .toBe('<div></div>');
                app.send('blob.target', newTarget);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('<div>test</div>');
            });
        });

        describe('builder', () => {
            it('should reject malformed builders', () => {
                const app = o(v, vb, vd);
                expect(() => app.send('blob.builder', null))
                    .toThrow(/builder/g);
            });

            it('should change the builder function', async () => {
                const app = o(v, vb, vd);
                app.send('state', {});
                app.send('blob.builder', () => 'test');
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('test');
                app.send('blob.builder', () => 'content');
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('content');
            });
        });

        describe('state', () => {
            it('should reject undefined state', () => {
                const app = o(v, vb, vd);
                expect(() => app.send('state', undefined))
                    .toThrow(/state/gi);
            });

            it('should trigger an update', async () => {
                const app = o(v, vb, vd);
                app.send('state', 'initial');
                app.send('blob.builder', (s) => s);
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('initial');
                app.send('state', 'changed');
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('changed');
            });
        });

        describe('draw', () => {
            it('should reject malformed draw', () => {
                const app = o(v, vb, vd);
                expect(() => app.send('blob.draw', {}))
                    .toThrow(/draw/g);
            });

            it('should trigger a redraw', async () => {
                const app = o(v, vb, vd);
                const test = jest.fn();
                app.send('state', {});
                app.send('blob.builder', () => 'test');
                app.send('blob.draw', test);
                await sleep();
                expect(test)
                    .toHaveBeenCalled();
            });
        });

        describe('update', () => {
            it('should reject malformed update', () => {
                const app = o(v, vb, vd);
                expect(() => app.send('blob.update', {}))
                    .toThrow(/update/g);
            });
        });

        describe('build', () => {
            it('should reject malformed build', () => {
                const app = o(v, vb, vd);
                expect(() => app.send('blob.build', {}))
                    .toThrow(/build/g);
            });

            it('should trigger an update', async () => {
                const app = o(v, vb, vd);
                const test = jest.fn();
                app.send('state', {});
                app.send('blob.builder', () => 'test');
                app.send('blob.build', test);
                await sleep();
                expect(test)
                    .toHaveBeenCalled();
            });

            it('should receive the builder\'s output and be able to edit it', async () => {
                const app = o(v, vb, vd);
                app.send('state', {});
                app.send('blob.builder', () => 'test');
                app.send('blob.build', (element) => {
                    expect(element)
                        .toEqual('test');
                    return {text: 'changed'};
                });
                await sleep();
                expect(wrapper.innerHTML)
                    .toBe('changed');
            });
        });
    });
});
