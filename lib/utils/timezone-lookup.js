var acClient = require('./../clients/wunderground-autocomplete'),
    q = require('q');

var lruOptions = {
    max: 100,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    length: function(v) {
        return v.length;
    }
};

var citiesTZCache;

function TimezoneLookup(lru) {
    lru = lru || require('lru-cache');
    citiesTZCache = lru(lruOptions);
}

TimezoneLookup.prototype = {

    /**
     * queryByCity: lookup the given city and return an array of results
     *
     * @param city: city to look up
     * @param options: {
     *      exact: only return a result that's an exact match to city
     *      max: maximum number of results to return
     * }
     * @return promise that is resolved with an array of result objects: {
     *      city: name of the city, country (e.g. London, United Kingdom)
     *      timezone: timezone that the city is in (e.g. Europe/London)
     *      tz: short version of the timezone (e.g. BST)
     *      path: path for querying other Wunderground APIs with this city
     * }
     */
    queryByCity: function(city, options) {
        options = options || {};
        if (options.exact) {
            var data = citiesTZCache.get(city);
            if (data) {
                return q([ data ]);
            }
        }

        var deferred = q.defer();
        acClient.queryCities(city, { max: options.max })
            .then(function(results) {
                // Check if there is an exact match, if so cache it
                var exactResult;
                for (var i = 0; i < results.length; i++) {
                    if (results[i].city === city) {
                        exactResult = results[i];
                        break;
                    }
                }
                if (exactResult) {
                    citiesTZCache.set(city, exactResult);
                }

                if (options.exact) {
                    if (exactResult) {
                        deferred.resolve([ exactResult ]);
                    } else {
                        deferred.resolve([]);
                    }
                } else {
                    deferred.resolve(results);
                }
            })
            .fail(function (e) {
                deferred.reject(e);
            });

        return deferred.promise;
    }

};

module.exports = TimezoneLookup;