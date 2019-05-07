(function () {
  'use strict';

  describe('Cause of deaths Route Tests', function () {
    // Initialize global variables
    var $scope,
      CauseOfDeathsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _CauseOfDeathsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      CauseOfDeathsService = _CauseOfDeathsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('cause-of-deaths');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/cause-of-deaths');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('View Route', function () {
        var viewstate,
          CauseOfDeathsController,
          mockCauseOfDeath;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('cause-of-deaths.view');
          $templateCache.put('modules/cause-of-deaths/client/views/view-cause-of-death.client.view.html', '');

          // create mock Cause of death
          mockCauseOfDeath = new CauseOfDeathsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Cause of death Name'
          });

          // Initialize Controller
          CauseOfDeathsController = $controller('CauseOfDeathsController as vm', {
            $scope: $scope,
            causeOfDeathResolve: mockCauseOfDeath
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:causeOfDeathId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.causeOfDeathResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            causeOfDeathId: 1
          })).toEqual('/cause-of-deaths/1');
        }));

        it('should attach an Cause of death to the controller scope', function () {
          expect($scope.vm.causeOfDeath._id).toBe(mockCauseOfDeath._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/cause-of-deaths/client/views/view-cause-of-death.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          CauseOfDeathsController,
          mockCauseOfDeath;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('cause-of-deaths.create');
          $templateCache.put('modules/cause-of-deaths/client/views/form-cause-of-death.client.view.html', '');

          // create mock Cause of death
          mockCauseOfDeath = new CauseOfDeathsService();

          // Initialize Controller
          CauseOfDeathsController = $controller('CauseOfDeathsController as vm', {
            $scope: $scope,
            causeOfDeathResolve: mockCauseOfDeath
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.causeOfDeathResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/cause-of-deaths/create');
        }));

        it('should attach an Cause of death to the controller scope', function () {
          expect($scope.vm.causeOfDeath._id).toBe(mockCauseOfDeath._id);
          expect($scope.vm.causeOfDeath._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/cause-of-deaths/client/views/form-cause-of-death.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          CauseOfDeathsController,
          mockCauseOfDeath;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('cause-of-deaths.edit');
          $templateCache.put('modules/cause-of-deaths/client/views/form-cause-of-death.client.view.html', '');

          // create mock Cause of death
          mockCauseOfDeath = new CauseOfDeathsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Cause of death Name'
          });

          // Initialize Controller
          CauseOfDeathsController = $controller('CauseOfDeathsController as vm', {
            $scope: $scope,
            causeOfDeathResolve: mockCauseOfDeath
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:causeOfDeathId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.causeOfDeathResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            causeOfDeathId: 1
          })).toEqual('/cause-of-deaths/1/edit');
        }));

        it('should attach an Cause of death to the controller scope', function () {
          expect($scope.vm.causeOfDeath._id).toBe(mockCauseOfDeath._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/cause-of-deaths/client/views/form-causeOfDeath.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
