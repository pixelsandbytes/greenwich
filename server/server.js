'use strict';

var cluster = require('cluster'),
    createApp = require('./app.js');
var MAX_WORKERS = require('os').cpus().length;

function attachHandlers(worker) {
    worker.on('online', function onWorkerOnline() {
        console.log('Worker ' + worker.process.pid + ' is online');
    });
}

function createWorker() {
    var worker = cluster.fork();
    attachHandlers(worker);
}

if (cluster.isMaster) {
    cluster.on('exit', function onClusterExit(worker, code, signal) {
        var exitCode = worker.process.exitCode;
        console.log('Worker ' + worker.process.pid + ' died (exit code: ' + exitCode + ')' +
            (signal ? ' due to signal ' + signal : ''));
    });
    cluster.on('disconnect', function onClusterDisconnect(worker) {
        console.log('Worker ' + worker.process.pid + ' disconnected. Starting another worker...');
        createWorker();
    });

    for (var i = 0 ; i < MAX_WORKERS; i++) {
        createWorker();
    }
} else {
    createApp();
}