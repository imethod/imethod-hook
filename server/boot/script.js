'use strict';
var tools = require('../../tools');
var async = require('async');
module.exports = function (app) {

  let init = function () {

  };
  if (process.env.NODE_ENV != 'production') {
    async.mapSeries(app.models(), function (Model, cbx) {
      let dataSource = Model.dataSource;
      if (!dataSource || dataSource.name == 'Memory') {
        return cbx();
      }
      dataSource.autoupdate(Model.modelName)
        .then(function (result) {
          cbx(null);
        })
        .catch(function (err) {
          cbx(err);
        });
    }, function (err, res) {
      if (!err) {
        return init();
      }
    });
  }
};
