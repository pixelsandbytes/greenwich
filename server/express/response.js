'use strict';

var dust = require('./dust');
var m = {};

function setHeaders (res, headers) {
    if (!headers) {
        return;
    }
    for (var name in headers) {
        if (headers.hasOwnProperty(name)) {
            res.setHeader(name, headers[name]);
        }
    }
}

function dustErrorHandler(err, res) {
    // TODO
    console.error(err.stack);
    m.sendRawHTML(res, 'Something went wrong...', 500);
}

m.sendJSON = function sendJSON(res, obj, status, headers) {
    var respString = JSON.stringify(obj);
    headers = headers || {};
    headers['Content-Type'] = 'application/json';
    headers['Content-Length'] = respString.length;
    setHeaders(res, headers);
    status = status || 200;
    res.send(status, respString);
};

m.sendDust = function sendDust(res, tplName, context, status, headers) {
    dust.render(tplName, context, function(err, out) {
        if (err) {
            dustErrorHandler(err);
        } else {
            m.sendRawHTML(res, out, status, headers);
        }
    });
};

m.sendRawHTML = function sendRawHTML(res, htmlString, status, headers) {
    headers = headers || {};
    headers['Content-Type'] = 'text/html; charset=utf-8';
    headers['Content-Length'] = htmlString.length;
    setHeaders(res, headers);
    status = status || 200;
    res.send(status, htmlString);
};

m.sendRawDust = function sendRawDust(res, tplSrc, context, status, headers) {
    dust.renderSource(tplSrc, context, function(err, out) {
        if (err) {
            dustErrorHandler(err, res);
        } else {
            m.sendRawHTML(res, out, status, headers);
        }
    });
};

module.exports = m;