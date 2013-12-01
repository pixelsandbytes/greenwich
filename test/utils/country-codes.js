var countryCodes = require('./../../lib/utils/country-codes'),
    should = require('should');

/* global describe, it */
describe('CountryCodes.getCode', function() {

    describe('countries that exist', function() {

        it('should return CA for Canada', function() {
            var code = countryCodes.getCode('Canada');
            code.should.equal('CA');
        });

        it('should return US for United States', function() {
            var code = countryCodes.getCode('United States');
            code.should.equal('US');
        });

        it('should return GB for United Kingdom', function() {
            var code = countryCodes.getCode('United Kingdom');
            code.should.equal('GB');
        });

    });

    describe('countries that do not exist', function() {

        it('should return undefined for Not A Country', function() {
            var code = countryCodes.getCode('Not A Country');
            should.strictEqual(undefined, code);
        });

    });

});