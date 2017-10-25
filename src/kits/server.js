'use strict';

const core = require('okwolo/src/core');

module.exports = core({
    modules: [
        require('okwolo/src/modules/view'),
        // the dom blob is still required to parse the shorthand vdom syntax.
        // since this kit is intended to be used on a server, the extra size
        // should not be a big problem. since the blobs are added sequentially,
        // the draw and update will be overwritten.
        require('okwolo/src/modules/view.dom'),
        require('okwolo/src/modules/view.string'),
    ],
    options: {
        kit: 'server',
        browser: false,
    },
});
