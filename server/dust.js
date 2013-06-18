'use strict';

var dust = require('dustjs-linkedin'),
    fs = require('fs'),
    path = require('path');

dust.onLoad = function(name, callback) {
    var tplPath = path.join(path.resolve(__dirname, '..', 'templates'), name + '.dust');
    fs.readFile(tplPath, 'utf8', callback);
};

module.exports = dust;