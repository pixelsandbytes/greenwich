'use strict';

var express = require('express'),
    appframe = require('./express/appframe.js'),
    response = require('./express/response.js');

function create() {
    var app = express(),
        port = 80;

    appframe.first(app);

    app.use('/echo', function appEcho(req, res) {

        var body = {
            xhr: req.xhr
        };
        response.sendJSON(res, body);
    });

    app.use('/bad', function appBad() {
        throw new Error('Oops');
    });

    app.use('/dusty', function appDusty(req, res) {
        response.sendRawDust(res, '{>html_shimy/}{<body}Hello world{/body}', {title: 'Dusty'});
    });

    app.use('/', express.static(__dirname + '/../web'));

    appframe.last(app);

    appframe.start(app, port);
}

module.exports = create;