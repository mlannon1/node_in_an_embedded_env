'use strict';

var jade = require('jade'),
    util = require('util'),
    _ = require('lodash');

module.exports.decorator = function (app) {

  return {
    setup: function (server, client) {

      server.cycle = function (cb) {
        var text = [
          'This text',
          'is being pushed',
          'from the server',
          'this is an event!',
          'this is a CRAZY event!',
          'humans! bow before me!',
          'computers have feelings, too. :(',
          'I love 011011001010110101101110!',
          '<img src="http://images.sugarscape.com/userfiles/image/DECEMBER2012/lizzie/monkey-ikea-coat.jpg" />'
        ];
        var index = 0;
        setInterval(function () {
          cb(null, text[index]);
          index++
          if (index > 8) index = 0;
        }, 2000);
      }

    }
  }
};
