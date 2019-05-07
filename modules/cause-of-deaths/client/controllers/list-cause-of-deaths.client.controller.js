(function () {
  'use strict';

  angular
    .module('cause-of-deaths')
    .controller('CauseOfDeathsListController', CauseOfDeathsListController);

  CauseOfDeathsListController.$inject = ['CauseOfDeathsService'];

  function CauseOfDeathsListController(CauseOfDeathsService) {
    var vm = this;

    vm.causeOfDeaths = CauseOfDeathsService.query();
  }
}());
