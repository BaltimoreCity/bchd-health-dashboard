(function () {
  'use strict';

  describe('Cause of deaths Controller Tests', function () {
    // Initialize global variables
    var CauseOfDeathsController,
      $scope,
      $httpBackend,
      $state,
      Authentication,
      CauseOfDeathsService,
      mockCauseOfDeath;

    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function () {
      jasmine.addMatchers({
        toEqualData: function (util, customEqualityTesters) {
          return {
            compare: function (actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($controller, $rootScope, _$state_, _$httpBackend_, _Authentication_, _CauseOfDeathsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();

      // Point global variables to injected services
      $httpBackend = _$httpBackend_;
      $state = _$state_;
      Authentication = _Authentication_;
      CauseOfDeathsService = _CauseOfDeathsService_;

      // create mock Cause of death
      mockCauseOfDeath = new CauseOfDeathsService({
        _id: '525a8422f6d0f87f0e407a33',
        name: 'Cause of death Name'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Cause of deaths controller.
      CauseOfDeathsController = $controller('Cause of deathsController as vm', {
        $scope: $scope,
        causeOfDeathResolve: {}
      });

      // Spy on state go
      spyOn($state, 'go');
    }));

    describe('vm.save() as create', function () {
      var sampleCauseOfDeathPostData;

      beforeEach(function () {
        // Create a sample Cause of death object
        sampleCauseOfDeathPostData = new CauseOfDeathsService({
          name: 'Cause of death Name'
        });

        $scope.vm.causeOfDeath = sampleCauseOfDeathPostData;
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (CauseOfDeathsService) {
        // Set POST response
        $httpBackend.expectPOST('api/cause-of-deaths', sampleCauseOfDeathPostData).respond(mockCauseOfDeath);

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test URL redirection after the Cause of death was created
        expect($state.go).toHaveBeenCalledWith('cause-of-deaths.view', {
          causeOfDeathId: mockCauseOfDeath._id
        });
      }));

      it('should set $scope.vm.error if error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('api/cause-of-deaths', sampleCauseOfDeathPostData).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect($scope.vm.error).toBe(errorMessage);
      });
    });

    describe('vm.save() as update', function () {
      beforeEach(function () {
        // Mock Cause of death in $scope
        $scope.vm.causeOfDeath = mockCauseOfDeath;
      });

      it('should update a valid Cause of death', inject(function (CauseOfDeathsService) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/cause-of-deaths\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test URL location to new object
        expect($state.go).toHaveBeenCalledWith('cause-of-deaths.view', {
          causeOfDeathId: mockCauseOfDeath._id
        });
      }));

      it('should set $scope.vm.error if error', inject(function (CauseOfDeathsService) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/cause-of-deaths\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect($scope.vm.error).toBe(errorMessage);
      }));
    });

    describe('vm.remove()', function () {
      beforeEach(function () {
        // Setup Cause of deaths
        $scope.vm.causeOfDeath = mockCauseOfDeath;
      });

      it('should delete the Cause of death and redirect to Cause of deaths', function () {
        // Return true on confirm message
        spyOn(window, 'confirm').and.returnValue(true);

        $httpBackend.expectDELETE(/api\/cause-of-deaths\/([0-9a-fA-F]{24})$/).respond(204);

        $scope.vm.remove();
        $httpBackend.flush();

        expect($state.go).toHaveBeenCalledWith('cause-of-deaths.list');
      });

      it('should should not delete the Cause of death and not redirect', function () {
        // Return false on confirm message
        spyOn(window, 'confirm').and.returnValue(false);

        $scope.vm.remove();

        expect($state.go).not.toHaveBeenCalled();
      });
    });
  });
}());
