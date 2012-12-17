'use strict';

module.exports = function (app) {

  /* load our application's single page app */
  app.get('*', function (req, res) {
    res.render('index', {
      title: 'Koko Fit Club'
    });
  });

}
