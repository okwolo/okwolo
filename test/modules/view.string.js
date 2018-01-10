'use strict';

// TODO move tests from test/kits/server.js

const v = require('../../src/modules/view');
const vb = require('../../src/modules/view.build');
const vs = require('../../src/modules/view.string');

describe('view.string', () => {
    it('should accept undefined/null element attributes', () => {
        const app = o(v, vb, vs);
        app.send('state', {});
        app.use('target', (htmlString) => {});
        expect(() => app(() => () => (
            ['div.test', {
                test1: undefined,
                test2: null,
            }]
        )))
            .not.toThrow(Error);
    });
});
