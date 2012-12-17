'use strict';

var server = require('./server');

function Index() {
  $('#click_me').click(function () {
    server.cycle(function (err, response) {
      $('#text_area').html('<span>'+ (err || response) + '</span>');
    })
  });
}

module.exports = new Index();
