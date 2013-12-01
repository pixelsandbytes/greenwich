require('should');
var timeHelper = require('./../../lib/utils/time-helper'),
    fs = require('fs'),
    path = require('path'),
    readline = require('readline');

/* See https://github.com/mde/timezone-js/issues/88 */
var unsupportedFromTimeZones = [
    'Europe/Chisinau',
    'Europe/Kaliningrad',
    'Europe/Kiev',
    'Europe/Minsk',
    'Europe/Moscow',
    'Europe/Riga',
    'Europe/Simferopol',
    'Europe/Tallinn',
    'Europe/Uzhgorod',
    'Europe/Vilnius',
    'Europe/Zaporozhye'
];

/* global describe, it */
describe('TimeHelper.translate', function() {

    describe('between same timezones', function() {
        it('should return the same date/time string', function() {
            var dateTime = '1969-07-21T02:56',
                tz = 'Europe/London';
            var translatedDateTime = timeHelper.translate(tz, tz, dateTime);
            translatedDateTime.should.equal(dateTime);
        });
    });

    describe('to a timezone in the east', function() {
        it('should return a later date/time string', function() {
            var fromTZ = 'America/Los_Angeles',
                toTZ = 'Europe/London',
                fromTime = '2008-04-01T18:37';
            var toTime = timeHelper.translate(fromTZ, toTZ, fromTime);
            toTime.should.equal('2008-04-02T02:37');
        });
    });

    describe('to a timezone in the west', function() {
        it('should return an earlier date/time string', function() {
            var fromTZ = 'Europe/London',
                toTZ = 'America/Los_Angeles',
                fromTime = '2004-07-04T05:38';
            var toTime = timeHelper.translate(fromTZ, toTZ, fromTime);
            toTime.should.equal('2004-07-03T21:38');
        });
    });

    describe('between timezones offset by a non-whole number of hours', function() {
        it('should return a date/time string with different minutes', function() {
            var fromTZ = 'America/Los_Angeles',
                toTZ = 'Canada/Newfoundland',
                fromTime = '2013-11-28T20:11';
            var toTime = timeHelper.translate(fromTZ, toTZ, fromTime);
            toTime.should.equal('2013-11-29T00:41');
        });
    });

    describe('from a time not in DST to timezone not in DST', function() {
        it('should return a date/time string with the regular amount of offset', function() {
            var fromTZ = 'America/Los_Angeles',
                toTZ = 'Europe/London',
                fromTime = '2013-01-27T00:00';
            var toTime = timeHelper.translate(fromTZ, toTZ, fromTime);
            toTime.should.equal('2013-01-27T08:00');
        });
    });

    describe('from a time in DST to timezone in DST', function() {
        it('should return a date/time string with the regular amount of offset', function() {
            var fromTZ = 'America/Los_Angeles',
                toTZ = 'Europe/London',
                fromTime = '2013-06-15T00:00';
            var toTime = timeHelper.translate(fromTZ, toTZ, fromTime);
            toTime.should.equal('2013-06-15T08:00');
        });
    });

    describe('from a time in DST to timezone not in DST', function() {
        it('should return a date/time string with a shorter amount of offset', function() {
            var fromTZ = 'America/Los_Angeles',
                toTZ = 'Europe/London',
                fromTime = '2013-03-11T00:00';
            var toTime = timeHelper.translate(fromTZ, toTZ, fromTime);
            toTime.should.equal('2013-03-11T07:00');
        });
    });

    describe('from an invalid timezone', function() {
        it('should throw an error stating that the timezone is invalid', function() {
            var fromTZ = 'Not/Time_Zone',
                toTZ = 'America/Los_Angeles',
                fromTime = '1969-07-21T02:56';

            var func = function() {
                timeHelper.translate(fromTZ, toTZ, fromTime);
            };
            func.should.throw(fromTZ + ' is not a valid timezone');
        });
    });

    describe('to an invalid timezone', function() {
        it('should throw an error stating that the timezone is invalid', function() {
            var fromTZ = 'America/Los_Angeles',
                toTZ = 'Not/Time_Zone',
                fromTime = '1969-07-21T02:56';

            var func = function() {
                timeHelper.translate(fromTZ, toTZ, fromTime);
            };
            func.should.throw(toTZ + ' is not a valid timezone');
        });
    });

    describe('from an badly formatted date/time string', function() {
        it('should throw an error stating that date/time is invalid', function() {
            var fromTZ = 'America/Los_Angeles',
                toTZ = 'Europe/London',
                fromTime = '1969/07/21T02:56';

            var func = function() {
                timeHelper.translate(fromTZ, toTZ, fromTime);
            };
            func.should.throw(fromTime + ' is not a valid date/time');
        });
    });

    describe('from an invalid date/time string', function() {
        it('should throw an error stating that date/time is invalid', function() {
            var fromTZ = 'America/Los_Angeles',
                toTZ = 'Europe/London',
                fromTime = '1969-13-01T00:00';

            var func = function() {
                timeHelper.translate(fromTZ, toTZ, fromTime);
            };
            func.should.throw(fromTime + ' is not a valid date/time');
        });
    });

    describe('specific timezone', function() {
        var tzData = readline.createInterface({
            input: fs.createReadStream(path.resolve(__dirname, '../../resources/geonames/timeZones.txt'),
                { encoding: 'utf8' }),
            output: process.stdout,
            terminal: false
        });


        var dateTime = '1969-07-21T02:56';
        tzData.on('line', function(line) {
            var tz = line.split('\t')[1].trim();
            var isUnsupportedForTranslatingFrom = unsupportedFromTimeZones.indexOf(tz) > -1;

            describe(tz, function() {
                it((isUnsupportedForTranslatingFrom ? 'cannot' : 'can') + ' be translated from', function() {
                    var func = function() {
                        timeHelper.translate(tz, 'America/Los_Angeles', dateTime);
                    };
                    if (isUnsupportedForTranslatingFrom) {
                        func.should.throw();
                    } else {
                        func.should.not.throw();
                    }
                });
                it('can be translated to', function() {
                    var func = function() {
                        timeHelper.translate('America/Los_Angeles', tz, dateTime);
                    };
                    func.should.not.throw();
                });
            });
        });
    });

});