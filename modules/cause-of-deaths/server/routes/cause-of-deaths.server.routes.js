'use strict';

/**
 * Module dependencies
 */
var causeOfDeathsPolicy = require('../policies/cause-of-deaths.server.policy'),
  causeOfDeaths = require('../controllers/cause-of-deaths.server.controller');

module.exports = function(app) {
  // Cause of deaths Routes
  app.route('/api/causes-of-death').all(causeOfDeathsPolicy.isAllowed)
    .get(causeOfDeaths.list)
    .post(causeOfDeaths.create);

  app.route('/api/causes-of-death/:causeOfDeathId').all(causeOfDeathsPolicy.isAllowed)
    .get(causeOfDeaths.read)
    .put(causeOfDeaths.update)
    .delete(causeOfDeaths.delete);

  // Finish by binding the Cause of death middleware
  app.param('causeOfDeathId', causeOfDeaths.causeOfDeathByID);
};
