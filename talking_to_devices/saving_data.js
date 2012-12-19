'use strict';

/*
 * This is a sample of how we record serial data at Koko for future playback.
 * Some of it is application-specific. The important parts are the simple logic
 * added to the parser assignment for the instance of SerialPort and the
 * proxySerialToFile function which actually saves our serial data.
 */

var misc = require('misc'), //
    fs = require('fs'),
    serialPlayer = require('serialPlayer'),
    SerialPort = require('serialport'),
    SerialParser = require('misc/lib/serial-parser'); //

var proxyfile = __dirname + '/' + process.env.RECORDING;
var replayFile = (process.env.REPLAY) ? __dirname + '/../' + process.env.REPLAY : null;

/*
 * Our proxySerialToFile function allows us to write all incoming serial
 * data to a file, and then pass it along to the application's normal
 * parser to run the application as normal. This allows us to do a workout
 * and have the data from the workout recorded. We can later replay this
 * data as if we're connected to the treadmill, or another device.
 */

function proxySerialToFile (parser) {
  var file = fs.createWriteStream(proxyfile, {
    "flags": "a"
  });
  process.on('exit', function () {
    file.end();
  });
  return function (emitter, data) {
    file.write(data);
    // call target parser when done
    parser(emitter, data);
  }
}

module.exports.createDevice = function () {

  var tty = (process.env.NODE_ENV ===  'development')
            ? serialPlayer.virtualDevice
            : '/dev/ttyUSB0';

  /* Mostly standard usage of SerialPort below (https://github.com/voodootikigod/node-serialport)
   * we supply it a device location to listen to our serial device
   * and a custom parser to convert incoming serial data to something
   * we can use in our application.
   *
   * The relevant part here, for playback and recording, is our command line
   * option to proxy serial data to a file.
   */

  var parser = new SerialParser.SerialParser();
  var serialPort = new SerialPort.SerialPort(tty, {
    parser: function() {
      if (process.env.RECORDING) {
        console.log('logging all ' + tty + ' output to file ' + proxyfile);
        return proxySerialToFile(parser.create());
      }
      return parser.create();
    }()
  });

  return new misc.Device(serialPort); // return our new device
}
