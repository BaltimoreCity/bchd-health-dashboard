'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Cause of death Schema
 */
var CauseOfDeathSchema = new Schema({
  cause: {
    type: String,
    default: '',
    required: 'Please fill cause of death',
    trim: true
  }
});

mongoose.model('CauseOfDeath', CauseOfDeathSchema);
