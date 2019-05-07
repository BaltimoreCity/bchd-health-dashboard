// Cause of deaths service used to communicate Cause of deaths REST endpoints
(function () {
  'use strict';

  angular
    .module('cause-of-deaths')
    .factory('CausesOfDeathService', CausesOfDeathService);

  CausesOfDeathService.$inject = ['$resource'];

  function CausesOfDeathService($resource) {
    return $resource('api/causes-of-death/:causeOfDeathId', {
      causeOfDeathId: '@_id'
    }, {
      update: {
        method: 'PUT'
      },
      query: {
        method: 'GET',
        params: {
          searchString: '@searchString'
        },
        isArray: true
      }
    });
  }
}());
