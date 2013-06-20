/* jshint strict: false */
var h2o = require('h2o'),
    app = require('./app.js'),
    logger = h2o.utils['logger-console'],
    responder = require('./responder-dust.js');

h2o()
    .setAppDefiner(app)
    .setLogger(logger)
    .setResponseSender(responder)
    .run();