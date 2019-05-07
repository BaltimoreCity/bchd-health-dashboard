(function () {
  'use strict';

  angular
    .module('death-records')
    .controller('DeathRecordsListController', DeathRecordsListController);

  DeathRecordsListController.$inject = ['DeathRecordsService'];

  function DeathRecordsListController(DeathRecordsService) {
    var vm = this;

    vm.deathRecords = DeathRecordsService.query();
  }
}());
