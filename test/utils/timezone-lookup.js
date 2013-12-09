var acClient = require('./../../lib/clients/wunderground-autocomplete'),
    q = require('q'),
    sinon = require('sinon'),
    tzLookup = require('./../../lib/utils/timezone-lookup');

/* global describe, before, it, after */
describe('TimezoneLookup.queryByCity', function() {

    describe('query that returns no exact matches', function() {
        var acClientMock,
            city = 'San F',
            apiResults = [
                {
                    city: 'San Francisco, California',
                    timezone: 'America/Los_Angeles',
                    tz: 'PST',
                    path: '/q/zmw:94101.1.99999'
                },{
                    city: 'San Fernando, Spain',
                    timezone: 'Africa/Ceuta',
                    tz: 'CET',
                    path: '/q/zmw:00000.11.08449'
                }
            ];

        before(function() {
            acClientMock = sinon.mock(acClient);
            acClientMock.expects('queryCities')
                .withExactArgs(city, { max: undefined })
                .once()
                .returns(q(apiResults));
            
        });

        it('should resolve promise with array of results', function(done) {
            tzLookup.queryByCity(city)
                .then(function(results) {
                    results.should.eql(apiResults);
                    acClientMock.verify();
                    done();
                })
                .fail(function(e) {
                    console.trace(e);
                    true.should.equal(false);
                });
        });

        after(function() {
            acClientMock.restore();
        });

    });

});