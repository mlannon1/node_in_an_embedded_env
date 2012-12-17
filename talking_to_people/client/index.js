'use strict';

var client = require('./client'),
    domready = require('domready'),
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

  var d = dnode(clientApi), stream = shoe('/dnode');
  d.on('remote', function (srvr) {
    // here, we're calling server.wrap which will decorate our server object with the methods
    // passed to use from the dnode server. We can then call any of those methods from any
    // module on the client side.
    server.wrap(srvr, function () {
      client.ready = true;
      client.emit('ready', srvr, client);
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

  d.pipe(stream).pipe(d);

});
