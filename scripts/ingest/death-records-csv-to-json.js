'use strict';

var moment = require('moment'),
  path = require('path'),
  config = require('../../config/config'),
  csv = require('fast-csv'),
  mongoose = require('mongoose'),
  DeathRecordSchema = require(path.resolve('modules/death-records/server/models/death-record.server.model.js')),
  Geocode = require('../geocoder/geocode.js'),
  GeoHandler = require(path.resolve('modules/geo/server/controllers/geo.server.controller.js')),
  DeathRecord = mongoose.model('DeathRecord'),
  _ = require('lodash');

exports.headerArray = ['Case Number', 'Case Type', 'Last Name', 'First Name', 'Middle',	'Suffix', 'Year of Death',
  'Month of Death', 'Date of Death', 'Sex', 'Race', 'Age', 'Date of Birth', 'Year of Birth', 'Res. Street',
  'Res. City', 'Res. County', 'Res. State', 'Res. ZIPCODE', 'Homeless',
  'COD', 'Other significant condition', 'Manner', 'Incident Street', 'Incident City', 'Incident County',
  'Incident State', 'Incident ZIPCODE', 'Injury Description', 'Report Signed Date'];

exports.drugMappingPatterns = {
  'fentanyl': [/(\bfentanyl\b)/i],
  'carfentanil': [/(\bcarfentanil\b)/i],
  'carfentanyl': [/(\bcarfentanyl\b)/i],
  'wildnil': [/(\bwildnil\b)/i],
  'carfentanil23': [/(\b4-carbomethoxyfentanyl\b)/i]
};

exports.saveObjToDatabase = function(obj, callback) {
  DeathRecord.findOne({ 'caseNumber': obj['Case Number'] }).exec(function (err, record) {
    if (err) {
      callback(err, null);
    } else {
      var recordJson = {
        caseNumber: obj['Case Number'],
        caseType: obj['Case Type'],
        lastName: obj['Last Name'],
        firstName: obj['First Name'],
        middleInitial: obj.Middle,
        suffix: obj.Suffix,
        sex: obj.Sex,
        race: obj.Race,
        residenceLocation: {
          street: (obj['Res. Street']) ? obj['Res. Street'] : '',
          city: (obj['Res. City']) ? obj['Res. City'] : '',
          county: (obj['Res. County']) ? obj['Res. County'] : '',
          state: (obj['Res. State']) ? obj['Res. State'] : '',
          zipcode: (obj['Res. ZIPCODE']) ? obj['Res. ZIPCODE'] : '',
          longitude: (obj['Res. Longitude']) ? obj['Res. Longitude'] : '',
          latitude: (obj['Res. Latitude']) ? obj['Res. Latitude'] : '',
          addressString: (obj['Res. AddressString']) ? obj['Res. AddressString'] : ''

        },
        homeless: (obj.Homeless === 'Yes'),
        causeOfDeath: _.trim(_.capitalize(obj.COD)),
        otherSignificantCondition: obj['Other significant condition'],
        incidentLocation: {
          street: (obj['Incident Street']) ? obj['Incident Street'] : '',
          city: (obj['Incident City']) ? obj['Incident City'] : '',
          county: (obj['Incident County']) ? obj['Incident County'] : '',
          state: (obj['Incident State']) ? obj['Incident State'] : '',
          zipcode: (obj['Incident ZIPCODE']) ? obj['Incident ZIPCODE'] : '',
          longitude: (obj['Incident Longitude']) ? obj['Incident Longitude'] : '',
          latitude: (obj['Incident Latitude']) ? obj['Incident Latitude'] : '',
          addressString: (obj['Incident AddressString']) ? obj['Incident AddressString'] : ''
        },
        injuryDescription: obj['Injury Description']
      };

      // Set Years and Months as Numbers
      if (obj['Year of Death'] && obj['Year of Death'] !== '') recordJson.yearOfDeath = _.toNumber(_.trim(obj['Year of Death']));
      if (obj['Month of Death'] && obj['Month of Death'] !== '') recordJson.monthOfDeath = _.toNumber(_.trim(obj['Month of Death']));
      if (obj['Year of Birth'] && obj['Year of Birth'] !== '') recordJson.yearOfBirth = _.toNumber(_.trim(obj['Year of Birth']));
      if (recordJson.yearOfDeath && recordJson.monthOfDeath) {
        if (recordJson.monthOfDeath < 10) {
          recordJson.yearMonthOfDeath = _.toNumber(recordJson.yearOfDeath + '0' + recordJson.monthOfDeath);
        } else {
          recordJson.yearMonthOfDeath = _.toNumber(recordJson.yearOfDeath.toString() + recordJson.monthOfDeath.toString());
        }
      }

      // Set dates
      if (obj['Date of Death'] && obj['Date of Death'] !== '') {
        var death1 = moment(obj['Date of Death'], 'M/D/YY');
        if (recordJson.yearOfDeath && recordJson.yearOfDeath > 0 && recordJson.yearOfDeath !== death1.year()) {
          death1.year(recordJson.yearOfDeath);
        }
        recordJson.dateOfDeath = death1.startOf('day').toDate();
      }
      if (obj['Date of Birth'] && obj['Date of Birth'] !== '') {
        var birth1 = moment(obj['Date of Birth'], 'M/D/YY');
        if (recordJson.yearOfBirth && recordJson.yearOfBirth > 0 && recordJson.yearOfBirth !== birth1.year()) {
          birth1.year(recordJson.yearOfBirth);
        }
        recordJson.dateOfBirth = birth1.startOf('day').toDate();
      }
      if (obj['Report Signed Date'] && obj['Report Signed Date'] !== '') recordJson.reportSignedDate = moment(obj['Report Signed Date'], 'M/D/YY').startOf('day').toDate();

      // Set Age
      var ageStr = _.lowerCase(obj.Age);
      var dayPattern = /day/i;
      var monthPattern = /mo/i;
      if (ageStr === '' && recordJson.dateOfDeath && recordJson.dateOfBirth) {
        var birth2 = moment(recordJson.dateOfBirth);
        var death2 = moment(recordJson.dateOfDeath);
        var duration = moment.duration(death2.diff(birth2));
        recordJson.ageInYearsAtDeath = Math.round(duration.asYears());
      } else if (!ageStr || ageStr === '' || dayPattern.test(ageStr) || monthPattern.test(ageStr)) {
        recordJson.ageInYearsAtDeath = 0;
      } else {
        var years = ageStr.replace(/years/i, '');
        years = _.trim(years);
        recordJson.ageInYearsAtDeath = _.toNumber(years);
      }

      // Set Manner
      var mannerStr = obj.Manner;
      var naturalPattern = /Natural/i;
      var homicidePattern = /Homicide/i;
      var undeterminedPattern = /Undetermined/i;
      var accidentPattern = /Accident/i;
      var suicidePattern = /Suicide/i;
      if (naturalPattern.test(mannerStr)) {
        recordJson.mannerOfDeath = 'Natural';
      } else if (homicidePattern.test(mannerStr)) {
        recordJson.mannerOfDeath = 'Homicide';
      } else if (undeterminedPattern.test(mannerStr)) {
        recordJson.mannerOfDeath = 'Undetermined';
      } else if (accidentPattern.test(mannerStr)) {
        recordJson.mannerOfDeath = 'Accident';
      } else if (suicidePattern.test(mannerStr)) {
        recordJson.mannerOfDeath = 'Suicide';
      } else {
        recordJson.mannerOfDeath = 'Missing';
      }

      // Determine if the death was drug related
      var codStr = recordJson.causeOfDeath;
      var drugRelatedDescriptionPattern = /(poison)|(intoxic)|(intoxicat)|(inxtoxication)|(toxicity)|(inhalat)|(ingest)|(overdose)|(exposure)|(chemical)|(effects)|(cocaine use)/i;
      if (codStr && codStr !== '' && (recordJson.mannerOfDeath === 'Undetermined' || recordJson.mannerOfDeath === 'Accident') &&
      drugRelatedDescriptionPattern.test(codStr)) {
        if (!codStr.includes('smoke inhalation and thermal injuries') &&
        !codStr.includes('thermal injuries and smoke inhalation')) {
          recordJson.drugRelated = {
            isDrugRelated: true
          };
          recordJson.mannerOfDeath = 'Suspected Overdose';
        } else {
          recordJson.drugRelated = {
            isDrugRelated: false
          };
        }
      } else {
        recordJson.drugRelated = {
          isDrugRelated: false
        };
      }

      // Find drugs involved, if applicable
      var otherStr = obj['Other significant condition'];
      if (recordJson.mannerOfDeath === 'Undetermined' || recordJson.mannerOfDeath === 'Accident' || recordJson.mannerOfDeath === 'Suspected Overdose') {
        if (!recordJson.drugRelated) {
          recordJson.drugRelated = {};
        }
        var drugsInvolved = [];
        var checkForDrugInString = function(string) {
          _.mapKeys(exports.drugMappingPatterns, function(patterns, key) {
            if (_.isArray(patterns)) {
              _.forEach(patterns, function(pattern) {
                if (pattern.test(string)) {
                  drugsInvolved.push(key);
                }
              });
            }
          });
        };

        if (codStr && codStr !== '') {
          checkForDrugInString(codStr);
        }
        if (otherStr && otherStr !== '') {
          checkForDrugInString(otherStr);
        }
        recordJson.drugRelated.drugsInvolved = _.uniq(drugsInvolved);
      }

      // Possible hypothermia
      var hypothermiaPattern = /hypothermia/i;
      if (codStr && codStr !== '' && hypothermiaPattern.test(codStr)) {
        if (!recordJson.otherCauses) {
          recordJson.otherCauses = {};
        }
        recordJson.otherCauses.possHypothermia = true;
      }

      // Possible Carbon Monoxide
      var carbonPattern = /carbon/i;
      if (codStr && codStr !== '' && carbonPattern.test(codStr)) {
        if (!recordJson.otherCauses) {
          recordJson.otherCauses = {};
        }
        recordJson.otherCauses.possCarbonMonoxide = true;
      }


      if (!record || !record.residenceLocation || !record.residenceLocation.latitude || !record.residenceLocation.longitude ||
        !record.residenceLocation.addressString || !recordJson.residenceLocation.latitude || !recordJson.residenceLocation.longitude) {
        var residenceResponse;
        if (recordJson.residenceLocation.street && recordJson.residenceLocation.city) {
          residenceResponse = Geocode.geocode({
            address: recordJson.residenceLocation.street + ', ' + recordJson.residenceLocation.city + ', ' +
              recordJson.residenceLocation.state + ' ' + recordJson.residenceLocation.zipcode,
            root: config.mapzen.apiRoot,
            api_key: config.mapzen.apiKey
          });
        }
        if (residenceResponse && residenceResponse.features && residenceResponse.features[0] && residenceResponse.features[0].properties && residenceResponse.features[0].properties.match_type !== 'fallback') {
          if (residenceResponse.features[0].geometry && residenceResponse.features[0].geometry.coordinates) {
            recordJson.residenceLocation.longitude = residenceResponse.features[0].geometry.coordinates[0];
            recordJson.residenceLocation.latitude = residenceResponse.features[0].geometry.coordinates[1];
          }
          if (residenceResponse.features[0].properties && residenceResponse.features[0].properties.label) {
            recordJson.residenceLocation.addressString = residenceResponse.features[0].properties.label;
          }
        }
      }

      if (!record || !record.incidentLocation || !record.incidentLocation.latitude || !record.incidentLocation.longitude ||
        !record.incidentLocation.addressString || !recordJson.incidentLocation.latitude || !recordJson.incidentLocation.longitude) {
        var incidentResponse;
        if (recordJson.incidentLocation.street && recordJson.incidentLocation.city) {
          incidentResponse = Geocode.geocode({
            address: recordJson.incidentLocation.street + ', ' + recordJson.incidentLocation.city + ', ' +
              recordJson.incidentLocation.state + ' ' + recordJson.incidentLocation.zipcode,
            root: config.mapzen.apiRoot,
            api_key: config.mapzen.apiKey
          });
        }
        if (incidentResponse && incidentResponse.features && incidentResponse.features[0]  && incidentResponse.features[0].properties && incidentResponse.features[0].properties.match_type !== 'fallback') {
          if (incidentResponse.features[0].geometry && incidentResponse.features[0].geometry.coordinates) {
            recordJson.incidentLocation.longitude = incidentResponse.features[0].geometry.coordinates[0];
            recordJson.incidentLocation.latitude = incidentResponse.features[0].geometry.coordinates[1];
          }
          if (incidentResponse.features[0].properties && incidentResponse.features[0].properties.label) {
            recordJson.incidentLocation.addressString = incidentResponse.features[0].properties.label;
          }
        }
      }

      var getResidenceCensusTract = function(recordJson, overwrite, callback) {
        if (overwrite) {
          GeoHandler.censusTractFromIntersectsInternal(recordJson.residenceLocation.longitude,
          recordJson.residenceLocation.latitude, function(residenceCT) {
            if (residenceCT.censusTract && residenceCT.totalPopulation2010) {
              recordJson.residenceLocation.censusTract = residenceCT.censusTract;
              recordJson.residenceLocation.totalPopulation2010 = residenceCT.totalPopulation2010;
            }
            callback();
          });
        } else {
          callback();
        }
      };

      var getIncidentCensusTract = function(recordJson, overwrite, callback) {
        if (overwrite) {
          GeoHandler.censusTractFromIntersectsInternal(recordJson.incidentLocation.longitude,
          recordJson.incidentLocation.latitude, function(incidentCT) {
            if (incidentCT.censusTract && incidentCT.totalPopulation2010) {
              recordJson.incidentLocation.censusTract = incidentCT.censusTract;
              recordJson.incidentLocation.totalPopulation2010 = incidentCT.totalPopulation2010;
            }
            callback();
          });
        } else {
          callback();
        }
      };

      getResidenceCensusTract(recordJson, (!record || !record.residenceLocation || !record.residenceLocation.censusTract || !record.residenceLocation.totalPopulation2010), function() {
        getIncidentCensusTract(recordJson, (!record || !record.incidentLocation || !record.incidentLocation.censusTract  || !record.incidentLocation.totalPopulation2010), function() {
          if (record) {
            record = _.extend(record, recordJson);
          } else {
            record = new DeathRecord(recordJson);
          }

          // set the save precision of lat/lng values
          // if the pii_safe flag is true, lower the latlng save precision
          if (config.db.pii_safe) {
            var latlng_precision = config.db.pii_safe_latlng_precision;
            if (record.incidentLocation.longitude && record.incidentLocation.latitude){
              record.incidentLocation.longitude = record.incidentLocation.longitude.toFixed(latlng_precision, 10);
              record.incidentLocation.latitude = record.incidentLocation.latitude.toFixed(latlng_precision, 10);
            }

            if (record.residenceLocation.longitude && record.residenceLocation.latitude){
              record.residenceLocation.longitude = record.residenceLocation.longitude.toFixed(latlng_precision, 10);
              record.residenceLocation.latitude = record.residenceLocation.latitude.toFixed(latlng_precision, 10);
            }
          }

          record.save(function(err) {
            callback(err, record);
          });
        });
      });
    }
  });
};
