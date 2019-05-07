(function () {
  'use strict';

  angular
    .module('core')
    .controller('HomeController', HomeController);

  HomeController.$inject = ['$scope', 'moment', 'DeathRecordsService', 'DeathRecordsCompareService',
    'CausesOfDeathService', 'CensusTractsService'];

  function HomeController($scope, moment, DeathRecordsService, DeathRecordsCompareService,
    CausesOfDeathService, CensusTractsService) {
    var vm = this;

    vm.results = {};
    vm.data = [];
    vm.columns = [];
    vm.minValue = 0;
    vm.maxValue = 0;
    vm.totalFiltered = null;
    vm.chartFormat = 'count';

    // define the enddate of the filter as the curent date of the client: moment(), or a another date
    var getEndDate = function() {
      return moment('2017-11-01');
      // return moment().startOf('month');
    };

    var initialMonthRange = 6;
    var initalEndDate = getEndDate();
    var endDate = initalEndDate.toDate();
    var startDate = initalEndDate.subtract(initialMonthRange, 'months').toDate();
    var prevEndDate = initalEndDate.subtract(initialMonthRange + 1, 'months').toDate();
    var prevStartDate = initalEndDate.subtract(initialMonthRange + 1 + initialMonthRange, 'months').toDate();


    CensusTractsService.query({
    }, function(data) {
      vm.censusTracts = data;
    });

    vm.filter = {
      mannerOfDeath: '',
      causeOfDeath: '',
      censusTract: '',
      location: 'Residence',
      gender: {
        female: true,
        male: true
      },
      age: {
        twentyAndFewer: true,
        twentyOneToForty: true,
        fortyOneToSixty: true,
        sixtyOneToEighty: true,
        eightyOneAndGreater: true
      },
      race: {
        africanAmerican: true,
        white: true,
        asian: true,
        other: true
      },
      startDate: startDate,
      endDate: endDate,
      prevStartDate: prevStartDate,
      prevEndDate: prevEndDate
    };
    vm.onlyOneGender = false;
    vm.onlyOneAge = false;
    vm.onlyOneRace = false;

    var opened = false;

    vm.compare = {
      delta: 0,
      percent: 0
    };

    vm.minDate = moment().year(2014).month(0).format('MM/yyyy');
    vm.maxDate = new Date();
    vm.format = 'MMM yyyy';
    vm.dateOptions = {};

    // make this a function so that the ranges can be always up to date
    vm.updatePickerRanges = function() {
      vm.dateOptionsStart = {
        dateDisabled: false,
        formatYear: 'yyyy',
        maxDate: vm.filter.endDate,
        startingDay: 1,
        minMode: 'month'
      };
      vm.dateOptionsEnd = {
        dateDisabled: false,
        formatYear: 'yyyy',
        maxDate: new Date(),
        minDate: vm.filter.startDate,
        startingDay: 1,
        minMode: 'month'
      };
      vm.dateOptionsPrevStart = {
        dateDisabled: false,
        formatYear: 'yyyy',
        maxDate: vm.filter.prevEndDate,
        startingDay: 1,
        minMode: 'month'
      };
      vm.dateOptionsPrevEnd = {
        dateDisabled: false,
        formatYear: 'yyyy',
        maxDate: new Date(),
        minDate: vm.filter.prevStartDate,
        startingDay: 1,
        minMode: 'month'
      };
    };
    vm.updatePickerRanges();

    vm.dateSelected = function() {
      opened = !opened;
      if (!opened) {
        vm.findDeathRecords();
      }
    };

    vm.clearEndDate = function($event) {
      $event.stopPropagation();
      vm.filter.endDate = null;
      vm.findDeathRecords();
    };

    vm.clearPrevEndDate = function($event) {
      $event.stopPropagation();
      vm.filter.prevEndDate = null;
      vm.findDeathRecords();
    };

    $scope.$watch('vm.filter.startDate', function(oldValue, newValue) {
      vm.findDeathRecords();
      vm.updatePickerRanges();
    });

    $scope.$watch('vm.filter.endDate', function(oldValue, newValue) {
      vm.findDeathRecords();
      vm.updatePickerRanges();
    });

    var checkAllDemographicsBeingUsed = function() {
      vm.allDemo = (vm.filter.gender.female === true && vm.filter.gender.male === true &&
      vm.filter.age.twentyAndFewer === true && vm.filter.age.twentyOneToForty === true &&
      vm.filter.age.fortyOneToSixty === true && vm.filter.age.sixtyOneToEighty === true &&
      vm.filter.age.eightyOneAndGreater === true && vm.filter.race.africanAmerican === true &&
      vm.filter.race.white === true && vm.filter.race.asian === true && vm.filter.race.other === true);
    };
    checkAllDemographicsBeingUsed();

    // watchers for changes in comparison
    // $scope.$watch('vm.filter.prevStartDate', function(oldValue, newValue) {
    //   vm.compareDeathRecords();
    //   vm.updatePickerRanges();
    // });

    // $scope.$watch('vm.filter.prevEndDate', function(oldValue, newValue) {
    //   vm.compareDeathRecords();
    //   vm.updatePickerRanges();
    // });

    vm.compareDeathRecords = function(chartData) {
      // update the comparison module
      if (chartData === null || chartData === undefined) {
        // if chartData has not been passed in, then use the old comparison method
        vm.compareDeathRecordsFromService();
      } else {
        // if chart data has been passed in, the use the new comparison method
        vm.compareDeathRecordsFromQueryData(chartData);
      }
    };

    vm.compareDeathRecordsFromQueryData = function(chartData) {
      // new method: make the comparison view models based on the data displayed in the chart
      // this is the more common method used in the literature, refer to trend-analysis-notes.md
      var start = chartData[0];
      var end = chartData[chartData.length-1];
      vm.compare.delta = end.value - start.value;
      vm.compare.percent = Number((vm.compare.delta / start.value) * 100).toFixed(1);
    };

    vm.compareDeathRecordsFromService = function() {
      // old method: get a comparison of death data across two date ranges
      DeathRecordsCompareService.query({
        mannerOfDeath: vm.filter.mannerOfDeath,
        causeOfDeath: vm.filter.causeOfDeath,
        censusTract: vm.filter.censusTract,
        location: vm.filter.location,
        female: vm.filter.gender.female,
        male: vm.filter.gender.male,
        twentyAndFewer: vm.filter.age.twentyAndFewer,
        twentyOneToForty: vm.filter.age.twentyOneToForty,
        fortyOneToSixty: vm.filter.age.fortyOneToSixty,
        sixtyOneToEighty: vm.filter.age.sixtyOneToEighty,
        eightyOneAndGreater: vm.filter.age.eightyOneAndGreater,
        africanAmerican: vm.filter.race.africanAmerican,
        white: vm.filter.race.white,
        asian: vm.filter.race.asian,
        other: vm.filter.race.other,
        startDate: vm.filter.startDate,
        endDate: vm.filter.endDate,
        prevStartDate: vm.filter.prevStartDate,
        prevEndDate: vm.filter.prevEndDate
      }, function(data) {
        // console.log('data', data);
        if (data && data.previous && data.current) {
          vm.compare.delta = data.current.avg - data.previous.avg;
          vm.compare.percent = Number((vm.compare.delta / data.previous.avg) * 100).toFixed(1);
          // console.log('vm.compare.delta', vm.compare.delta);
          // console.log('vm.compare.percent', vm.compare.percent);
        }
      });
    };


    vm.findDeathRecords = function() {
      DeathRecordsService.query({
        mannerOfDeath: vm.filter.mannerOfDeath,
        causeOfDeath: vm.filter.causeOfDeath,
        censusTract: vm.filter.censusTract,
        location: vm.filter.location,
        female: vm.filter.gender.female,
        male: vm.filter.gender.male,
        twentyAndFewer: vm.filter.age.twentyAndFewer,
        twentyOneToForty: vm.filter.age.twentyOneToForty,
        fortyOneToSixty: vm.filter.age.fortyOneToSixty,
        sixtyOneToEighty: vm.filter.age.sixtyOneToEighty,
        eightyOneAndGreater: vm.filter.age.eightyOneAndGreater,
        africanAmerican: vm.filter.race.africanAmerican,
        white: vm.filter.race.white,
        asian: vm.filter.race.asian,
        other: vm.filter.race.other,
        startDate: vm.filter.startDate,
        endDate: vm.filter.endDate
      }, function(data) {
        var dataByDate = data.byDate;
        var dataByCensus = data.byCensus;
        vm.dataByGender = data.byGender.count;
        vm.dataByAge = data.byAge.count;
        vm.dataByRace = data.byRace.count;
        vm.results = dataByDate;
        vm.mapResults = dataByCensus;
        vm.columns = dataByDate.columns;
        if (vm.chartFormat === 'count') {
          vm.data = dataByDate.count;
          vm.mapData = dataByCensus.count;
          vm.minValue = (dataByDate.min > 0) ? 0 : dataByDate.min;
          vm.maxValue = (dataByDate.max <= 10) ? 10 : Math.round(dataByDate.max / 10) * 10;
        } else if (vm.chartFormat === 'per_capita') {
          vm.data = dataByDate.count;
          vm.mapData = dataByCensus.count;
          vm.minValue = (dataByDate.min > 0) ? 0 : dataByDate.min;
          vm.maxValue = (dataByDate.max <= 10) ? 10 : Math.round(dataByDate.max / 10) * 10;
        } else {
          vm.data = dataByDate.percent;
          vm.mapData = dataByCensus.percent;
          vm.minValue = 0;
          vm.maxValue = 100;
        }
        vm.totalFiltered = dataByDate.totalFiltered;
        vm.compareDeathRecords(vm.data);
      });
    };
    vm.findDeathRecords();


    vm.mannerOfDeathSelected = function(value) {
      vm.filter.mannerOfDeath = value;
      vm.findDeathRecords();
    };

    vm.toggleDataFormat = function() {
      vm.data = vm.results[vm.chartFormat];
      vm.mapData = vm.mapResults[vm.chartFormat];
      // console.log('toggle', vm.chartFormat);
      if (vm.chartFormat === 'count') {
        vm.minValue = (vm.results.min > 0) ? 0 : vm.results.min;
        vm.maxValue = (vm.results.max <= 10) ? 10 : Math.round(vm.results.max / 10) * 10;
        // console.log('count ' + vm.minValue + ' ' + vm.maxValue);
      } else {
        vm.minValue = 0;
        vm.maxValue = 100;
        // console.log('percent ' + vm.minValue + ' ' + vm.maxValue);
      }
    };

    vm.loadingCauses = false;
    vm.noResultingCauses = false;

    vm.getCausesOfDeath = function(val) {
      vm.loadingCauses = true;
      return CausesOfDeathService.query({
        searchString: val
      }, function(causes) {
        vm.noResultingCauses = (!causes || causes.length <= 0);
        vm.loadingCauses = false;
      }, function(err) {
        vm.noResultingCauses = true;
        vm.loadingCauses = false;
      }).$promise;
    };

    vm.causeOfDeathSelected = function(item, model, label, event) {
      vm.findDeathRecords();
    };

    vm.censusTractSelected = function(value) {
      vm.filter.censusTract = value;
      vm.findDeathRecords();
    };

    vm.dateMonthSelected = function(startDate, endDate) {
      vm.filter.startDate = startDate;
      vm.filter.endDate = endDate;
      vm.findDeathRecords();
    };

    vm.locationSelected = function(value) {
      vm.filter.location = value;
      vm.findDeathRecords();
    };

    vm.genderSelected = function(gender) {
      angular.forEach(vm.filter.gender, function(value, key) {
        if (!gender || key.toLowerCase() === gender.toLowerCase())
          vm.filter.gender[key] = true;
        else
          vm.filter.gender[key] = false;
      });
      checkAllDemographicsBeingUsed();
      vm.findDeathRecords();
    };

    vm.ageSelected = function(ageLabel) {
      angular.forEach(vm.filter.age, function(value, key) {
        if (!ageLabel)
          vm.filter.age[key] = true;
        else
          vm.filter.age[key] = false;
      });
      switch (ageLabel) {
        case '0-20': vm.filter.age.twentyAndFewer = true; break;
        case '21-40': vm.filter.age.twentyOneToForty = true; break;
        case '41-60': vm.filter.age.fortyOneToSixty = true; break;
        case '61-80': vm.filter.age.sixtyOneToEighty = true; break;
        case '81+': vm.filter.age.eightyOneAndGreater = true; break;
      }
      checkAllDemographicsBeingUsed();
      vm.findDeathRecords();
    };

    vm.raceSelected = function(raceLabel) {
      // make lowercase and remove spaces
      var race = raceLabel ? raceLabel.toLowerCase().replace(/\s/g, '') : '';
      angular.forEach(vm.filter.race, function(value, key) {
        if (!raceLabel || key.toLowerCase() === race) {
          vm.filter.race[key] = true;
        } else {
          vm.filter.race[key] = false;
        }
      });
      checkAllDemographicsBeingUsed();
      vm.findDeathRecords();
    };

    vm.toggleGender = function($event) {
      $event.stopPropagation();
      var numTrue = 0;
      angular.forEach(vm.filter.gender, function(value, key) {
        if (value) numTrue++;
      });
      vm.onlyOneGender = (numTrue <= 1);
      checkAllDemographicsBeingUsed();
      vm.findDeathRecords();
    };

    vm.toggleAge = function($event) {
      $event.stopPropagation();
      var numTrue = 0;
      angular.forEach(vm.filter.age, function(value, key) {
        if (value) numTrue++;
      });
      vm.onlyOneAge = (numTrue <= 1);
      checkAllDemographicsBeingUsed();
      vm.findDeathRecords();
    };

    vm.toggleRace = function($event) {
      $event.stopPropagation();
      var numTrue = 0;
      angular.forEach(vm.filter.race, function(value, key) {
        if (value) numTrue++;
      });
      vm.onlyOneRace = (numTrue <= 1);
      checkAllDemographicsBeingUsed();
      vm.findDeathRecords();
    };
  }
}());
