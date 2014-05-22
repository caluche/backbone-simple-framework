
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var swig = require('swig');


var app = express();

app.set('env', 'dev');
// all environments
app.set('port', process.env.PORT || 3000);

// view engine config
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));


app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());

    // no cache for dev
    app.set('view cache', false);
    swig.setDefaults({ cache: false });
}

app.get('/', routes.index);
app.get('/dynamic-assets/:id', routes.dynamicAsset);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
