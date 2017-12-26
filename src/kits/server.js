'use strict';

const core = require('../core');

module.exports = core({
    modules: [
        require('../modules/view'),
        require('../modules/view.build'),
        require('../modules/view.string'),
        require('../modules/state'),
    ],
    options: {
        kit: 'server',
        browser: false,
    },
});
