(function () {
  'use strict';

  // Death records controller
  angular
    .module('death-records')
    .controller('DeathRecordsController', DeathRecordsController);

  DeathRecordsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'deathRecordResolve'];

  function DeathRecordsController ($scope, $state, $window, Authentication, deathRecord) {
    var vm = this;

    vm.authentication = Authentication;
    vm.deathRecord = deathRecord;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Death record
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.deathRecord.$remove($state.go('death-records.list'));
      }
    }

    // Save Death record
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.deathRecordForm');
        return false;
      }

      if (vm.deathRecord._id) {
        vm.deathRecord.$update(successCallback, errorCallback);
      } else {
        vm.deathRecord.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('death-records.view', {
          deathRecordId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
