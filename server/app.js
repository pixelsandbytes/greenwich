/* jshint strict: false */
var express = require('express'),
    responder = require('./responder-dust.js');

function defineApp(app) {

    app.use('/print', function appEcho(req, res) {

        var body = {
            xhr: req.xhr
        };
        responder.sendJSON(res, body);
    });

    app.use('/fail', function appBad() {
        throw new Error('Oops');
    });

    app.use('/dust', function appDust(req, res) {
        responder.sendRawDust(res, '{>html_shim/}{<body}Fascist. {hag}{/body}', {
            title: 'Dust',
            hag: function(chunk) {
                return chunk.map(function(chunk) {
                    setTimeout(function() {
                        chunk.end('Hag.');
                    }, 2000);
                });
            }
        });
    });

    app.use('/dust-fail', function appDusty(req, res) {
        responder.sendRawDust(res, '{>html_shimy/}{<body}Hello world{/body}', {title: 'Dusty'});
    });

    app.use('/dust-die', function appUnfinished(req, res) {
        responder.sendRawDust(res, '{>html_shim/}{<body}Hockey on NBC. {fail}{/body}', {
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

}

module.exports = defineApp;