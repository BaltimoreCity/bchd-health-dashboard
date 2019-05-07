'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  config = require('../../../../config/config'),
  Schema = mongoose.Schema;

/**
 * Geocoded Address Schema
 */
var AddressSchema = new Schema({
  addr: {
    required: true,
    type: String
  },
  geocodeResponse: {
    required: false,
    type: Object
  },
  matchType: {
    required: false,
    type: String
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  }
});

mongoose.model('Address', AddressSchema);
