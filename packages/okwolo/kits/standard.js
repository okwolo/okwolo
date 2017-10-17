'use strict';

const core = require('../core');

module.exports = core({
    modules: [
        require('@okwolo/dom'),
        require('@okwolo/state'),
        require('@okwolo/router'),
        require('@okwolo/router/blob'),
        require('@okwolo/dom/blob'),
        require('@okwolo/history/blob'),
    ],
    options: {
        kit: 'standard',
        browser: true,
    },
});
