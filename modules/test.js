/**
 * Module dependencies.
 * @ignore
 */

const Framework = require("../libs/framework");

var test = new Framework({
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

  methods: {
    test: function (req, res) {
      res.json("Hello, World!");
      return this;
    }
  },

  routes: {
    "/test": ["get", "test"]
  }

});

module.exports = test;