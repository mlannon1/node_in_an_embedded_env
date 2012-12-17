'use strict';

var jade = require('jade'),
    util = require('util'),
    _ = require('lodash');

module.exports.decorator = function (app) {

  return {
    setup: function (server, client) {

      var load = server.load = module.exports.load = function (_model, options, cb) {
        if (typeof options === 'function') {
          cb = options;
          options = null;
        }
        console.log('loading ' + _model + ' with options ' + util.inspect(options));
        model.data(_model, options, cb);
      };

      server.media = module.exports.media = function () {
        var vars = Array.prototype.slice.call(arguments);
        media.apply(media, vars);
      }

      var render = server.render = module.exports.render = function (view, data, loadOptions, cb) {
        if (typeof data === 'function') {
          cb = data;
          data = null;
          loadOptions = null;
        }
        if (typeof loadOptions === 'function') {
          cb = loadOptions;
          loadOptions = null;
        }
        var options = { };
        function render (data) {
          _.merge(options, data);
          var file = __dirname + '/../views/' + view + '.jade';
          jade.renderFile(file, options, function (err, str) {
            if (err) return cb(err);
            cb(null, str, data);
          });
        }

        load(view, loadOptions, function (err, serverData){
          if (err) return cb(err);
          data = data || {};
          _.merge(data, serverData);
          render(data);
        });
      };

      var state = server.state = module.exports.state = function (name) {
        client.state(name);
      };

      var view = server.view = module.exports.view = function (view) {
        console.log('server view(' + view + ')');
        render(view, function (str) {
          client.view(str);
        })
      };
    }
  }
};
