var countryCodes = require('./../utils/country-codes'),
    http = require('http'),
    log = require('logger').makeInst(),
    q = require('q'),
    querystring = require('querystring');

function WndrgrndAutoCompleteClient() {
}

WndrgrndAutoCompleteClient.prototype = {

    /**
     * (private)
     * buildQueryParams: decompose query string into query parameters for Wunderground auto-complete API
     *
     * @param str: query string for a city
     * @return {
     *      query: query string
     *      c: (optional) country code
     * }
     */
    buildQueryParams: function(queryString) {
        var queryStringParts = queryString.trim().split(/,|;/),
            queryParam,
            countryCodeParam;

        if (queryStringParts.length > 0) {
            queryParam = queryStringParts[0].trim();
        } else {
            queryParam = queryString.trim();
        }

        if (queryStringParts.length > 1) {
            // Check if any of the query string parts after the first correspond to a country
            for(var i = queryStringParts.length - 1; i > 0; i--) {
                var queryPart = queryStringParts[i].trim();
                // Check if it's a country code
                if (countryCodes.isCode(queryPart)) {
                    countryCodeParam = queryPart;
                    break;
                }
                // Check if it's a country name
                var countryCode = countryCodes.getCode(queryPart);
                if (countryCode) {
                    countryCodeParam = countryCode;
                    break;
                }
            }
        }

        return {
            query: queryParam || undefined,
            c: countryCodeParam || undefined
        };
    },

    /**
     * (private)
     * parseQueryResponse: parse result string from the API into a result object
     *
     * @param resString: response from the API as a string
     * @param maxResults: (optional) maximum number of results to return
     * @return array of {
     *      city: name of the city, country (e.g. London, United Kingdom)
     *      timezone: timezone that the city is in (e.g. Europe/London)
     *      tz: short version of the timezone (e.g. BST)
     *      path: path for querying other Wunderground APIs with this city
     * }
     */
    parseQueryResponse: function(resString, maxResults) {
        var apiResults;
        try {
            apiResults = JSON.parse(resString);
            apiResults = apiResults.RESULTS;
        } catch (e) {
            throw new Error('Malformed results (not JSON): ' + resString, e);
        }
        if (undefined === apiResults) {
            throw new Error('Malformed results (key missing): ' + resString);
        }

        var results = [];
        for (var i = 0; i < apiResults.length; i++) {
            var apiRes = apiResults[i];
            if ('city' === apiRes.type && apiRes.tzs) {
                results.push({
                    city: apiRes.name,
                    timezone: apiRes.tz,
                    tz: apiRes.tzs,
                    path: apiRes.l
                });

                if (maxResults && results.length >= maxResults) {
                    break;
                }
            }
        }
        return results;
    },

    /**
     * queryCities: query Wunderground's auto-complete API with the given query string
     *
     * @param query: query string
     * @param options: {
     *      max: maximum number of results to return
     * }
     * @return promise that is resolved with an array of result objects: {
     *      city: name of the city, country (e.g. London, United Kingdom)
     *      timezone: timezone that the city is in (e.g. Europe/London)
     *      tz: short version of the timezone (e.g. BST)
     *      path: path for querying other Wunderground APIs with this city
     * }
     */
    queryCities: function(query, options) {
        var deferred = q.defer();
        options = options || {};

        var queryParams = this.buildQueryParams(query);
        var queryString = querystring.stringify(queryParams);
        var getURL = 'http://autocomplete.wunderground.com/aq?' + queryString;
        log.info('Querying cities that match [' + query + '] with ' + getURL);

        var me = this;
        http.get(getURL, function(res) {
            if (200 === res.statusCode) {
                var resString = '';
                res.setEncoding('utf8');
                res.on('data', function onDataHandlerInWndrgrndAutoCompleteClient(chunk) {
                    resString += chunk;
                });
                res.on('end', function onEndHandlerInWndrgrndAutoCompleteClient() {
                    try {
                        var results = me.parseQueryResponse(resString, options.max);
                        log.info('Found ' + results.length + ' cities that match [' + query + ']');
                        deferred.resolve(results);
                    } catch (e) {
                        deferred.reject(new Error('Could not parse response from querying ' + getURL, e));
                    }
                });
            } else {
                deferred.reject(new Error('Unsuccessful status code returned (' + res.statusCode + ') when querying ' +
                    getURL));
            }
        }).on('error', function onErrorHandlerInWndrgrndAutoCompleteClient(e) {
            deferred.reject(new Error('Error occurred when querying ' + getURL, e));
        });

        return deferred.promise;
    }

};

module.exports = new WndrgrndAutoCompleteClient();