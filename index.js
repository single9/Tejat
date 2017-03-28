/**
 * Module dependencies.
 * @ignore
 */

const fs = require("fs");
const express = require ("express");
const bodyParser = require("body-parser");
const debug = require("./libs/utils").debug;
const app = module.exports = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// 讀取 modules 資料夾中的模組
var modulesPath = __dirname + "/modules/";
var modules = fs.readdirSync(modulesPath);
// 記錄所有被讀入的模組資料
var routers = {};

// 將模組加入到 Express Router 的 middleware
modules.forEach(function(element) {
  let moduleName = element.split(".")[0];
  routers[moduleName] = require(modulesPath + element);
  app.use("/" + moduleName, routers[moduleName].routers);
}, this);

debug("Modules: " + Object.keys(routers));

if (!module.parent) {
  app.listen(3000);
}