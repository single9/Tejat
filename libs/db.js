const log = require('./log-helper.js');
const configs = require('../config');
const mongoose = require('mongoose');

let conn = mongoose.connection;

mongoose.Promise = global.Promise;
  
conn.on('connecting', () => log.info('MongoDB', 'connecting...'));
conn.on('connected', () => log.info('MongoDB', 'connected!'));
conn.on('error', (err) => {
  log.error('MongoDB', err)
});
conn.on('disconnected', () => log.error('MongoDB', 'disconnected.'));

module.exports.mongoose = mongoose;
module.exports.connect = function (dbName) {
  let _dbName = dbName || configs.db.dbName;

  if (_dbName === undefined || _dbName === '') {
    throw new Error('dbName is undefined.');
  }

  let connect = function () {
      return mongoose.connect(
        'mongodb://' + configs.db.host + ':' + configs.db.port + '/' + _dbName, 
        {
            useMongoClient: true,
            autoReconnect: true,
            auth: configs.db.auth,
        }
      );
  };

  return connect();
};
