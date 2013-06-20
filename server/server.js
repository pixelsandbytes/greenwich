/* jshint strict: false */
var h2o = require('h2o'),
    app = require('./app'),
    responder = require('./responder-dust'),
    logger = h2o.utils['logger-console'],
    errorHandler = h2o.utils['error-with-xhr'](responder, logger);

h2o()
    .setAppDefiner(app)
    .setLogger(logger)
    .setErrorHandler(errorHandler)
    .run();