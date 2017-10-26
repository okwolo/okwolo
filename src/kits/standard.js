'use strict';

const core = require('okwolo/src/core');

module.exports = core({
    modules: [
        require('okwolo/src/modules/view'),
        require('okwolo/src/modules/view.dom'),
        require('okwolo/src/modules/state'),
        require('okwolo/src/modules/state.history'),
        require('okwolo/src/modules/router'),
        require('okwolo/src/modules/router.register'),
        require('okwolo/src/modules/router.fetch'),
    ],
    options: {
        kit: 'standard',
        browser: true,
    },
});
