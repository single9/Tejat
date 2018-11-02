/**
 * Module dependencies.
 * @ignore
 */

const Framework = require("../libs/framework");

var test = new Framework({
  // Your schema
  schemas: {
    hi: {
      str: {
        type: String,
        unique: true
      },
      date: {
        type: Date,
        default: Date.now
      }
    },
    alpha: {
      username: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  },

  // Your methods
  methods: {
    getClientIP: function (req, res, next) {
      let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      this.logger.info('Your IP address is', ip);
      next();
    },
    test: function (req, res, next) {
      res.json("Hello, World!");
      next();
    },
    sayGoodBye: function (req, res, next) {
      this.logger.info('Bye~');
      next();
    },
  },

  // Before routes
  beforeRoutes: [
    {fnName: 'getClientIP'}
  ],

  // Main routes
  routes: {
    "/hello": [
      {method: 'get', fnName: 'test'},
    ]
  },

  // After routes
  afterRoutes: [
    {fnName: 'sayGoodBye'}
  ],

});

module.exports = test;