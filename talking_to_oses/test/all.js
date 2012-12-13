var UDevEmitter = require('../lib/udev'), 
    udev = new UDevEmitter(),
    util = require('util');

var timeone, timetwo;

udev.on('data', function (data) {
  console.log(util.inspect(data));
});

udev.listen();

var Watcher = require('../lib/watcher');
var watcher = new Watcher();

watcher.on('changed', function (stats) {
  timetwo = process.hrtime();
  console.log('watcher ' + timetwo + ' ' + util.inspect(stats));
});

watcher.watch('/dev/sdb');
