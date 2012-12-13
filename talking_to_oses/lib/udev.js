var events = require('events'),
    spawn = require('child_process').spawn,
    util = require('util');

function UDevEmitter () {
  events.EventEmitter.call(this);
}

util.inherits(UDevEmitter, events.EventEmitter);

UDevEmitter.prototype.listen = function listen() {
  var self = this,
      initialLogStatement = true,
      udevadm = spawn('/usr/bin/script', ['-fc', '/sbin/udevadm monitor', '/dev/null']);

  udevadm.stdout.setEncoding('utf8');
  udevadm.stderr.setEncoding('utf8');

  udevadm.stdout.on('data', function (data) {
    if (initialLogStatement) {
      initialLogStatement = false;
      return; //ignore first statement, which is a plain-text info log
    }
    // script doesn't always perfectly flush with every new line.
    // just in case it doesn't, let's split and send each (skipping those where the string len is 0)
    var strings = data.split(/\n/);
    strings.forEach(function(str) {
      if (str.length > 0) {
        self.emit('data', self.parseLine(str));
      }
    });
  });

  udevadm.stderr.on('data', function (data) {
    self.emit('error', data);
  });

  udevadm.on('exit', function (code) {
    self.emit('exit', code);
  });
};

UDevEmitter.prototype.parseLine = function parseLine (str) {
  var arr = str.split(/\s+/);
  if (arr[0].indexOf('UDEV') > -1) {
    return {
      bus: arr[0],
      time: arr[1].replace('[', '').replace(']', ''),
      action: arr[2],
      device: arr[3],
      device_type: arr[4].replace('(', '').replace(')', '')
    };
  } else if (arr[0].indexOf('KERNEL') > -1) {
    var token = arr[0];
    var bus = token.substr(0, token.indexOf('[')),
        time = token.substr(token.indexOf('['), token.indexOf(']') - token.indexOf('['));
    return {
      bus: bus,
      time: time.replace('[', '').replace(']', ''),
      action: arr[1],
      device: arr[2],
      next1: arr[3].replace('(', '').replace(')', '')
    };
  }
}

module.exports = UDevEmitter;
