'use strict';

var events = require('events'),
    server = require('./server'),
    util = require('util');

function Client() {
  this.eventListeners = [];
  events.EventEmitter.call(this);
}

util.inherits(Client, events.EventEmitter);

Client.prototype.clearEventListeners = function () {
  var self = this;
  this.eventListeners.forEach(function (listener) {
    self.removeListener(listener.event, listener.fn);
  });
}

Client.prototype.on = function (event, fn, options) {
  options = options || {};
  if (options.clearOnTeardown) {
    this.eventListeners.push({ event: event, fn: fn });
  }
  Client.super_.prototype.on.call(this, event, fn);
}

Client.prototype.state = function (name, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }
  options = options || {};

  var loadOptions;

  console.log('transitioning to ' + name);

  this.clearEventListeners();


  if (name === null) {
    this.currentState = null;
    if (cb) cb();
    return;
  }

  var nextState = require('./' + name), self = this;

  if (nextState.loadOptions && typeof nextState.loadOptions == 'function') {
    loadOptions = nextState.loadOptions();
  }

  server.render(name, options, loadOptions, function (err, str, data) {

    if (err) throw err;

    var url;

    self.view(str);

    if (nextState.setup) {
      nextState.setup(data);
    }

    self.currentState = nextState;
    self.currentState.name = name;

    self.emit('stateChanged', self.currentState);

    timelineFn.call(nextState, function (err, timeline) {

      if (cb) {
        // allow for 0 time timeline events to trigger before calling back
        setTimeout(function () {
          cb(null, self.currentState);
        }, 1);
      }

    });
  });
}

Client.prototype.view = function (str) {
  console.log('client view: ' + str)
  var view = $(str);
  // TODO: figure out how to abstract out the $() usage. since
  // view is called by dnode, the context is dnode. thus,
  // 'this' won't give us our Client.
  $('#arbiter-container').html(view);
}

module.exports = new Client();
