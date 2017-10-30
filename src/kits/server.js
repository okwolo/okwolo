'use strict';

const core = require('../core');

module.exports = core({
    modules: [
        require('../modules/view'),
        require('../modules/view.build'),
        // since the blobs are added sequentially, the draw and update functions
        // in the view module will be overwritten.
        require('../modules/view.string'),
        require('../modules/state'),
    ],
    options: {
        kit: 'server',
        browser: false,
    },
});
