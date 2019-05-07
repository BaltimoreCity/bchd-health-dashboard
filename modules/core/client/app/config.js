(function (window) {
  'use strict';

  var applicationModuleName = 'mean';

  var service = {
    applicationEnvironment: window.env,
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: [
      'ngResource',
      'ngAnimate',
      'ngMessages',
      'ui.router',
      'ui.bootstrap',
      'ngFileUpload',
      'ui-notification',
      'angularMoment',
      'd3'
    ],
    registerModule: registerModule
  };

  window.ApplicationConfiguration = service;

  // Add a new vertical module
  function registerModule(moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  }

  // Angular-ui-notification configuration
  angular.module('ui-notification').config(function(NotificationProvider) {
    NotificationProvider.setOptions({
      delay: 2000,
      startTop: 20,
      startRight: 10,
      verticalSpacing: 20,
      horizontalSpacing: 20,
      positionX: 'right',
      positionY: 'bottom'
    });
  });

  angular.module('d3', [])
  // And on the d3 module, declare the d3 service that we want
  // available as an injectable
  .factory('d3', function ($window) {
    // console.log('d3', $window.d3);
    if ($window.d3) {
      // Delete d3 from window so it's not globally accessible.
      //  We can still get at it through _thirdParty however, more on why later
      $window._thirdParty = $window._thirdParty || {};
      $window._thirdParty.d3 = $window.d3;
      try { delete $window.d3; } catch (e) {
        $window.d3 = undefined;
      /* <IE8 doesn't do delete of window vars, make undefined if delete error*/
      }
    }
    var d3 = $window._thirdParty.d3;
    return d3;
  });
}(window));
