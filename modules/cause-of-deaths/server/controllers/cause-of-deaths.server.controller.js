'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  CauseOfDeath = mongoose.model('CauseOfDeath'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Cause of death
 */
exports.create = function(req, res) {
  var causeOfDeath = new CauseOfDeath(req.body);

  causeOfDeath.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(causeOfDeath);
    }
  });
};

/**
 * Show the current Cause of death
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var causeOfDeath = req.causeOfDeath ? req.causeOfDeath.toJSON() : {};

  res.jsonp(causeOfDeath);
};

/**
 * Update a Cause of death
 */
exports.update = function(req, res) {
  var causeOfDeath = req.causeOfDeath;

  causeOfDeath = _.extend(causeOfDeath, req.body);

  causeOfDeath.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(causeOfDeath);
    }
  });
};

/**
 * Delete an Cause of death
 */
exports.delete = function(req, res) {
  var causeOfDeath = req.causeOfDeath;

  causeOfDeath.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(causeOfDeath);
    }
  });
};

/**
 * List of Cause of deaths
 */
exports.list = function(req, res) {
  var query;
  var searchRe;
  if (req.query.searchString) {
    try {
      searchRe = new RegExp(req.query.searchString, 'i');
    } catch (e) {
      return res.status(400).send({
        message: 'Search string is invalid'
      });
    }
    query = CauseOfDeath.find({ 'cause': searchRe });
  } else {
    query = CauseOfDeath.find();
  }
  query.sort('cause').exec(function(err, causesOfDeath) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(causesOfDeath);
    }
  });
};

/**
 * Cause of death middleware
 */
exports.causeOfDeathByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Cause of death is invalid'
    });
  }

  CauseOfDeath.findById(id).exec(function (err, causeOfDeath) {
    if (err) {
      return next(err);
    } else if (!causeOfDeath) {
      return res.status(404).send({
        message: 'No Cause of death with that identifier has been found'
      });
    }
    req.causeOfDeath = causeOfDeath;
    next();
  });
};
