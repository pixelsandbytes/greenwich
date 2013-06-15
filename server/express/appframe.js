'use strict';

var domain = require('domain'),
    responseUtils;
var appframe = {},
    server;

function errorHandler(err, req, res, nextNotUsed) {
    /* jshint unused: false */

    if (res.headersSent) {
        console.info('Error encountered during streaming, cannot send suitable status code or content.  ' +
            'Truncate response instead.');
        res.end();
    } else {
        if (req.xhr) {
            responseUtils.sendJSON(res, {msg: 'Something went wrong'}, 500);
        } else {
            responseUtils.sendRawHTML(res, '<h1>Something went wrong...</h1>', 500);
        }
    }
}

function first(app) {
    app.use(function appCreateDomain(req, res, next) {
        var d = domain.create();
        d.add(req);
        d.add(res);

        d.on('error', function onDomainError(err) {
            console.error('[' + process.pid + '] ' + err.stack);
            try {
                errorHandler(err, req, res);
            } catch (err2) {
                console.error('[' + process.pid + '] Failed to shut down properly! ' + err2.stack);
            } finally {
                process.exit(1);
            }
        });

        d.run(next);
    });
}

function last(app) {
    app.use(function logErrors(err, req, res, next) {
        console.error(err.stack);
        next(err);
    });
    app.use(errorHandler);
}

function start(app, port) {
    server = app.listen(port);
    console.log('Listening on port ' + port);
}

appframe.first = function(app, resUtils) {
    first(app); // Should only be called once
    responseUtils = resUtils;
    delete appframe.first;
};

appframe.last = function(app) {
    last(app); // Should only be called once
    delete appframe.last;
};

appframe.start = function(app, port) {
    start(app, port); // Should only be called once
    delete appframe.start;
};

module.exports = appframe;