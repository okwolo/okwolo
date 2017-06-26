const should = require('chai').should();

const goo = require('./goo');

const jsdom = require('jsdom');

const newWindow = (callback) => {
    jsdom.env(
        '<div class="wrapper"></div>',
        (err, window) => {
            if (err) {
                console.error(err);
            }
            testWindow = window;
            window.requestAnimationFrame = (f) => setTimeout(f, 0);
            const wrapper = window.document.querySelector('.wrapper');
            const app = goo(wrapper, window);
            setTimeout(() => {
                callback(app, wrapper);
            }, 0);
        }
    );
};

describe.only('goo', () => {
    it('should expose the top level api', (done) => {
        newWindow((app, wrapper) => {
            app.setState.should.exist;
            app.setState.should.exist;
            app.getState.should.exist;
            app.redirect.should.exist;
            app.act.should.exist;
            app.act.should.exist;
            app.use.should.exist;
            app.update.should.exist;
            app.undo.should.exist;
            app.redo.should.exist;
            done();
        });
    });
});
