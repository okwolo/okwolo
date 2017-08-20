'use strict';

const core = require('../core');

module.exports = core({
    modules: [
        require('@okwolo/dom'),
        require('@okwolo/state'),
        require('@okwolo/router'),
    ],
    blobs: [
        require('@okwolo/dom/blob'),
        require('@okwolo/router/blob'),
        require('@okwolo/history/blob'),
    ],
    options: {
        bundle: 'standard',
        browser: true,
        modules: {
            state: true,
            history: true,
            dom: true,
            router: true,
        },
    },
});
