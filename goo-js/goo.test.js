const goo = require('./goo');

const jsdom = require('jsdom');

const newWindow = (callback) => {
    jsdom.env(
        '<div class="wrapper"></div>',
        [],
        (err, window) => {
            if (err) {
                console.error(err);
            }
            window.requestAnimationFrame = (f) => setTimeout(f, 0);
            const wrapper = window.document.querySelector('.wrapper');
            setTimeout(() => {
                const app = goo(wrapper, window);
                callback(app, wrapper);
            }, 0);
        }
    );
};

describe('goo', () => {
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
