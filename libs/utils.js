module.exports.log = require("./log-helper.js");
module.exports.db = require('./db.js');
module.exports.mongoose = require('./db.js').mongoose;

module.exports.formatResult = function (status, msg) {
  return {
    status: status,
    response: msg
  };
};