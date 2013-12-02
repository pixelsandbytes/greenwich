var fs = require('fs'),
    path = require('path');

var codes,
    nameToCode;

function CountryCodes() {
    codes = {};
    nameToCode = {};

    var ccFile = fs.readFileSync(path.resolve(__dirname, '../../resources/geonames/countryInfo.txt'),
        { encoding: 'utf8' });
    var ccLines = ccFile.split('\n');
    for (var i = 0; i < ccLines.length; i++) {
        var ccLine = ccLines[i].trim();
        // Ignore empty lines and comments
        if (ccLine.length > 0 && ccLine.charAt(0) !== '#') {
            var parts = ccLine.split('\t');
            if (parts.length >= 5) {
                var code = parts[0].trim();
                var country = parts[4].trim();
                codes[code] = true;
                nameToCode[country] = code;
            }
        }
    }
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