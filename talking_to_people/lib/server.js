'use strict';

var dnode = require('dnode'),
    events = require('events'),
    shoe = require('shoe'),
    util = require('util');

function Server (endpoint) {
  this.endpoint = endpoint;
  this.middleware = [];
  events.EventEmitter.call(this);
}

util.inherits(Server, events.EventEmitter);

Server.prototype.decorate = function (context, client) {
  this.middleware.forEach(function (middleware) {
    middleware.setup(context, client);
  });
}

Server.prototype.listen = function (server, cb) {
  var self = this;
  var sock = shoe(function (stream) {
    var d = dnode(function (client, conn) {
      self.decorate(this, client);
      if (cb) cb(null, client);
      self.emit('connected', client);
    });
    d.pipe(stream).pipe(d);
    d.on('end', function () {
      console.error('dnode end');
      self.middleware.forEach(function (middleware) {
        if (middleware.teardown) middleware.teardown();
      });
      //window.handleError(err);
    });
    d.on('fail', function () {
      console.error('dnode fail');
      //window.handleError(err);
    });
    d.on('error', function (err) {
      console.log('dnode error');
      console.error(err);
      throw err;
    });
  });
  sock.install(server, this.endpoint);
}

Server.prototype.use = function (fn) {
  this.middleware.push(fn)
}

module.exports = Server;
