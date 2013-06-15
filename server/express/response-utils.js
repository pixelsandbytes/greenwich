'use strict';

var dust = require('./dust');
var m = {};

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

function attachDustListeners(streamResp, res, status, headers) {
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
        })
        .on('error', function onDustStreamError(err) {
            throw new Error(err);
        });
}

m.sendJSON = function sendJSON(res, obj, status, headers) {
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

m.sendDust = function sendDust(res, tplName, context, status, headers) {
    attachDustListeners(dust.stream(tplName, context), res, status, headers);
};

m.sendRawHTML = function sendRawHTML(res, htmlString, status, headers) {
    headers = normalizeHeaders(headers, {
        'Content-Length': htmlString.length
    });
    setHeaders(res, headers);
    status = status || 200;
    res.send(status, htmlString);
    res.end();
};

m.sendRawDust = function sendRawDust(res, tplSrc, context, status, headers) {
    attachDustListeners(dust.renderSource(tplSrc, context), res, status, headers);
};

module.exports = m;