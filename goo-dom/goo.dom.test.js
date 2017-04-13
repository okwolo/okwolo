const jsdom = require('jsdom');

const newWindow = (builder, initialState, callback) => {
    jsdom.env(
        '<div class="wrapper"></div>',
        [],
        (err, window) => {
            if (err) {
                console.error(err);
            }
            window.requestAnimationFrame = (f) => setTimeout(f, 0);
            const dom = require('./goo.dom')();
            let update = null;
            const wrapper = window.document.querySelector('.wrapper');
            dom.use({
                controller: {
                    window: window,
                    target: wrapper,
                    builder: builder,
                    initialState: initialState,
                    update: (u) => update = u,
                },
            });
            setTimeout(() => {
                callback(wrapper, (newState, callback) => {
                    update(newState);
                    setTimeout(callback, 0);
                });
            }, 0);
        }
    );
};

newWindow((s) => (
    ['span  .test  |  height: 20px;', {}, [s]]
), 'test', (wrapper, update) => {
    console.log(wrapper.outerHTML);
    update('test2', () => {
        console.log(wrapper.outerHTML);
    });
});
