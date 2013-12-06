require('should');
var acClient = require('./../../lib/clients/wunderground-autocomplete'),
    nock = require('nock');

/* global describe, it */
describe('WndrgrndAutoCompleteClient.buildQueryParams', function() {

    describe('with city only', function() {
        it('should return a query string only', function() {
            var city = 'San F';
            var params = acClient.buildQueryParams(city);
            params.should.eql({
                query: city,
                c: undefined
            });
        });
    });

    describe('with city, province', function() {
        it('should return a query string only', function() {
            var city = 'London';
            var params = acClient.buildQueryParams(city + ', Ontario');
            params.should.eql({
                query: city,
                c: undefined
            });
        });
    });

    describe('with city, country', function() {
        it('should return query string and country code', function() {
            var city = 'London';
            var params = acClient.buildQueryParams(city + ', United Kingdom');
            params.should.eql({
                query: city,
                c: 'GB'
            });
        });
    });

    describe('with city, country code', function() {
        it('should return query string and country code', function() {
            var city = 'London',
                cc = 'GB';
            var params = acClient.buildQueryParams(city + ', ' + cc);
            params.should.eql({
                query: city,
                c: cc
            });
        });
    });

    describe('with city, province, country', function() {
        it('should return query string and country code', function() {
            var city = 'London';
            var params = acClient.buildQueryParams(city + ', Ontario, Canada');
            params.should.eql({
                query: city,
                c: 'CA'
            });
        });
    });

    describe('with city, province, country code', function() {
        it('should return query string and country code', function() {
            var city = 'London',
                cc = 'CA';
            var params = acClient.buildQueryParams(city + ', Ontario, ' + cc);
            params.should.eql({
                query: city,
                c: cc
            });
        });
    });

    describe('with city, country, postal code', function() {
        it('should return query string and country code', function() {
            var city = 'London';
            var params = acClient.buildQueryParams(city + ', Canada, K1A 0A9');
            params.should.eql({
                query: city,
                c: 'CA'
            });
        });
    });

    describe('with city, country code, postal code', function() {
        it('should return query string and country code', function() {
            var city = 'London',
                cc = 'CA';
            var params = acClient.buildQueryParams(city + ', ' + cc + ', K1A 0A9');
            params.should.eql({
                query: city,
                c: cc
            });
        });
    });

    describe('with city; country; state', function() {
        it('should return query string and country code', function() {
            var city = 'London';
            var params = acClient.buildQueryParams(city + '; England; United Kingdom');
            params.should.eql({
                query: city,
                c: 'GB'
            });
        });
    });

});

/* global describe, it */
describe('WndrgrndAutoCompleteClient.parseQueryResponse', function() {

    describe('empty results', function() {
        it('should return an empty array', function() {
            var apiRes = JSON.stringify({ RESULTS: [] });
            var results = acClient.parseQueryResponse(apiRes);
            results.should.eql([]);
        });
    });

    describe('result of one city', function() {
        it('should return an array containing one element', function() {
            var apiRes = JSON.stringify({ RESULTS: [{
                'name': 'Paris, France',
                'type': 'city',
                'c': 'FR',
                'zmw': '00000.98.07150',
                'tz': 'Europe/Paris',
                'tzs': 'CET',
                'l': '/q/zmw:00000.98.07150'
            }] });
            var results = acClient.parseQueryResponse(apiRes);
            results.should.eql([{
                city: 'Paris, France',
                timezone: 'Europe/Paris',
                tz: 'CET',
                path: '/q/zmw:00000.98.07150'
            }]);
        });
    });

    describe('results of cities mixed with non-cities', function() {
        it('should return an array of cities only', function() {
            var apiRes = JSON.stringify({ RESULTS: [
                {
                    'name': 'Hong Kong S.A.R, China',
                    'type': 'city',
                    'c': 'CN',
                    'zmw': '00000.7.45007',
                    'tz': 'Asia/Hong_Kong',
                    'tzs': 'HKT',
                    'l': '/q/zmw:00000.7.45007'
                },{
                    'name': 'Hong Kong, China',
                    'type': 'city',
                    'c': 'CN',
                    'zmw': '00000.1.45007',
                    'tz': 'Asia/Hong_Kong',
                    'tzs': 'HKT',
                    'l': '/q/zmw:00000.1.45007'
                },{
                    'name': 'Hong Kong Disneyland Resort, China',
                    'type': 'city',
                    'c': 'CH',
                    'zmw': '00000.1.45038',
                    'tz': 'CN1',
                    'l': '/q/locid:CHXX0523'
                }
            ] });
            var results = acClient.parseQueryResponse(apiRes);
            results.should.eql([
                {
                    city: 'Hong Kong S.A.R, China',
                    timezone: 'Asia/Hong_Kong',
                    tz: 'HKT',
                    path: '/q/zmw:00000.7.45007'
                },{
                    city: 'Hong Kong, China',
                    timezone: 'Asia/Hong_Kong',
                    tz: 'HKT',
                    path: '/q/zmw:00000.1.45007'
                }
            ]);
        });
    });

    describe('results with more cities than max', function() {
        it('should return an array with max elements', function() {
            var apiRes = JSON.stringify({ RESULTS: [
                {
                    'name': 'New Zealand',
                    'type': 'country',
                    'c': 'NZ',
                    'zmw': '000NZ.1.99999',
                    'tz': 'MISSING',
                    'tzs': 'MISSING',
                    'l': '/global/NZ.html'
                },{
                    'name': 'New York City, New York',
                    'type': 'city',
                    'c': 'US',
                    'zmw': '10001.5.99999',
                    'tz': 'America/New_York',
                    'tzs': 'EST',
                    'l': '/q/zmw:10001.5.99999'
                },{
                    'name': 'New Orleans, Louisiana',
                    'type': 'city',
                    'c': 'US',
                    'zmw': '70112.1.99999',
                    'tz': 'America/Chicago',
                    'tzs': 'CST',
                    'l': '/q/zmw:70112.1.99999'
                },{
                    'name': 'New Delhi, India',
                    'type': 'city',
                    'c': 'IN',
                    'zmw': '00000.1.42181',
                    'tz': 'Asia/Kolkata',
                    'tzs': 'IST',
                    'l': '/q/zmw:00000.1.42181'
                },{
                    'name': 'Newark, New Jersey',
                    'type': 'city',
                    'c': 'US',
                    'zmw': '07101.1.99999',
                    'tz': 'America/New_York',
                    'tzs': 'EST',
                    'l': '/q/zmw:07101.1.99999'
                }
            ] });
            var results = acClient.parseQueryResponse(apiRes, 3);
            results.should.eql([
                {
                    city: 'New York City, New York',
                    timezone: 'America/New_York',
                    tz: 'EST',
                    path: '/q/zmw:10001.5.99999'
                },{
                    city: 'New Orleans, Louisiana',
                    timezone: 'America/Chicago',
                    tz: 'CST',
                    path: '/q/zmw:70112.1.99999'
                },{
                    city: 'New Delhi, India',
                    timezone: 'Asia/Kolkata',
                    tz: 'IST',
                    path: '/q/zmw:00000.1.42181'
                }
            ]);
        });
    });

    describe('results missing RESULTS key', function() {
        it('should throw an error', function() {
            var apiRes = JSON.stringify({ foo: 'bar' });
            var func = function() {
                acClient.parseQueryResponse(apiRes);
            };
            func.should.throw(/^Malformed results \(key missing\)/);
        });
    });

    describe('results string is not JSON', function() {
        it('should throw an error', function() {
            var apiRes = 'Not JSON';
            var func = function() {
                acClient.parseQueryResponse(apiRes);
            };
            func.should.throw(/^Malformed results \(not JSON\)/);
        });
    });

});

/* global describe, before, it */
describe('WndrgrndAutoCompleteClient.queryCities', function() {
    var apiEndpoint = 'http://autocomplete.wunderground.com',
        apiResource = '/aq?query=Paris&c=',
        queryString = 'Paris';

    describe('200 response from API with cities', function() {
        var apiMock;

        before(function() {
            apiMock = nock(apiEndpoint)
                .get(apiResource)
                .reply(200, { RESULTS: [
                    {
                        'name': 'New York City, New York',
                        'type': 'city',
                        'c': 'US',
                        'zmw': '10001.5.99999',
                        'tz': 'America/New_York',
                        'tzs': 'EST',
                        'l': '/q/zmw:10001.5.99999'
                    },{
                        'name': 'New Orleans, Louisiana',
                        'type': 'city',
                        'c': 'US',
                        'zmw': '70112.1.99999',
                        'tz': 'America/Chicago',
                        'tzs': 'CST',
                        'l': '/q/zmw:70112.1.99999'
                    },{
                        'name': 'Newark, New Jersey',
                        'type': 'city',
                        'c': 'US',
                        'zmw': '07101.1.99999',
                        'tz': 'America/New_York',
                        'tzs': 'EST',
                        'l': '/q/zmw:07101.1.99999'
                    }
                ] });
        });

        it('should resolve promise with cities', function(done) {
            acClient.queryCities(queryString)
                .then(function(results) {
                    results.should.eql([
                        {
                            city: 'New York City, New York',
                            timezone: 'America/New_York',
                            tz: 'EST',
                            path: '/q/zmw:10001.5.99999'
                        },{
                            city: 'New Orleans, Louisiana',
                            timezone: 'America/Chicago',
                            tz: 'CST',
                            path: '/q/zmw:70112.1.99999'
                        },{
                            city: 'Newark, New Jersey',
                            timezone: 'America/New_York',
                            tz: 'EST',
                            path: '/q/zmw:07101.1.99999'
                        }
                    ]);
                    apiMock.done();
                    done();
                })
                .fail(function() {
                    true.should.equal(false);
                });
        });
    });

    describe('200 response from API but with malformed JSON', function() {
        var apiMock;

        before(function() {
            apiMock = nock(apiEndpoint)
                .get(apiResource)
                .reply(200, 'Not JSON results');
        });

        it('should resolve promise with cities', function(done) {
            acClient.queryCities(queryString)
                .then(function() {
                    true.should.equal(false);
                })
                .fail(function(e) {
                    e.message.should.equal('Could not parse response from querying ' + apiEndpoint + apiResource);
                    apiMock.done();
                    done();
                });
        });
    });

    describe('500 response from API', function() {
        var apiMock;

        before(function() {
            apiMock = nock(apiEndpoint)
                .get(apiResource)
                .reply(500, '');
        });

        it('should resolve promise with cities', function(done) {
            acClient.queryCities(queryString)
                .then(function() {
                    true.should.equal(false);
                })
                .fail(function(e) {
                    e.message.should.equal('Unsuccessful status code returned (500) when querying ' + apiEndpoint +
                        apiResource);
                    apiMock.done();
                    done();
                });
        });
    });

});