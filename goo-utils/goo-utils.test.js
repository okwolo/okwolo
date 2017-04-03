const should = require('chai').should();

const utils = require('./goo-utils');

describe('jsonCopy', function() {
    const jsonCopy = utils.jsonCopy;

    it('should return an object', function() {
        jsonCopy({}).should.be.an('object');
    });

    it('should not mutate inputs', function() {
        let obj = {a: 1};
        let wrapper = {b: obj};
        jsonCopy(wrapper);
        wrapper.b.should.equal(obj);
    });

    it('should copy an object', function() {
        let obj = {};
        jsonCopy(obj).should.not.equal(obj);
    });

    it('should deep copy an object', function() {
        let obj = {a: 1};
        jsonCopy({b: obj}).b.should.not.equal(obj);
    });

    it('should copy strings', function() {
        jsonCopy('a').should.equal('a');
    });

    it('should copy numbers', function() {
        jsonCopy(1).should.equal(1);
    });

    it('should copy arrays', function() {
        jsonCopy([1, 2, 3]).should.be.an('array');
    });

    it('should return an empty object when given undefined', function() {
        Object.keys(jsonCopy(undefined)).length.should.equal(0);
    });

    it('should return an empty object when given a function', function() {
        Object.keys(jsonCopy(() => 1)).length.should.equal(0);
    });

    it('should not copy functions', function() {
        should.not.exist(jsonCopy({a: () => null}).a);
    });

    it('should not copy dates', function() {
        jsonCopy(new Date()).should.be.a('string');
    });
});
