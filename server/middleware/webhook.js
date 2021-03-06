'use strict';
var createHandler = require('github-webhook-handler');
let loopback = require('loopback');
function webHook(options) {
  var handler = createHandler({path: options.path || '/', secret: options.secret})

  handler.on('*', function (event) {
    console.log(event.event);
    console.log(event.payload.repository.name);
  });

  handler.on('error', function (err) {
    console.error('Error:', err.message)
  });

  handler.on('push', function (event) {
    console.log('Received a push event for %s to %s',
      event.payload.repository.name,
      event.payload.ref);
    let WebHookExec = loopback.getModel('WebHookExec');
    WebHookExec.push(event.payload.repository.name, event.payload.ref, event.payload.after,event, function () {

    })
  });

  handler.on('issues', function (event) {
    console.log('Received an issue event for %s action=%s: #%d %s',
      event.payload.repository.name,
      event.payload.action,
      event.payload.issue.number,
      event.payload.issue.title)
  });

  return function (req, res, next) {
    handler(req, res, function (err) {
      res.statusCode = 404;
      res.end('no such location')
    })
  }
}


module.exports = webHook;
