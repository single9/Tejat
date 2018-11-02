/**
 * Module dependencies.
 * @ignore
 */

const utils = require('./utils.js');
const formatResult = utils.formatResult;
const db = utils.db;
const mongoose = utils.mongoose;
const log = utils.log;
const Schema = mongoose.Schema;

/**
 * Framework
 * 
 * @class Framework
 */
class Framework {

  /**
   * Creates an instance of Framework.
   * @param {Object} obj 
   * @param {Object} obj.schemas
   * @param {Object} [obj.methods]
   * @param {Object} [obj.routes]
   * @param {array}  [obj.beforeRoutes] {fnName: string}
   * @param {array}  [obj.afterRoutes]
   * 
   * @memberOf Framework
   */
  constructor(obj) {
    if (!(this instanceof Framework)) return new Framework(obj);
    // If you want to override the method or create the new one.
    if (typeof obj.methods !== 'undefined') {
      Object.keys(obj.methods).forEach((val) => {
        if (typeof this[val] === 'undefined') {
          this[val] = obj.methods[val];
        }
        else if (typeof obj.methods[val] === 'function') {
          log.warn('Overriding existing function:', val);
          this[val] = obj.methods[val];
        }
      });
    }

    this.logger = log;
    this.beforeRoutes = obj.beforeRoutes;
    this.afterRoutes = obj.afterRoutes;
    this.router = require('express').Router();
    this.formatResult = utils.formatResult;
    this.schemas = obj.schemas;
    this.routers = obj.routes;

    db.connect();
  }

  /**
   * find
   * 
   * @param {Express.Request} req
   * @param {Express.Response} res
   * @returns 
   * 
   * @memberOf Framework
   */
  find(req, res) {
    let query = req.query;
    let limit = parseInt(query.limit) || 100;
    let schema = req.query.schema || req.params.schema;
    let model = this.getModel(schema, res);

    if (!model) return;
    
    query.limit = null;

    model.find(query).limit(limit).exec((err, result) => {
      if (err) {
        if(typeof(res) === 'object') res.json(formatResult(false, err));
        log.error(err);
        return;
      }

      if (typeof(res) === 'object') {
        res.json(formatResult(true, result));
      } else if (typeof(res) === 'function'){
        res(result);
      }
    });
  }

  /**
   * insert
   * 
   * @param {Express.Request} req
   * @param {Express.Response} res
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
        if(typeof(res) === 'object') res.json(formatResult(status, err));
        log.error(err);
        return;
      }

      if (typeof(res) === 'object') {
        res.json(formatResult(status, store));
      } else if (typeof(res) === 'function'){
        res(undefined, store);
      }
    });
  }

  /**
   * update
   * 
   * @param {Express.Request} req
   * @param {Express.Response} res
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
    else if (values === undefined && res) return res.json(formatResult(false, 'No values.'));

    model.update({_id: id}, {$set: values}, function (err, result) {
      if (err) {
        if (typeof (res) === 'object') {
          res.json(formatResult(false, err));
        } else if (typeof (res) === 'function') {
          res(err, result);
        }

        log.error(err);
        return;
      }

      if (typeof (res) === 'object') {
        res.json(formatResult(true, result));
      } else if (typeof (res) === 'function') {
        res(undefined, result);
      }
    });
  }

  updateOne (req, res) {
    let id = req.body.id;
    let schema = req.body.schema;
    let values = req.body.values;
    let model = this.getModel(schema, res);

    if (!model) return;
    else if (values === undefined && res) return res.json(formatResult(false, 'No values.'));

    model.findOneAndUpdate({_id: id}, {$set: values}, function (err, result) {
      if (err) {
        if (typeof (res) === 'object') {
          res.json(formatResult(false, err));
        } else if (typeof (res) === 'function') {
          res(err, result);
        }

        log.error(err);
        return;
      }

      if (typeof (res) === 'object') {
        res.json(formatResult(true, result));
      } else if (typeof (res) === 'function') {
        res(undefined, result);
      }
    });
  }

  /**
   * delete
   * 
   * @param {Express.Request} req
   * @param {Express.Response} res
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
        return log.error(err);
      }

      res.json(formatResult(true, result));
    });
  }

  /**
   * drop
   * 
   * @param {Express.Request} req
   * @param {Express.Response} res
   * 
   * @memberOf Framework
   */
  drop(req, res) {
    let schema = req.body.schema + 's';

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
   * @param {Express.Response} res  from express.js
   * @returns mongoose.model
   * @memberOf Framework
   */
  getModel(name, res) {

    if (typeof this.schemas[name] === 'undefined') {
      try {
        if (res) res.json(formatResult(false, 'Cannot find the schema.'));
        log.error('Cannot find the schema.', name);
      } catch (err) {}
      return false;
    }

    return mongoose.model(name, this.schemas[name]);
  }

  success(res, msg, next) {
    res.locals.message = msg;
    next();
  }

  /**
   * Routers setter
   */
  set routers(routes) {
    if (this.beforeRoutes) {
      let beforeRoutes = this.beforeRoutes;

      if (!Array.isArray(beforeRoutes)) {
        throw new Error('beforeRoutes must be an Array');
      }

      beforeRoutes.forEach((val) => {
        let fnName = val.fnName;
        let fn = this[fnName];

        if (typeof(fn) === 'function') {
          fn = fn.bind(this);
        }

        if (val.path === undefined) {
          this.router.use(fn);
        } else {
          this.router.use((val.path).toString(), fn);
        }
  
      }, this);
    }

    if (typeof routes === 'undefined') {
      return;
    }

    let routesKey = Object.keys(routes);
    for (let index in routesKey) {
      let key = routesKey[index];
      // ignore key: default
      if (index === 'default') return;
      
      /** @type Array */
      let route = routes[key];
      
      if (!Array.isArray(route)) {
        throw new Error('routes must be an Array');
      }

      for (let index in route) {
        let elem = route[index];
        let method = elem.method;
        let fnName = elem.fnName;
        let fn = this[fnName];

        if (typeof(fn) === 'function') {
          fn = fn.bind(this);
        }

        this.router[method](key.toString(), fn);
      }
    }

    // Create default APIs.
    if (routes.default !== false) {
      this.router.get('/:schema', this.find.bind(this))
        .post('/', this.insert.bind(this))
        .put('/', this.update.bind(this))
        .delete('/drop', this.drop.bind(this))
        .delete('/', this.delete.bind(this));
    }

    if (this.afterRoutes) {
      let afterRoutes = this.afterRoutes;

      if (!Array.isArray(afterRoutes)) {
        throw new Error('afterRoutes must be an Array');
      }

      afterRoutes.forEach((val) => {
        let fnName = val.fnName;
        let fn = this[fnName];

        if (typeof(fn) === 'function') {
          fn = fn.bind(this);
        }

        if (val.path === undefined) {
          this.router.use(fn);
        } else {
          this.router.use((val.path).toString(), fn);
        }
  
      }, this);
    }
  }

  /**
   * Routers getter
   */
  get routers() {
    return this.router;
  }

  /**
   * Schemas setter
   */
  set schemas(schemas) {

    Object.keys(schemas).forEach((val)=>{
      if (typeof this._schemas === 'undefined') {
        this._schemas = {};  
      }
      this._schemas[val] = new Schema(schemas[val]);
    }, this);
  }

  /**
   * Schemas getter
   */
  get schemas() {
    return this._schemas;
  }

}

module.exports = Framework;
