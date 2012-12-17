'use strict';

/*
  The simple code below allows us to wrap a quick adapter around the
  server object passed to us from dnode. This allows us to easily
  require it in any other file where we wish to use it and get
  the object, adorned with methods which we can call against the
  server.
*/

module.exports = {
  wrap: function (server, cb) {
    this.__proto__ = server;
    if (cb) cb();
  }
};
