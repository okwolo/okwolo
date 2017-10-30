'use strict';

const core = require('../core');

module.exports = core({
    modules: [
        require('../modules/view'),
        // the dom blob is still required to parse the shorthand vdom syntax.
        // since this kit is intended to be used on a server, the extra size
        // is less of a concern.
        require('../modules/view.dom'),
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
