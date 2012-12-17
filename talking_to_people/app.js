'use strict';

var express = require('express')
  , http = require('http')
  , path = require('path')
  , Server = require('./lib/server')
  , serverApi = require('./lib/serverApi')
  , util = require('util');

var app = express();

app.configure(function() {
  app.set('port', process.env.PORT || 8080);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(app.router);
});

app.configure('development', function () {
  app.use(express.errorHandler());
});

/* open http server */
var server = http.createServer(app);

server.listen(app.get('port'), function () {
  console.log("Express server listening on port " + app.get('port'));
});

/* create dnode event server for push communication to client */
var eventServer = new Server('/dnode');

eventServer.use(serverApi.decorator(app));

eventServer.listen(server, function (err, client) {
  if (err) throw err;
  console.log('client connected');
});

require('./lib/routes')(app);
