var events = require('events'),
    UDevEmitter = require('./udev'),
    util = require('util'),
    Watcher = require('./watcher');

function KokoKeyManager (options) {
  options = options || {};
  this.addRegex = /devices.*pci.*usb.*block.*sd[a-z]\d+/;
  this.expressions = [];
  this.mountLocation = options.mountLocation || '/koko/key/Koko';
  this.removeRegex = /devices.*pci.*usb.*block.*sd[a-z]\d+/;
  this.udevemitter = new UDevEmitter();
  this.watcher = new Watcher();
  events.EventEmitter.call(this);
}

util.inherits(KokoKeyManager, events.EventEmitter);

KokoKeyManager.prototype.start = function () {
  var self = this;

  this.udevemitter.on('data', function (data) {
    if (data.bus === 'KERNEL' && data.action === 'add' && data.device.match(self.addRegex)) {
      self.emit('kokoKeyInserted', data);
    } else if (data.bus === 'KERNEL' && data.action === 'remove' && data.device.match(self.removeRegex)) {
      self.emit('kokoKeyRemoved', data);
    }
  });

  this.udevemitter.on('error', function (error) {
    self.emit('error', error);
  });

  this.udevemitter.listen();

  this.watcher.on('changed', function (stats) {
    if (stats.curr.dev === 0) {
      self.emit('kokoKeyUnmounted', stats);
    } else {
      self.emit('kokoKeyMounted', stats);
    }
  });

  this.watcher.watch(this.mountLocation);
}

module.exports = KokoKeyManager;
