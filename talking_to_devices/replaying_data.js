'use strict';

var serialPlayer = require('./lib/serialPlayer.js'),
    fs = require('fs');

serialPlayer.on('data', function (data) {
  setTimeout(function () {
    console.log('data: ' + data.toString());
    serialPlayer.continue();
  }, 10);
});

serialPlayer.on('error', function (err) {
  console.log('err: ' + err);
});

serialPlayer.playback(__dirname + '/test.dat');
