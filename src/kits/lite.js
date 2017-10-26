'use strict';

const core = require('okwolo/src/core');

module.exports = core({
    modules: [
        require('okwolo/src/modules/view'),
        require('okwolo/src/modules/view.dom'),
        require('okwolo/src/modules/router'),
        require('okwolo/src/modules/router.fetch'),
        require('okwolo/src/modules/router.register.lite'),
        require('okwolo/src/modules/state'),
    ],
    options: {
        kit: 'lite',
        browser: true,
    },
});
