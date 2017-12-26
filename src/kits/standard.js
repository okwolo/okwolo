'use strict';

const core = require('../core');

module.exports = core({
    modules: [
        require('../modules/state'),
        require('../modules/state.handler'),
        require('../modules/state.handler.history'),
        require('../modules/view'),
        require('../modules/view.build'),
        require('../modules/view.dom'),
        // router placed after view to override blob.primary.
        require('../modules/router'),
        require('../modules/router.register'),
        require('../modules/router.fetch'),
    ],
    options: {
        kit: 'standard',
        browser: true,
    },
});
