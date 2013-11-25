/* jshint strict: false */
var h2o = require('h2o'),
    app = require('./app'),
    responder = require('./responder-dust'),
    Logger = require('logger'),
    logger = Logger.makeInst(),
    errorHandler = h2o.utils['error-with-xhr'](responder, logger);

h2o()
    .setAppDefiner(app)
    .setLogger(logger)
    .setErrorHandler(errorHandler)
    .run();