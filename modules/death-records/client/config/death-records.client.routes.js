(function () {
  'use strict';

  angular
    .module('death-records')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('death-records', {
        abstract: true,
        url: '/death-records',
        template: '<ui-view/>'
      })
      .state('death-records.list', {
        url: '',
        templateUrl: 'modules/death-records/client/views/list-death-records.client.view.html',
        controller: 'DeathRecordsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Death records List'
        }
      })
      .state('death-records.create', {
        url: '/create',
        templateUrl: 'modules/death-records/client/views/form-death-record.client.view.html',
        controller: 'DeathRecordsController',
        controllerAs: 'vm',
        resolve: {
          deathRecordResolve: newDeathRecord
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Death records Create'
        }
      })
      .state('death-records.edit', {
        url: '/:deathRecordId/edit',
        templateUrl: 'modules/death-records/client/views/form-death-record.client.view.html',
        controller: 'DeathRecordsController',
        controllerAs: 'vm',
        resolve: {
          deathRecordResolve: getDeathRecord
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Death record {{ death-recordResolve.name }}'
        }
      })
      .state('death-records.view', {
        url: '/:deathRecordId',
        templateUrl: 'modules/death-records/client/views/view-death-record.client.view.html',
        controller: 'DeathRecordsController',
        controllerAs: 'vm',
        resolve: {
          deathRecordResolve: getDeathRecord
        },
        data: {
          pageTitle: 'Death record {{ death-recordResolve.name }}'
        }
      });
  }

  getDeathRecord.$inject = ['$stateParams', 'DeathRecordsService'];

  function getDeathRecord($stateParams, DeathRecordsService) {
    return DeathRecordsService.get({
      deathRecordId: $stateParams.deathRecordId
    }).$promise;
  }

  newDeathRecord.$inject = ['DeathRecordsService'];

  function newDeathRecord(DeathRecordsService) {
    return new DeathRecordsService();
  }
}());
