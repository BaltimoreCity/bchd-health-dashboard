// Death records service used to communicate Death records REST endpoints
(function () {
  'use strict';

  angular
    .module('death-records')
    .factory('DeathRecordsService', DeathRecordsService);

  DeathRecordsService.$inject = ['$resource'];

  function DeathRecordsService($resource) {
    return $resource('api/death-records/:deathRecordId', {
      deathRecordId: '@_id'
    }, {
      update: {
        method: 'PUT'
      },
      query: {
        method: 'GET',
        params: {
          mannerOfDeath: '@mannerOfDeath',
          causeOfDeath: '@causeOfDeath',
          female: '@female',
          male: '@male',
          twentyAndFewer: '@twentyAndFewer',
          twentyOneToForty: '@twentyOneToForty',
          fortyOneToSixty: '@fortyOneToSixty',
          sixtyOneToEighty: '@sixtyOneToEighty',
          eightyOneAndGreater: '@eightyOneAndGreater',
          africanAmerican: '@africanAmerican',
          white: '@white',
          asian: '@asian',
          other: '@other'
        },
        isArray: false
      }
    });
  }

  angular
    .module('death-records')
    .factory('DeathRecordsCompareService', DeathRecordsCompareService);

  DeathRecordsCompareService.$inject = ['$resource'];

  function DeathRecordsCompareService($resource) {
    return $resource('api/death-records/compare', {}, {
      query: {
        method: 'GET',
        params: {
          mannerOfDeath: '@mannerOfDeath',
          causeOfDeath: '@causeOfDeath',
          female: '@female',
          male: '@male',
          twentyAndFewer: '@twentyAndFewer',
          twentyOneToForty: '@twentyOneToForty',
          fortyOneToSixty: '@fortyOneToSixty',
          sixtyOneToEighty: '@sixtyOneToEighty',
          eightyOneAndGreater: '@eightyOneAndGreater',
          africanAmerican: '@africanAmerican',
          white: '@white',
          asian: '@asian',
          other: '@other'
        },
        isArray: false
      }
    });
  }
}());
