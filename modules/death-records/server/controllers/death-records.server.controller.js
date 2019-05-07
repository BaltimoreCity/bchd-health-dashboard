'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  DeathRecord = mongoose.model('DeathRecord'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  moment = require('moment'),
  _ = require('lodash');

/**
 * Create a Death record
 */
exports.create = function(req, res) {
  var deathRecord = new DeathRecord(req.body);
  deathRecord.user = req.user;

  deathRecord.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(deathRecord);
    }
  });
};

/**
 * Show the current Death record
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var deathRecord = req.deathRecord ? req.deathRecord.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  deathRecord.isCurrentUserOwner = req.user && deathRecord.user && deathRecord.user._id.toString() === req.user._id.toString();

  res.jsonp(deathRecord);
};

/**
 * Update a Death record
 */
exports.update = function(req, res) {
  var deathRecord = req.deathRecord;

  deathRecord = _.extend(deathRecord, req.body);

  deathRecord.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(deathRecord);
    }
  });
};

/**
 * Delete an Death record
 */
exports.delete = function(req, res) {
  var deathRecord = req.deathRecord;

  deathRecord.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(deathRecord);
    }
  });
};

var getDateRange = function(startDate, endDate) {
  var dateRange;
  var startYearMonth;
  var endYearMonth;
  if (startDate && startDate !== null && startDate !== '') {
    var startMoment = moment(startDate).startOf('month');
    startDate = startMoment.toDate();
    var endMoment;
    if (endDate && endDate !== null && endDate !== '') {
      endMoment = moment(endDate).endOf('month');
      endDate = endMoment.toDate();
    } else {
      endMoment = moment(startDate).endOf('month');
      endDate = endMoment.toDate();
    }

    if (startDate && endDate) {
      startYearMonth = _.toNumber(startMoment.format('YYYYMM'));
      endYearMonth = _.toNumber(endMoment.format('YYYYMM'));

      dateRange = { $or: [{
        $and: [
          { 'dateOfDeath': { '$gte': startDate } },
          { 'dateOfDeath': { '$lte': endDate } }
        ]
      }, {
        $and: [
          { 'yearMonthOfDeath': { '$gte': startYearMonth } },
          { 'yearMonthOfDeath': { '$lte': endYearMonth } }
        ]
      }] };
    }
  }
  return { dateRange: dateRange, startYearMonth: startYearMonth, endYearMonth: endYearMonth };
};

var getQueryStringForFilter = function(req, callback) {
  var query;
  var and = [];

  if (req.query.mannerOfDeath && req.query.mannerOfDeath !== '' &&
  req.query.mannerOfDeath !== 'All') {
    and.push({ mannerOfDeath: req.query.mannerOfDeath });
  }

  var causeRe;
  var causeOr = [];
  if (req.query.causeOfDeath) {
    try {
      causeRe = new RegExp(req.query.causeOfDeath, 'i');
    } catch (e) {
      callback('Cause of death is invalid');
    }
    causeOr.push({ causeOfDeath: causeRe });
    causeOr.push({ otherSignificantCondition: causeRe });

    and.push({ $or: causeOr });
  }

  if (req.query.censusTract && req.query.censusTract !== '' &&
  req.query.censusTract !== 'All') {
    if (req.query.location === 'Incident') {
      and.push({ 'incidentLocation.censusTract': req.query.censusTract });
    } else if (req.query.location === 'Residence') {
      and.push({ 'residenceLocation.censusTract': req.query.censusTract });
    }
  }

  if (req.query.female === 'true' || req.query.male === 'true') {
    if (req.query.female === 'true' && req.query.male === 'false') {
      and.push({ sex: 'Female' });
    } else if (req.query.female === 'false' && req.query.male === 'true') {
      and.push({ sex: 'Male' });
    }
  }

  var ageOr = [];
  if (req.query.twentyAndFewer === 'true') {
    ageOr.push({ ageInYearsAtDeath: { $lte: 20 } });
  }
  if (req.query.twentyOneToForty === 'true') {
    ageOr.push({ $and: [{ ageInYearsAtDeath: { $gte: 21 } }, { ageInYearsAtDeath: { $lte: 40 } }] });
  }
  if (req.query.fortyOneToSixty === 'true') {
    ageOr.push({ $and: [{ ageInYearsAtDeath: { $gte: 41 } }, { ageInYearsAtDeath: { $lte: 60 } }] });
  }
  if (req.query.sixtyOneToEighty === 'true') {
    ageOr.push({ $and: [{ ageInYearsAtDeath: { $gte: 61 } }, { ageInYearsAtDeath: { $lte: 80 } }] });
  }
  if (req.query.eightyOneAndGreater === 'true') {
    ageOr.push({ ageInYearsAtDeath: { $gte: 81 } });
  }
  if (ageOr.length < 5 && ageOr.length > 0) {
    and.push({ $or: ageOr });
  }

  var raceOr = [];
  if (req.query.africanAmerican === 'true') {
    raceOr.push({ race: 'African American' });
  }
  if (req.query.white === 'true') {
    raceOr.push({ race: 'White' });
  }
  if (req.query.asian === 'true') {
    raceOr.push({ race: 'Asian' });
  }
  if (req.query.other === 'true') {
    raceOr.push({ race: 'Other' });
  }
  if (raceOr.length < 4 && raceOr.length > 0) {
    and.push({ $or: raceOr });
  }

  callback(null, and);
};

var getAggregatedValues = function(req, and, dateRange, groupBy, callback) {
  var sort = { $sort: { _id: 1 } };
  var totalQuery = [];
  if (dateRange) {
    totalQuery.push({ $match: dateRange });
  }
  totalQuery.push({ $group: { _id: groupBy, total_count: { $sum: 1 } } });
  totalQuery.push(sort);

  var filterQuery = [];
  if (and.length === 1) {
    // query = DeathRecord.find(and[0]);
    filterQuery.push({ $match: and[0] });
  } else if (and.length > 0) {
    // query = DeathRecord.find({ $and: and });
    filterQuery.push({ $match: { $and: and } });
  }
  filterQuery.push({ $group: { _id: groupBy, count: { $sum: 1 } } });
  filterQuery.push(sort);

  DeathRecord.aggregate(totalQuery).exec(function(err, totalCounts) {
    if (err) {
      callback(errorHandler.getErrorMessage(err));
    } else {
      DeathRecord.aggregate(filterQuery).exec(function(err2, filteredCounts) {
        if (err2) {
          callback(errorHandler.getErrorMessage(err2));
        } else {
          callback(null, totalCounts, filteredCounts);
        }
      });
    }
  });
};

var binAges = function(filteredCounts) {
  var results = {
    max: Number.MIN_VALUE,
    min: Number.MAX_VALUE,
    count: [{ label: '0-20', value: 0 }, { label: '21-40', value: 0 }, { label: '41-60', value: 0 }, { label: '61-80', value: 0 }, { label: '81+', value: 0 }]
  };
  for (var i = 0; i < filteredCounts.length; i++) {
    var item = filteredCounts[i];
    var value = Number(item._id);

    if (value >= 0 && value <= 20)
      results.count[0].value += value;
    if (value >= 21 && value <= 40)
      results.count[1].value += value;
    if (value >= 41 && value <= 60)
      results.count[2].value += value;
    if (value >= 61 && value <= 80)
      results.count[3].value += value;
    if (value >= 81)
      results.count[4].value += value;
  }

  for (var bin in results.count) {
    if (bin.value > results.max) results.max = bin.value;
    if (bin.value < results.min) results.min = bin.value;
  }
  return results;
};

var combineTotalsAndFilters = function(groupBy, columns, totalCounts, filteredCounts) {
  var results = {
    count: [],
    total_count: [],
    percent: [],
    per_capita: []
  };
  var i = 0;
  var max = Number.MIN_VALUE;
  var min = Number.MAX_VALUE;
  var totalFilteredCount = 0;

  for (var x = 0; x < totalCounts.length; x++) {
    var label = (groupBy === 'date') ? moment(totalCounts[x]._id, 'YYYYMM').format('MMM YYYY') : totalCounts[x]._id;
    var totalCount = totalCounts[x].total_count;
    if (groupBy === 'age')
      return binAges(filteredCounts);
    if (groupBy === 'census' && label && label !== '' && label !== null) columns.push(label);
    if (i < filteredCounts.length) {
      if (filteredCounts[i].count < min) min = filteredCounts[i].count;
      if (filteredCounts[i].count > max) max = filteredCounts[i].count;
      if (totalCounts[x]._id === filteredCounts[i]._id) {
        totalFilteredCount += filteredCounts[i].count;
        results.count.push({
          label: label,
          value: filteredCounts[i].count
        });
        results.total_count.push({
          label: label,
          value: totalCount
        });
        results.percent.push({
          label: label,
          value: Math.round((filteredCounts[i].count / totalCount) * 100)
        });
        results.per_capita.push({
          label: label,
          value: totalCount
        });
        i++;
      } else {
        results.count.push({
          label: label,
          value: 0
        });
        results.total_count.push({
          label: label,
          value: totalCount
        });
        results.percent.push({
          label: label,
          value: 0
        });
      }
    } else {
      results.count.push({
        label: label,
        value: 0
      });
      results.total_count.push({
        label: label,
        value: totalCount
      });
      results.percent.push({
        label: label,
        value: 0
      });
    }
  }
  results.min = min;
  results.max = max;
  results.columns = columns;
  results.totalFiltered = totalFilteredCount;
  return results;
};

/**
 * List of Death records
 */
exports.aggregate = function(req, res) {
  var handleError = function(errorname, message) {
    console.log(errorname, message);
    return res.status(400).send({ message: message });
  };

  getQueryStringForFilter(req, function(errorMessage1, and) {
    if (errorMessage1) {
      handleError('errorMessage1', errorMessage1);
    } else {
      var dateRangeValues = getDateRange(req.query.startDate, req.query.endDate);
      if (dateRangeValues.dateRange) and.push(dateRangeValues.dateRange);

      var dateColumns = [];
      var dateNum = dateRangeValues.startYearMonth;
      while (dateNum <= dateRangeValues.endYearMonth) {
        var column = moment(dateNum.toString(), 'YYYYMM');
        dateColumns.push(column.format('MMM YYYY'));
        dateNum = _.toNumber(column.add(1, 'month').format('YYYYMM'));
      }

      var valuesByDate,
        valuesByCensus,
        valuesByGender,
        valuesByRace,
        valuesByAge;
      // get date aggregate
      getAggregatedValues(req, and, dateRangeValues.dateRange, '$yearMonthOfDeath', function(errorMessage2, totalByDate, filteredByDate) {
        if (errorMessage2) {
          handleError('errorMessage2', errorMessage2);
        } else {
          var valuesByDate = combineTotalsAndFilters('date', dateColumns, totalByDate, filteredByDate);
          // get census aggregate
          var groupBy = (req.query.location === 'Incident') ? '$incidentLocation.censusTract' : '$residenceLocation.censusTract';
          getAggregatedValues(req, and, dateRangeValues.dateRange, groupBy, function(errorMessage3, totalByCensus, filteredByCensus) {
            if (errorMessage3) {
              handleError('errorMessage3', errorMessage3);
            } else {
              var valuesByCensus = combineTotalsAndFilters('census', [], totalByCensus, filteredByCensus);
              // get gender aggregate
              getAggregatedValues(req, and, dateRangeValues.dateRange, '$sex', function(errorMessage4, totalByGender, filteredByGender) {
                if (errorMessage4) {
                  handleError('errorMessage4', errorMessage4);
                } else {
                  var valuesByGender = combineTotalsAndFilters('sex', [], totalByGender, filteredByGender);
                  // get race aggregate
                  getAggregatedValues(req, and, dateRangeValues.dateRange, '$race', function(errorMessage5, totalByRace, filteredByRace) {
                    if (errorMessage5) {
                      handleError('errorMessage5', errorMessage5);
                    } else {
                      var valuesByRace = combineTotalsAndFilters('race', [], totalByRace, filteredByRace);
                      // get age aggregate
                      getAggregatedValues(req, and, dateRangeValues.dateRange, '$ageInYearsAtDeath', function(errorMessage6, totalByAge, filteredByAge) {
                        if (errorMessage6) {
                          handleError('errorMessage6', errorMessage6);
                        } else {
                          var valuesByAge = combineTotalsAndFilters('age', [], totalByAge, filteredByAge);
                          // return results
                          res.jsonp({
                            byDate: valuesByDate,
                            byCensus: valuesByCensus,
                            byGender: valuesByGender,
                            byAge: valuesByAge,
                            byRace: valuesByRace
                          });
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
};

exports.compare = function(req, res) {
  getQueryStringForFilter(req, function(errorMessage1, and) {
    if (errorMessage1) {
      console.log('errorMessage1', errorMessage1);
      return res.status(400).send({
        message: errorMessage1
      });
    } else {
      var currentDateRangeValues = getDateRange(req.query.startDate, req.query.endDate);
      var previousDateRangeValues = getDateRange(req.query.prevStartDate, req.query.prevEndDate);
      var prevAnd = JSON.parse(JSON.stringify(and));

      if (currentDateRangeValues.dateRange) and.push(currentDateRangeValues.dateRange);
      if (previousDateRangeValues.dateRange) prevAnd.push(previousDateRangeValues.dateRange);

      var sort = { $sort: { _id: 1 } };
      var groupBy = '$yearMonthOfDeath';
      var currentFilterQuery = [];
      if (and.length === 1) {
        // query = DeathRecord.find(and[0]);
        currentFilterQuery.push({ $match: and[0] });
      } else if (and.length > 0) {
        // query = DeathRecord.find({ $and: and });
        currentFilterQuery.push({ $match: { $and: and } });
      }
      currentFilterQuery.push({ $group: { _id: groupBy, count: { $sum: 1 } } });
      currentFilterQuery.push({ $group: { _id: null, avg: { $avg: '$count' }, min: { $min: '$count' }, max: { $max: '$count' } } });
      currentFilterQuery.push(sort);

      var prevFilterQuery = [];
      if (prevAnd.length === 1) {
        // query = DeathRecord.find(and[0]);
        prevFilterQuery.push({ $match: prevAnd[0] });
      } else if (prevAnd.length > 0) {
        // query = DeathRecord.find({ $and: and });
        prevFilterQuery.push({ $match: { $and: prevAnd } });
      }
      prevFilterQuery.push({ $group: { _id: groupBy, count: { $sum: 1 } } });
      prevFilterQuery.push({ $group: { _id: null, avg: { $avg: '$count' }, min: { $min: '$count' }, max: { $max: '$count' } } });
      prevFilterQuery.push(sort);

      DeathRecord.aggregate(currentFilterQuery).exec(function(err, currentCounts) {
        if (err) {
          console.log('err', err);
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          console.log('currentCounts', currentCounts);
          DeathRecord.aggregate(prevFilterQuery).exec(function(err2, prevCounts) {
            if (err2) {
              console.log('err2', err2);
              return res.status(400).send({
                message: errorHandler.getErrorMessage(err2)
              });
            } else {
              console.log('previousCounts', prevCounts);
              var result = {};
              if (currentCounts && currentCounts.length === 1) {
                result.current = {
                  avg: Number(currentCounts[0].avg).toPrecision(2),
                  min: currentCounts[0].min,
                  max: currentCounts[0].max,
                  counts: currentCounts
                };
              } else {
                result.current = {
                  avg: 0,
                  min: 0,
                  max: 0
                };
              }
              if (prevCounts && prevCounts.length === 1) {
                result.previous = {
                  avg: Number(prevCounts[0].avg).toPrecision(2),
                  min: prevCounts[0].min,
                  max: prevCounts[0].max,
                  counts: prevCounts
                };
              }
              res.jsonp(result);
            }
          });
        }
      });
    }
  });
};

exports.listCensusTracts = function(req, res) {
  DeathRecord.aggregate([{ $group: { _id: null,
    'ct1': { $addToSet: '$residenceLocation.censusTract' },
    'ct2': { $addToSet: '$incidentLocation.censusTract' }
  } }, { $project: { 'censusTract': { $setUnion: ['$ct1', '$ct2'] } } }])
  .exec(function(err, censusTracts) {
    if (err) {
      return res.status(400).send({
        message: 'No census tracts'
      });
    } else {
      var cts = [];
      for (var i = 0; i < censusTracts[0].censusTract.length; i++) {
        if (!_.isEmpty(censusTracts[0].censusTract[i])) {
          cts.push(censusTracts[0].censusTract[i]);
        }
      }
      res.jsonp(cts);
    }
  });
};

/**
 * Death record middleware
*/
// return a death record for a single id
exports.deathRecordByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Death record is invalid'
    });
  }

  DeathRecord.findById(id).populate('user', 'displayName').exec(function (err, deathRecord) {
    if (err) {
      return next(err);
    } else if (!deathRecord) {
      return res.status(404).send({
        message: 'No Death record with that identifier has been found'
      });
    }
    req.deathRecord = deathRecord;
    next();
  });
};
