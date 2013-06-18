/* jshint strict: false */
var h2o = require('h2o'),
    app = require('./app.js'),
    logger = require('./../node_modules/h2o/lib/impl/logger-console.js'),
    responder = require('./responder-dust.js');

h2o()
    .setAppDefiner(app)
    .setLogger(logger)
    .setResponseSender(responder)
    .run();