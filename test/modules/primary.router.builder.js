'use strict';

const r = require('../../src/modules/router');
const rr = require('../../src/modules/router.register');
const rf = require('../../src/modules/router.fetch');
const prb = require('../../src/modules/primary.router.builder');

describe('primary.router.builder', () => {
    it('should replace the primary', () => {
        const test = jest.fn();
        o(({on}) => {
            on('blob.primary', test);
        }, prb);
        expect(test)
            .toHaveBeenCalled();
    });

    it('should use a builder if no path is provided', () => {
        const test = jest.fn();
        const app = o(prb, ({on}) => {
            on('blob.builder', test);
        });
        expect(test)
            .toHaveBeenCalledTimes(0);
        app(() => 0);
        expect(test)
            .toHaveBeenCalledTimes(1);
    });

    it('should use a route that uses a builder when a path is given', () => {
        const testBuilder = jest.fn();
        const testRoute = jest.fn();
        const app = o(r, rr, rf, ({on}) => {
            on('blob.route', testRoute);
            on('blob.builder', testBuilder);
        }, prb);
        expect(testBuilder)
            .toHaveBeenCalledTimes(0);
        expect(testRoute)
            .toHaveBeenCalledTimes(0);
        app('/test', () => 0);
        expect(testRoute)
            .toHaveBeenCalledTimes(1);
        expect(testBuilder)
            .toHaveBeenCalledTimes(0);
        app.show('/test');
        expect(testBuilder)
            .toHaveBeenCalledTimes(1);
    });

    it('should pass route handler params to the builder generator', () => {
        const test = jest.fn();
        const app = o(r, rr, rf, prb);
        const params = {test, app};
        app('/test', test);
        app.redirect('/test', params);
        expect(test)
            .toHaveBeenCalledWith(params);
    });
});
