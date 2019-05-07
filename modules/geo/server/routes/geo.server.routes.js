'use strict';

/**
 * Module dependencies
 */
var geoPolicy = require('../policies/geo.server.policy'),
  geo = require('../controllers/geo.server.controller');

module.exports = function(app) {
  app.route('/api/geo/census-tracts/features').all(geoPolicy.isAllowed)
    .get(geo.censusTractFeatures);
};
