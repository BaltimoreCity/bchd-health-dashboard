(function () {
  'use strict';

  angular
    .module('death-records')
    .factory('CensusTractsService', CensusTractsService);

  CensusTractsService.$inject = ['$resource'];

  function CensusTractsService($resource) {
    return $resource('api/census-tracts/:censusTractId', {
    }, {
      query: {
        method: 'GET',
        isArray: true
      }
    });
  }
}());
