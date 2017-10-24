'use strict';

const core = require('../core');

module.exports = core({
    modules: [
        require('../modules/view'),
        require('../modules/state'),
        require('../modules/router'),
        require('../modules/router.store'),
        require('../modules/view.dom'),
        require('../modules/state.history'),
    ],
    options: {
        kit: 'standard',
        browser: true,
    },
});
