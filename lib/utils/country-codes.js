var fs = require('fs'),
    path = require('path'),
    readline = require('readline');

var cc;

function CountryCodes() {
    cc = {};

    var ccFile = readline.createInterface({
        input: fs.createReadStream(path.resolve(__dirname, '../../resources/geonames/countryInfo.txt'),
            { encoding: 'utf8' }),
        output: process.stdout,
        terminal: false
    });

    ccFile.on('line', function(line) {
        line = line.trim();
        // Ignore empty lines and comments
        if (0 === line.length || '#' == line.charAt(0)) {
            return;
        }
        var parts = line.split('\t');
        if (parts.length >= 5) {
            var code = parts[0].trim();
            var country = parts[4].trim();
            cc[country] = code;
        }
    });
}

CountryCodes.prototype = {

    getCode: function (country) {
        return cc[country];
    }

};

module.exports = new CountryCodes();