'use strict';

var express = require('express'),
    appframe = require('./express/appframe.js'),
    responseUtils = require('./express/response-utils.js');

function createApp() {
    var app = express(),
        port = 80;

    appframe.first(app, responseUtils);

    app.use('/echo', function appEcho(req, res) {

        var body = {
            xhr: req.xhr
        };
        responseUtils.sendJSON(res, body);
    });

    app.use('/bad', function appBad() {
        throw new Error('Oops');
    });

    app.use('/dust', function appDust(req, res) {
        responseUtils.sendRawDust(res, '{>html_shim/}{<body}Fascist. {hag}{/body}', {
            title: 'Dust',
            hag: function(chunk) {
                return chunk.map(function(chunk) {
                    setTimeout(function() {
                        chunk.end('Hag. ');
                    }, 2000);
                });
            }
        });
    });

    app.use('/dusty', function appDusty(req, res) {
        responseUtils.sendRawDust(res, '{>html_shimy/}{<body}Hello world{/body}', {title: 'Dusty'});
    });

    app.use('/unfinished', function appUnfinished(req, res) {
        responseUtils.sendRawDust(res, '{>html_shim/}{<body}Hockey on NBC. {fail}{/body}', {
            title: 'Unfinished',
            fail: function(chunk) {
                return chunk.map(function() {
                    setTimeout(function() {
                        throw new Error('No overtime for you!');
                    }, 2000);
                });
            }
        });
    });

    app.use('/', express.static(__dirname + '/../web'));

    appframe.last(app);

    appframe.start(app, port);
}

module.exports = createApp;