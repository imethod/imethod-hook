'use strict';
var loopback = require('loopback');
var boot = require('loopback-boot');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var token = require('./middleware/token.js');
var app = loopback();
// configure body parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser('secret'));
app.use(loopback.context({name: "hook"}));
app.use(loopback.token());
app.use(function setCurrentUser(req, res, next) {
  if (!req.accessToken) {
    return next();
  }
  app.models.AuthAccessUser.findById(req.accessToken.userId, function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(new Error('No user with this access token was found.'));
    }
    var loopbackContext = loopback.getCurrentContext();
    if (loopbackContext) {
      loopbackContext.set('currentUser', user);
    }
    next();
  });
});
app.start = function () {
  // start the web server
  return app.listen(function () {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};
// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
  if (err) throw err;
  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
