const util = require('util');
const dateFormat = require('dateformat');

let _socket = {};
let log = {};

['info', 'warn', 'error'].forEach((val) => {
  log[val] = function (...content) {
    let str = util.format.apply(null, content);
    let record_time = dateFormat(Date.now(), 'yyyy-mm-dd HH:MM:ss.l', true);
    str = '[' + record_time + '] ' + '[' + val + '] ' + str;
    console[val](str);
  };
});

module.exports = log;
module.exports.setSocketList = function (socket) {
  if (typeof (_socket) === 'object') {
    _socket = socket;
  }
};
