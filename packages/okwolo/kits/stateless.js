'use strict';

const core = require('../core');

module.exports = core({
    modules: [
        require('@okwolo/dom'),
        require('@okwolo/router'),
    ],
    blobs: [
        require('@okwolo/dom/blob'),
        require('@okwolo/router/blob'),
    ],
    options: {
        kit: 'stateless',
        browser: true,
        modules: {
            state: false,
            history: false,
            dom: true,
            router: true,
        },
    },
});
