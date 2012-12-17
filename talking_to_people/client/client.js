'use strict';

var events = require('events'),
    server = require('./server'),
    util = require('util');

function Client() {
  this.eventListeners = [];
  this.funcPointers = [];
  this.currentState = null;
  this.ready = false;
  events.EventEmitter.call(this);
}

util.inherits(Client, events.EventEmitter);

Client.prototype.clearEventListeners = function () {
  var self = this;
  this.eventListeners.forEach(function (listener) {
    self.removeListener(listener.event, listener.fn);
  });
}

Client.prototype.clearTimeline = function () {
  console.log('clearing timeline');
  this.funcPointers.forEach(function (funcPointer) {
    var func = funcPointer.method === 'setInterval' ? clearInterval : clearTimeout;
    func.call(global.window, funcPointer.pointer);
  });
  this.funcPointers = [];
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

  if (this.currentState && this.currentState.timeline) {
    this.clearTimeline();
  }
  if (this.currentState && this.currentState.teardown) {
    this.currentState.teardown();
  }

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

    var timelineFn, url;

    self.view(str);

    if (nextState.setup) {
      nextState.setup(data);
    }

    self.currentState = nextState;
    self.currentState.name = name;

    self.emit('stateChanged', self.currentState);

    if (!nextState.timeline) {
      timelineFn = function (callback) { callback(null, []); }; // noop if state has no timeline
    } else if (typeof nextState.timeline !== 'function') {
      timelineFn = function (callback) { callback(null, nextState.timeline); } // callback with timeline if provided as an object
    } else {
      timelineFn = nextState.timeline;
    }

    timelineFn.call(nextState, function (err, timeline) {

      if (timeline) {
        self.timeline(timeline, nextState);
      }

      if (cb) {
        // allow for 0 time timeline events to trigger before calling back
        setTimeout(function () {
          cb(null, self.currentState);
        }, 1);
      }

    });
  });
}

Client.prototype.timeline = function (timeline, context) {
  if (typeof timeline === 'function') {
    timeline = timeline();
  }
  console.log('creating timeline on ');
  var self = this;
  timeline.forEach(function (point) {
    if (null === point.action || undefined === point.action) throw new Error('no action defined on timeline item. items must define actions to be applied on their corresponding context / view');
    if (isNaN(point.time)) throw new Error('no time defined on timeline item. items must define a time at which to be applied on their corresponding context / view');
    var setIntervalOrTimeout = point.repeat ? setInterval : setTimeout;
    var method = point.repeat ? 'setInterval' : 'setTimeout';
    var func = (function (){
      var params = point.params;
      return function () {
        context[point.action].apply(context, params);
      }
    })();
    var seconds = point.time * 1000;
    var funcPointer = setIntervalOrTimeout.call(global.window, func, seconds);
    self.funcPointers.push({ method: method, pointer: funcPointer });
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
