var events = require('events'),
    fs = require('fs'),
    util = require('util');

function Watcher() {
  events.EventEmitter.call(this);
}

util.inherits(Watcher, events.EventEmitter);

Watcher.prototype.watch = function watch (target) {
  var self = this;
  fs.watchFile(target, function (curr, prev) {
    self.emit('changed', { curr: curr, prev: prev });
  });
};

module.exports = Watcher;
