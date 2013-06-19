/* jshint strict: false */
var q = require('q'),
    dust = require('./dust');
var r = {};

function stripNullUndefined(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key) && (undefined === obj[key] || null === obj[key])) {
            delete obj[key];
        }
    }
}

function applyOverrides(base, overrides) {
    if (overrides) {
        for (var key in overrides) {
            if (overrides.hasOwnProperty(key)) {
                base[key] = overrides[key];
            }
        }
    }
    return base;
}

function normalizeHeaders(headers, mandatoryHeaders) {
    headers = headers || {};
    var defaultMandatoryHeaders = {
        'Content-Type': 'text/html; charset=utf-8'
    };
    applyOverrides(headers, applyOverrides(defaultMandatoryHeaders, mandatoryHeaders));
    return headers;
}

function setHeaders(res, headers) {
    if (!headers) {
        return;
    }
    for (var name in headers) {
        if (headers.hasOwnProperty(name)) {
            res.setHeader(name, headers[name]);
        }
    }
}

function normalizeAndSendDustHeaders(res, status, headers) {
    headers = normalizeHeaders(headers);
    setHeaders(res, headers);
    status = status || 200;
    res.writeHead(status);
}

function attachDustListeners(streamResp, res, status, headers, delayResolve) {
    var deferred = q.defer(),
        resolveTimer;

    streamResp
        .on('data', function onDustData(data) {
            if (!data) {
                return;
            }
            if (!res.headersSent) {
                normalizeAndSendDustHeaders(res, status, headers);
            }
            res.write(data);
        })
        .on('end', function onDustStreamEnd() {
            if (!res.headersSent) {
                normalizeAndSendDustHeaders(res, status, headers);
            }
            res.end();
            resolveTimer = setTimeout(function() {
                deferred.resolve();
            }, (delayResolve ? 500 : 0));
            resolveTimer.unref();
        })
        .on('error', function onDustStreamError(err) {
            deferred.reject(new Error(err));
        });

    return deferred.promise;
}

function promiseFilter(promise, returnPromise) {
    if (!returnPromise) {
        promise.fail(function (reason) {
            throw reason;
        })
        .done();
    } else {
        return promise;
    }
}

r.sendJSON = function sendJSON(res, obj, status, headers) {
    stripNullUndefined(obj);
    var respString = JSON.stringify(obj);
    headers = normalizeHeaders(headers, {
        'Content-Type': 'application/json',
        'Content-Length': respString.length
    });
    setHeaders(res, headers);
    status = status || 200;
    res.send(status, respString);
    res.end();
};

r.sendPage = function sendPage(res, htmlString, status, headers) {
    headers = normalizeHeaders(headers, {
        'Content-Length': htmlString.length
    });
    setHeaders(res, headers);
    status = status || 200;
    res.send(status, htmlString);
    res.end();
};

r.sendDust = function sendDust(res, tplName, context, status, headers, returnPromise) {
    var promise = attachDustListeners(dust.stream(tplName, context), res, status, headers, returnPromise);
    return promiseFilter(promise, returnPromise);
};

r.sendRawDust = function sendRawDust(res, tplSrc, context, status, headers, returnPromise) {
    var promise = attachDustListeners(dust.renderSource(tplSrc, context), res, status, headers, returnPromise);
    return promiseFilter(promise, returnPromise);
};

r.sendErrorJSON = function sendErrorJSON(res, err, status) {
    this.sendJSON(res, {
        type: 'error',
        message: err.message
    }, status);
};

r.sendErrorPage = function sendErrorPage(res, err, status) {
    var errMessage = err.message || 'Something went wrong...';
    return this.sendRawDust(res, '{>html_shim/}{<body}' + errMessage + '{/body}', {title: errMessage},
        status, undefined, true);
};

module.exports = r;