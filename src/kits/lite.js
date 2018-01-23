'use strict';

const core = require('../core');

module.exports = core({
    modules: [
        require('../modules/state'),
        require('../modules/view'),
        require('../modules/view.build'),
        require('../modules/view.dom'),
        require('../modules/router'),
        require('../modules/router.fetch'),
        require('../modules/router.register-lite'),
        require('../modules/primary.router.builder'),
    ],
    options: {
        kit: 'lite',
        browser: true,
    },
});
