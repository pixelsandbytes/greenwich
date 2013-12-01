var fs = require('fs'),
    path = require('path'),
    readline = require('readline');

var codes,
    nameToCode;

function CountryCodes() {
    codes = {};
    nameToCode = {};

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
            codes[code] = true;
            nameToCode[country] = code;
        }
    });
}

CountryCodes.prototype = {

    isCode: function(code) {
        return codes[code] || false;
    },

    getCode: function (country) {
        return nameToCode[country];
    }

};

module.exports = new CountryCodes();