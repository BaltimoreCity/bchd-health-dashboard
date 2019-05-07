'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memeory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Geo records permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/geo/census-tracts/features',
      permissions: ['get']
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/geo/census-tracts/features',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/geo/census-tracts/features',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Geo records Policy allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Death record is being processed and the current user created it then allow any manipulation
  if (req.deathRecord && req.user && req.deathRecord.user && req.deathRecord.user.id === req.user.id) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
