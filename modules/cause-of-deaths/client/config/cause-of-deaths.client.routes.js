(function () {
  'use strict';

  angular
    .module('cause-of-deaths')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('cause-of-deaths', {
        abstract: true,
        url: '/cause-of-deaths',
        template: '<ui-view/>'
      })
      .state('cause-of-deaths.list', {
        url: '',
        templateUrl: 'modules/cause-of-deaths/client/views/list-cause-of-deaths.client.view.html',
        controller: 'CauseOfDeathsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Cause of deaths List'
        }
      })
      .state('cause-of-deaths.create', {
        url: '/create',
        templateUrl: 'modules/cause-of-deaths/client/views/form-cause-of-death.client.view.html',
        controller: 'CauseOfDeathsController',
        controllerAs: 'vm',
        resolve: {
          causeOfDeathResolve: newCauseOfDeath
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Cause of deaths Create'
        }
      })
      .state('cause-of-deaths.edit', {
        url: '/:causeOfDeathId/edit',
        templateUrl: 'modules/cause-of-deaths/client/views/form-cause-of-death.client.view.html',
        controller: 'CauseOfDeathsController',
        controllerAs: 'vm',
        resolve: {
          causeOfDeathResolve: getCauseOfDeath
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Cause of death {{ cause-of-deathResolve.name }}'
        }
      })
      .state('cause-of-deaths.view', {
        url: '/:causeOfDeathId',
        templateUrl: 'modules/cause-of-deaths/client/views/view-cause-of-death.client.view.html',
        controller: 'CauseOfDeathsController',
        controllerAs: 'vm',
        resolve: {
          causeOfDeathResolve: getCauseOfDeath
        },
        data: {
          pageTitle: 'Cause of death {{ cause-of-deathResolve.name }}'
        }
      });
  }

  getCauseOfDeath.$inject = ['$stateParams', 'CauseOfDeathsService'];

  function getCauseOfDeath($stateParams, CauseOfDeathsService) {
    return CauseOfDeathsService.get({
      causeOfDeathId: $stateParams.causeOfDeathId
    }).$promise;
  }

  newCauseOfDeath.$inject = ['CauseOfDeathsService'];

  function newCauseOfDeath(CauseOfDeathsService) {
    return new CauseOfDeathsService();
  }
}());
