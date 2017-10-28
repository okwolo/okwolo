'use strict';

const core = require('../core');

module.exports = core({
    modules: [
        require('../modules/view'),
        require('../modules/view.dom'),
        require('../modules/state'),
        require('../modules/state.handler'),
        require('../modules/state.handler.history'),
        require('../modules/router'),
        require('../modules/router.register'),
        require('../modules/router.fetch'),
    ],
    options: {
        kit: 'standard',
        browser: true,
    },
});
