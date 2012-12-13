var KokoKeyManager = require('../lib/kokoKeyManager')
    kkm = new KokoKeyManager(),
    util = require('util');

kkm.on('kokoKeyInserted', function (data) {
  console.log('kokoKeyInserted');
});

kkm.on('kokoKeyRemoved', function (data) {
  console.log('kokoKeyRemoved');
});

kkm.on('kokoKeyMounted', function (stats) {
  console.log('kokoKeyMounted');
});

kkm.on('kokoKeyUnmounted', function (stats) {
  console.log('kokoKeyUnmounted');
});

kkm.on('error', function (error) {
  console.log('error: ' + error);
});

kkm.start();
