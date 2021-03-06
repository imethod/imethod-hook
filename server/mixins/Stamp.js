'use strict';
var tools = require('../../tools');
module.exports = function(Model, options) {
  options = tools.extend({
    creatorId: 'creatorId',
    createdAt: 'createdAt',
    updaterId: 'updaterId',
    updatedAt: 'updatedAt',
    state: 'state',
    required: false
  }, options);
  Model.settings.validateUpsert = false;
  Model.defineProperty(options.creatorId, {type: Number, required: options.required});
  Model.defineProperty(options.createdAt, {type: Date, required: options.required});
  Model.defineProperty(options.updaterId, {type: Number, required: options.required});
  Model.defineProperty(options.updatedAt, {type: Date, required: options.required});
  Model.defineProperty(options.state, {type: Number, required: options.required});
  Model.observe('before save', function(ctx, next) {
    var user = {};
    var loopbackContext = tools.loopback.getCurrentContext();
    if (loopbackContext) {
      user = loopbackContext.get('currentUser');
    }
    if (ctx.instance) {
      ctx.instance[options.createdAt] = new Date();
      if (typeof ctx.instance[options.state] == 'undefined') {
        ctx.instance[options.state] = 1;
      }
      if (user && user.userId) {
        ctx.instance[options.creatorId] = user.userId;
      }
    } else {
      ctx.data[options.updatedAt] = new Date();
      if (user && user.userId) {
        ctx.data[options.updaterId] = user.userId;
      }
    }
    return next();
  });
};
