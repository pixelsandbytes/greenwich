var fs = require('fs'),
    log = require('logger').makeInst(),
    moment = require('moment-timezone'),
    path = require('path'),
    tzJS = require('timezone-js');

var dateFormat = 'YYYY-MM-DDTHH:mm';

function TimeHelper() {
    tzJS.timezone.transport = function (opts) {
        // No success handler, what's the point?
        if (opts.async) {
            if (typeof opts.success !== 'function') {
                return;
            }
            opts.error = opts.error || console.error;
            return fs.readFile(opts.url, 'utf8', function (err, data) {
                return err ? opts.error(err) : opts.success(data);
            });
        }
        return fs.readFileSync(opts.url, 'utf8');
    };
    tzJS.timezone.zoneFileBasePath = path.resolve(__dirname, '../../resources/tz');
    tzJS.timezone.defaultZoneFile = ['africa', 'antarctica', 'asia', 'australasia', 'backward', 'etcetera', 'europe',
        'northamerica', 'pacificnew', 'southamerica'];
    tzJS.timezone.init({ async: false });
}

TimeHelper.prototype = {

    /**
     * translate: translate the given time (and timezone) to the local time in the given timezone
     *
     * @param fromTZ: timezone to translate from (e.g. America/Los_Angeles)
     * @param toTZ: timezone to translate to (e.g. Europe/London)
     * @param fromLocalTime: local date/time string to translate from (e.g. 2013-02-08T09:30)
     * @return local date/time string in 'to' timezone (e.g. 2013-02-08T17:30)
     */
    translate: function(fromTZ, toTZ, fromLocalTime) {
        var fromLocalMoment = moment(fromLocalTime, dateFormat, true).local();

        if (!fromLocalMoment.isValid()) {
            throw new Error(fromLocalTime + ' is not a valid date/time');
        }

        var fromLocalTZDate;
        try {
            fromLocalTZDate = new tzJS.Date(fromLocalMoment.year(), fromLocalMoment.month(), fromLocalMoment.date(),
                    fromLocalMoment.hour(), fromLocalMoment.minute(), fromTZ);
            fromLocalTZDate.getTimezoneInfo(); // throws error if timezone is invalid
        } catch (e) {
            throw new Error(fromTZ + ' is not a valid timezone', e);
        }

        var toLocalMoment;
        try {
            toLocalMoment = moment(fromLocalTZDate.valueOf()).tz(toTZ);
        } catch (e) {
            throw new Error(toTZ + ' is not a valid timezone', e);
        }
        
        var toLocalTime = toLocalMoment.format(dateFormat);
        log.info(fromLocalTime + ' in ' + fromTZ + ' => ' + toLocalTime + ' in ' + toTZ);
        return toLocalTime;
    }

};


module.exports = new TimeHelper();