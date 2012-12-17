'use strict';

var domready = require('domready'),
    dnode = require('dnode'),
    server = require('./server'),
    shoe = require('shoe');

// Wiring up dnode and shoe, emitting ready when we're ready to rock
// The following code allows us to make bidirectional rpc calls between
// the client and the server

domready(function () {

  var clientApi = {
    emit: function (name, data) {
      client.emit.call(client, name, data);
    },
    view: function (str) {
      client.view.call(client, str);
    }
  };

  // below, shoe opens up a sock.js connection using the /dnode route
  var d = dnode(clientApi), stream = shoe('/dnode');

  // here, we're calling server.wrap which will decorate our server object with the methods
  // passed to us from the dnode server. We can then call any of those methods from any
  // module on the client side.
  d.on('remote', function (srvr) {
    server.wrap(srvr, function () {
    });
  });

  d.on('end', function () {
    console.error('dnode end - client disconnected');
  });

  d.on('fail', function () {
    console.error('dnode fail - client disconnected');
  });

  d.on('error', function (err) {
    window.handleError(err);
    console.log('dnode error - client disconnected');
  });

  // boilerplate dnode+shoe code required to create our client/server communication channel
  d.pipe(stream).pipe(d);

});

window.handleError = function (err) {
  if (err.message) console.error(err.message);
  if (err.path) console.error(err.path);
  if (err.stack) console.error(err.stack);
  if (err.code) console.error(err.code);
}
