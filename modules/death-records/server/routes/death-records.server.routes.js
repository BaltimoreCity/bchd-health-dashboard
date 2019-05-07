'use strict';

/**
 * Module dependencies
 */
var deathRecordsPolicy = require('../policies/death-records.server.policy'),
  deathRecords = require('../controllers/death-records.server.controller');

module.exports = function(app) {
  app.route('/api/census-tracts').all(deathRecordsPolicy.isAllowed)
    .get(deathRecords.listCensusTracts);

  app.route('/api/death-records/compare').all(deathRecordsPolicy.isAllowed)
    .get(deathRecords.compare);

  // Death records Routes
  app.route('/api/death-records').all(deathRecordsPolicy.isAllowed)
    .get(deathRecords.aggregate)
    .post(deathRecords.create);

  app.route('/api/death-records/:deathRecordId').all(deathRecordsPolicy.isAllowed)
    .get(deathRecords.read)
    .put(deathRecords.update)
    .delete(deathRecords.delete);

  // Finish by binding the Death record middleware
  app.param('deathRecordId', deathRecords.deathRecordByID);
};
