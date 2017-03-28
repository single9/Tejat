/**
 * Module dependencies.
 * @ignore
 */

const utils = require("./utils");
const formatResult = utils.formatResult;
const mongoose = utils.mongoose;
const debug = utils.debug;
const Schema = mongoose.Schema;

/**
 * Framework for gt-mongo.
 * 
 * @class Framework
 */
class Framework {

  /**
   * Creates an instance of Framework.
   * @param {any} obj 
   * 
   * @memberOf Framework
   */
  constructor(obj) {
    if (!(this instanceof Framework)) return new Framework(obj);
    // If you want to override the method or create the new one.
    if (typeof obj.methods !== "undefined") {
      Object.keys(obj.methods).forEach((val) => {
        if (typeof this[val] === "undefined") {
          this[val] = obj.methods[val];
        }
        else if (typeof obj.methods[val] === "function") {
          this[val] = obj.methods[val];
        }
      });
    }

    this.router = require("express").Router();
    this.formatResult = utils.formatResult;
    this.schemas = obj.schemas;
    this.routers = obj.routes;
  }

  /**
   * find
   * 
   * @param {any} req 
   * @param {any} res 
   * @returns 
   * 
   * @memberOf Framework
   */
  find(req, res) {
    let query = req.query;
    let limit = parseInt(query.limit) || 100;
    let schema = req.params.schema;
    let model = this.getModel(schema, res);

    if (!model) return;
    
    query.limit = null;

    model.find(query).limit(limit).exec((err, result) => {
      if (err) {
        res.json(formatResult(false, err));
        return;
      }

      res.json(formatResult(true, result));
    });
  }

  /**
   * insert
   * 
   * @param {any} req 
   * @param {any} res 
   * @returns 
   * 
   * @memberOf Framework
   */
  insert(req, res) {
    let status = true;
    let body = req.body;
    let values = body.values;
    let schema = body.schema;

    let model = this.getModel(schema, res);
    if (!model) return;
    
    let store = new model(values);

    store.save((err, store) => {
      if (err) {
        status = false;
        res.json(formatResult(status, err));
        return;
      }

      res.json(formatResult(status, store));

    });
  }

  /**
   * update
   * 
   * @param {any} req 
   * @param {any} res 
   * @returns 
   * 
   * @memberOf Framework
   */
  update(req, res) {
    let id = req.body.id;
    let schema = req.body.schema;
    let values = req.body.values;
    let model = this.getModel(schema, res);

    if (!model) return;
    else if (values === undefined) return res.json(formatResult(false, "No values."));

    model.update({_id: id}, {$set: values}, function (err, result) {
      if (err) {
        return res.json(formatResult(false, err));
      }

      res.json(formatResult(true, result));
    });
  }

  /**
   * delete
   * 
   * @param {any} req 
   * @param {any} res 
   * @returns 
   * 
   * @memberOf Framework
   */
  delete(req, res) {
    let schema = req.body.schema;
    let id = req.body.id;

    let model = this.getModel(schema, res);
    if (!model) return;

    model.remove({_id: id }, function (err, result) {
      if (err) {
        res.json(formatResult(false, err));
        return debug(err);
      }

      res.json(formatResult(true, result));
    });
  }

  /**
   * drop
   * 
   * @param {any} req 
   * @param {any} res 
   * 
   * @memberOf Framework
   */
  drop(req, res) {
    let schema = req.body.schema + "s";

    mongoose.connection.db.dropCollection(schema, function(err, result) {
      if (err) {
        res.json(formatResult(false, err));
        return;
      }
      res.json(formatResult(true, result));
    });
  }

  /**
   * Initialize model from schema.
   * 
   * @param {String} name Schame name
   * @param {Object} res  from express.js
   * @returns mongoose.model
   * @memberOf Framework
   */
  getModel(name, res) {

    if (typeof this.schemas[name] === "undefined") {
      if (res) res.json(formatResult(false, "Cannot find the schema."));
      return false;
    }

    return mongoose.model(name, this.schemas[name]);
  }

  /**
   * Routers setter
   * 
   */
  set routers(routes) {

    if (typeof routes === "undefined") {
      return;
    }

    Object.keys(routes).forEach((val) => {
      let route = routes[val];
      let method = route[0].toLowerCase();
      let fnName = route[1];

      this.router[method](val.toString(), this[fnName].bind(this));

    }, this);

    // Create default APIs.
    this.router.get("/:schema", this.find.bind(this))
      .post("/", this.insert.bind(this))
      .put("/", this.update.bind(this))
      .delete("/drop", this.drop.bind(this))
      .delete("/", this.delete.bind(this));
  }

  /**
   * Routers getter
   * 
   */
  get routers() {
    return this.router;
  }

  /**
   * Schemas setter
   * 
   * 
   * @memberOf Framework
   */
  set schemas(schemas) {

    Object.keys(schemas).forEach((val)=>{
      if (typeof this._schemas === "undefined") {
        this._schemas = {};  
      }
      this._schemas[val] = new Schema(schemas[val]);
    }, this);
  }

  /**
   * Schemas getter
   * 
   * 
   * @memberOf Framework
   */
  get schemas() {
    return this._schemas;
  }

}

/**
 * Module exports.
 */

module.exports = Framework;