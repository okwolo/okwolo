'use strict';

const lite = require('../../src/kits/lite');

let wrapper;

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
        app.setState(() => ({}));
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
        app('/:test', ({test}) => () => test);
        app.redirect('/nav?test');
        await sleep();
        expect(wrapper.innerHTML)
            .toBe('nav');
    });

    it('should ignore hash navigation', async () => {
        const app = lite(wrapper);
        app.setState({});
        app('/test', () => () => 'xyz');
        await sleep();
        expect(wrapper.innerHTML)
            .toBe('');
        app.redirect('/test#test');
        await sleep();
        expect(wrapper.innerHTML)
            .toBe('xyz');
        app('/:test', ({test}) => () => test);
        app.redirect('/nav#test');
        await sleep();
        expect(wrapper.innerHTML)
            .toBe('nav');
    });
});
