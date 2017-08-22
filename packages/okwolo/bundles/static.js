'use strict';

const core = require('../core');

module.exports = core({
    modules: [
        require('@okwolo/dom'),
        require('@okwolo/state'),
    ],
    blobs: [
        require('@okwolo/dom/blob'),
        require('@okwolo/history/blob'),
    ],
    options: {
        bundle: 'static',
        browser: true,
        modules: {
            state: true,
            history: true,
            dom: true,
            router: false,
        },
    },
});
