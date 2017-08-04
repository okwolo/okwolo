'use strict';

const okwolo = require('okwolo');

const app = okwolo();

// use a blob with a target key
app.use({
    target: document.querySelector('body .wrapper'),
});

// blob keys can be arrays
app.use({
    watcher: [
        (state, actionType) => console.log(actionType),
        (state, actionType, params) => {
            if (actionType === 'MY_ACTION') {
                console.log(params);
            }
        },
    ],
});

const plugin = {
    name: 'my-middlware-plugin',
    middleware: (next, state, actionType, params) => {
        if (state.items.length === 0) {
            params.empty = true;
        }
        next(state, actionType, params);
    },
};

// named blobs will only be added once
app.use(plugin);
app.use(plugin);

// more info https://github.com/okwolo/okwolo/blob/master/README.md#blobs
