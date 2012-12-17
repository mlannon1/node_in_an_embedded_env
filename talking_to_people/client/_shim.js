'use strict';

var client = require('./client');

client.on('ready', function () {

});

window.handleError = function (err) {
  if (err.message) console.error(err.message);
  if (err.path) console.error(err.path);
  if (err.stack) console.error(err.stack);
  if (err.code) console.error(err.code);
}
