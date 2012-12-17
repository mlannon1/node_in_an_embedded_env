'use strict';
var cp = require('child_process'),
    events = require('events'),
    fs = require('fs'),
    parser = require('./serialParser'),
    SerialPort = require('serialport').SerialPort,
    util = require('util');

function SerialPlayer () {
  this.virtualDevice = '/tmp/echo';
  events.EventEmitter.call(this);
}

util.inherits(SerialPlayer, events.EventEmitter);

var cdata = '', bufferIndex = 0, dataLength = 0,
    readStream = null, writeStream = null;

function chunkify (emitter) {
  if (cdata[bufferIndex + dataLength] !== 0xF2) {
    for (dataLength = 0; bufferIndex + dataLength < cdata.length - 1; dataLength++) {
      if (cdata[bufferIndex + dataLength] === 0xF2) break;
    }
  }
  if (cdata.length === bufferIndex) {
    emitter.emit('end');
    emitter.emit('done');
    return;
  }
  var chunk = new Buffer(dataLength + 1);
  cdata.copy(chunk, 0, bufferIndex, bufferIndex + dataLength + 1)
  bufferIndex = bufferIndex + dataLength + 1;
  process.nextTick(function () {
    writeStream.write(chunk);
  });
}

SerialPlayer.prototype.continue = function () {
  chunkify(this);
}

SerialPlayer.prototype.playback = function (workoutFile, virtualDevice, unlink) {
  var self = this;

  this.virtualDevice = virtualDevice || self.virtualDevice;

  function pumpWorkoutFileToVirtualDevice () {
    var serialPort = new SerialPort(self.virtualDevice, {
        parser: parser
    });
    serialPort.on('data', function (data) {
      self.emit('data', data);
    });
    writeStream = fs.createWriteStream(self.virtualDevice)
    fs.readFile(workoutFile, function (err, data) {
      if (err) throw err;
      else {
        cdata = data;
        chunkify(self);
      }
    });
  }

  function createFifo() {
    cp.exec('mkfifo ' + self.virtualDevice, function (err, stdout, stderr) {
      if (err) throw err;
      pumpWorkoutFileToVirtualDevice();
    });
  }

  if (! fs.existsSync(self.virtualDevice)) {
    createFifo();
  } else {
    if (unlink) {
      fs.unlink(self.virtualDevice, function (err) {
        if (err) throw err;
        createFifo();
      });
    }
    else {
      pumpWorkoutFileToVirtualDevice();
    }
  }
}

module.exports = new SerialPlayer();
