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

    describe('events', () => {
        describe('state', () => {
            it('should emit an update when state changes', () => {
                const test = jest.fn();
                const app = o(v);
                app.on('update', test);
                app.send('state', {});
                expect(test)
                    .toHaveBeenCalled();
            });

            it('should not accept undefined state', () => {
                const app = o(v);
                expect(() => app.send('state', undefined))
                    .toThrow(/undefined/g);
            });
        });

        describe('update', () => {
            it('should wait for target, builder and state', () => {
                const test = jest.fn();
                const app = o(v);
                app.send('blob.draw', test);
                app.send('blob.update', test);
                app.send('blob.build', test);
                app.send('blob.target', {});
                expect(test)
                    .not.toHaveBeenCalled();
                app.send('blob.builder', () => {});
                expect(test)
                    .not.toHaveBeenCalled();
                app.send('state', {});
                expect(test)
                    .toHaveBeenCalled();
            });

            it('should draw before updating', () => {
                const test1 = jest.fn();
                const test2 = jest.fn();
                const app = o(v);
                app.send('blob.draw', test1);
                app.send('blob.update', () => {
                    test2();
                    expect(test1)
                        .toHaveBeenCalled();
                });
                app.send('blob.build', () => {});
                app.send('blob.target', {});
                app.send('blob.builder', () => {});
                app.send('state', {});
                app.update();
                expect(test2)
                    .toHaveBeenCalled();
            });

            it('should allow for a forced redraw', () => {
                const test1 = jest.fn();
                const test2 = jest.fn();
                const app = o(v);
                app.send('blob.draw', test1);
                app.send('blob.update', test2);
                app.send('blob.build', () => {});
                app.send('blob.target', {});
                app.send('blob.builder', () => {});
                app.send('state', {});
                app.send('update', true);
                expect(test1)
                    .toHaveBeenCalledTimes(2);
                expect(test2)
                    .not.toHaveBeenCalled();
            });
        });
    });
});
