const config = require("../config.json");
const mongoose = module.exports.mongoose = require("mongoose");
const debug = module.exports.debug = require("./debug");

// MongoDB connection
mongoose.Promise = global.Promise;
mongoose.connect(config.db.url);

var db = module.exports.db = mongoose.connection;

// Connect to MongoDB
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  debug("MongoDB Connected.");
});

module.exports.formatResult = function (status, msg) {
  return {
    status: status,
    response: msg
  };
};