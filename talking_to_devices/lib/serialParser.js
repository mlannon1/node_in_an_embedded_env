var hex_print = require('hexy').hexy,
    util = require('util');

/*
 * This module defines the parser which extracts useful info from our binary device data
 */

module.exports = function (emitter, data) {
var buf = new Buffer(33);
    buf.fill(0);

var bufLength = 0,
    i;
var escapeByte = false;

function parseResponse (buffer, err) {
  if (err) return err;
  var bytes = '';
  for (var i = 0; i < buffer.length; i++) {
    bytes += ' ' + parseInt(buffer[i]);
  }
  return bytes;
}

var bufLength = 0,
    i = null,
escapeByte = false;

  for (i = 0; i < data.length; i++) {
    var byte = data[i];

    //CSafe uses byte-stuffing to escape F0, F1, F2, and F3
    //See http://www.fitlinxx.com/CSAFE/Framework.htm section 2.1.2
    if (byte === 0xF3) {
      escapeByte = true;
      continue;
    }

    if (escapeByte) {
      byte = byte + 0xF0;
      escapeByte = false;
    }

    buf[bufLength] = byte;
    bufLength++;

    if (data[i] === 0xF2) {
      if (bufLength <= buf.length) {
        var terminatedBuffer = buf.slice(0, bufLength);
        util.log("Raw Response: " + hex_print(terminatedBuffer));
        var err = null;
        var response = parseResponse(terminatedBuffer, err);
        if (err) {
          emitter.emit('error', err);
        } else {
          emitter.emit('data', response);
        }
        buf.fill(0);
        bufLength = 0;
      } else {
        emitter.emit("error", "Bufffer length exceeded the size of the buffer");
      }
    }
  }

}

