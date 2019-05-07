(function () {
  'use strict';

  // Cause of deaths controller
  angular
    .module('cause-of-deaths')
    .controller('CauseOfDeathsController', CauseOfDeathsController);

  CauseOfDeathsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'causeOfDeathResolve'];

  function CauseOfDeathsController ($scope, $state, $window, Authentication, causeOfDeath) {
    var vm = this;

    vm.authentication = Authentication;
    vm.causeOfDeath = causeOfDeath;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Cause of death
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.causeOfDeath.$remove($state.go('cause-of-deaths.list'));
      }
    }

    // Save Cause of death
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.causeOfDeathForm');
        return false;
      }

      if (vm.causeOfDeath._id) {
        vm.causeOfDeath.$update(successCallback, errorCallback);
      } else {
        vm.causeOfDeath.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('cause-of-deaths.view', {
          causeOfDeathId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
