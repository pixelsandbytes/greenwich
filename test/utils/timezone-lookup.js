var acClient = require('./../../lib/clients/wunderground-autocomplete'),
    lru = require('lru-cache'),
    q = require('q'),
    sinon = require('sinon'),
    TimezoneLookup = require('./../../lib/utils/timezone-lookup');

/* global describe, before, it, after */
describe('TimezoneLookup.queryByCity', function() {

    describe('query that returns no exact matches', function() {
        var acClientMock,
            tzLookup,
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
            tzLookup = new TimezoneLookup();
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
                    done();
                });
        });

        after(function() {
            acClientMock.restore();
        });

    });

    describe('query that returns an exact match', function() {
        var acClientMock,
            cache,
            tzLookup,
            city = 'San Francisco, California',
            apiResults = [
                {
                    city: 'San Francisco, California, USA',
                    timezone: 'America/Los_Angeles',
                    tz: 'PST',
                    path: '/q/zmw:94101.1.99999'
                },{
                    city: 'San Francisco, California',
                    timezone: 'America/Los_Angeles',
                    tz: 'PST',
                    path: '/q/zmw:94101.1.99999'
                }
            ];

        before(function() {
            acClientMock = sinon.mock(acClient);
            acClientMock.expects('queryCities')
                .withExactArgs(city, { max: undefined })
                .once()
                .returns(q(apiResults));
            cache = lru();
            var lruMock = function() {
                return cache;
            };
            tzLookup = new TimezoneLookup(lruMock);
        });

        it('should resolve promise with array of results and put exact match into cache', function(done) {
            tzLookup.queryByCity(city)
                .then(function(results) {
                    results.should.eql(apiResults);
                    acClientMock.verify();
                    cache.peek(city).should.eql({
                        city: 'San Francisco, California',
                        timezone: 'America/Los_Angeles',
                        tz: 'PST',
                        path: '/q/zmw:94101.1.99999'
                    });
                    done();
                })
                .fail(function(e) {
                    console.trace(e);
                    true.should.equal(false);
                    done();
                });
        });

        after(function() {
            acClientMock.restore();
        });

    });

    describe('query is in cache but not looking for an exact match', function() {
        var acClientMock,
            cache,
            tzLookup,
            city = 'San Francisco, California',
            apiResults = [
                {
                    city: 'San Francisco, California, USA',
                    timezone: 'America/Los_Angeles',
                    tz: 'PST',
                    path: '/q/zmw:94101.1.99999'
                },{
                    city: 'San Francisco, California',
                    timezone: 'America/Los_Angeles',
                    tz: 'PST',
                    path: '/q/zmw:94101.1.99999'
                }
            ];

        before(function() {
            acClientMock = sinon.mock(acClient);
            acClientMock.expects('queryCities')
                .withExactArgs(city, { max: undefined })
                .once()
                .returns(q(apiResults));
            cache = lru();
            cache.set(city, {
                city: 'San Francisco, California',
                timezone: 'America/Los_Angeles',
                tz: 'PST',
                path: '/q/zmw:94101.1.99999'
            });
            var lruMock = function() {
                return cache;
            };
            tzLookup = new TimezoneLookup(lruMock);
        });

        it('should resolve promise with results from API and not cache', function(done) {
            tzLookup.queryByCity(city)
                .then(function(results) {
                    results.should.eql(apiResults);
                    acClientMock.verify();
                    done();
                })
                .fail(function(e) {
                    console.trace(e);
                    true.should.equal(false);
                    done();
                });
        });

        after(function() {
            acClientMock.restore();
        });

    });

    describe('exact query that returns no exact matches', function() {
        var acClientMock,
            tzLookup,
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
            tzLookup = new TimezoneLookup();
        });

        it('should resolve promise with no results', function(done) {
            tzLookup.queryByCity(city, { exact: true })
                .then(function(results) {
                    results.should.eql([]);
                    acClientMock.verify();
                    done();
                })
                .fail(function(e) {
                    console.trace(e);
                    true.should.equal(false);
                    done();
                });
        });

        after(function() {
            acClientMock.restore();
        });

    });

    describe('exact query that returns an exact match', function() {
        var acClientMock,
            cache,
            tzLookup,
            city = 'San Francisco, California',
            apiResults = [
                {
                    city: 'San Francisco, California, USA',
                    timezone: 'America/Los_Angeles',
                    tz: 'PST',
                    path: '/q/zmw:94101.1.99999'
                },{
                    city: 'San Francisco, California',
                    timezone: 'America/Los_Angeles',
                    tz: 'PST',
                    path: '/q/zmw:94101.1.99999'
                }
            ];

        before(function() {
            acClientMock = sinon.mock(acClient);
            acClientMock.expects('queryCities')
                .withExactArgs(city, { max: undefined })
                .once()
                .returns(q(apiResults));
            cache = lru();
            var lruMock = function() {
                return cache;
            };
            tzLookup = new TimezoneLookup(lruMock);
        });

        it('should resolve promise with exact result and put exact match into cache', function(done) {
            tzLookup.queryByCity(city, { exact: true })
                .then(function(results) {
                    results.should.eql([{
                        city: 'San Francisco, California',
                        timezone: 'America/Los_Angeles',
                        tz: 'PST',
                        path: '/q/zmw:94101.1.99999'
                    }]);
                    acClientMock.verify();
                    cache.peek(city).should.eql({
                        city: 'San Francisco, California',
                        timezone: 'America/Los_Angeles',
                        tz: 'PST',
                        path: '/q/zmw:94101.1.99999'
                    });
                    done();
                })
                .fail(function(e) {
                    console.trace(e);
                    true.should.equal(false);
                    done();
                });
        });

        after(function() {
            acClientMock.restore();
        });

    });

    describe('exact query that has a cached result', function() {
        var acClientMock,
            cache,
            tzLookup,
            city = 'San Francisco, California',
            cityData = {
                city: 'San Francisco, California',
                timezone: 'America/Los_Angeles',
                tz: 'PST',
                path: '/q/zmw:94101.1.99999'
            };

        before(function() {
            acClientMock = sinon.mock(acClient);
            acClientMock.expects('queryCities')
                .never();
            cache = lru();
            cache.set(city, cityData);
            var lruMock = function() {
                return cache;
            };
            tzLookup = new TimezoneLookup(lruMock);
        });

        it('should resolve promise with cached data without making an API call', function(done) {
            tzLookup.queryByCity(city, { exact: true })
                .then(function(results) {
                    results.should.eql([ cityData ]);
                    acClientMock.verify();
                    cache.peek(city).should.eql(cityData);
                    done();
                })
                .fail(function(e) {
                    console.trace(e);
                    true.should.equal(false);
                    done();
                });
        });

        after(function() {
            acClientMock.restore();
        });

    });

    describe('query for a max of 2 results', function() {
        var acClientMock,
            tzLookup,
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
                .withExactArgs(city, { max: 2 })
                .once()
                .returns(q(apiResults));
            tzLookup = new TimezoneLookup();
        });

        it('should call API with max set to 2', function(done) {
            tzLookup.queryByCity(city, { max: 2 })
                .then(function(results) {
                    results.should.eql(apiResults);
                    acClientMock.verify();
                    done();
                })
                .fail(function(e) {
                    console.trace(e);
                    true.should.equal(false);
                    done();
                });
        });

        after(function() {
            acClientMock.restore();
        });

    });

});