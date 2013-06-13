var express = require('express'),
    response = require('./express/response.js');
var app = express(),
    port = 80;

app.get('/echo', function(req, res) {
    'use strict';

    var body = {
        xhr: req.xhr
    };
    response.sendJSON(res, body);
});

app.get('/bad', function() {
    'use strict';

    throw new Error('Oops');
});

app.get('/dusty', function(req, res) {
    'use strict';

    response.sendRawDust(res, '{>html_shimy/}{<body}Hello world{/body}', {title: 'Dusty'});
});

app.use('/', express.static(__dirname + '/../web'));


function logErrors(err, req, res, next) {
    'use strict';

    console.error(err.stack);
    next(err);
}

function errorHandler(err, req, res, next) {
    /* jshint unused: false */
    'use strict';

    if (req.xhr) {
        response.sendJSON(res, {msg: 'Something went wrong'}, 500);
    } else {
        response.sendRawHTML(res, '<h1>Something went wrong...</h1>', 500);
    }
}

app.use(logErrors);
app.use(errorHandler);

app.listen(port);
console.log('Listening on port ' + port);