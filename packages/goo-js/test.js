'use strict';

const goo = require('./');

describe('goo', () => {
    it('should expose the top level api', () => {
        let wrapper = document.createElement('div');
        document.body.appendChild(wrapper);

        let app = goo(wrapper);

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
});
