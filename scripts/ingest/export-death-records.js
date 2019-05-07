'use strict';

var moment = require('moment'),
  path = require('path'),
  config = require('../../config/config'),
  mongoose = require('../../config/lib/mongoose'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  csv = require('fast-csv'),
  async = require('async'),
  fs = require('fs'),
  _ = require('lodash');

var db;
var DeathRecord;

// output schema definition
var flat_and_sanitary_query = [
  {
    $project: {
      'yearOfDeath': '$yearOfDeath',
      'monthOfDeath': '$monthOfDeath',
      'otherSignificantCondition': '$otherSignificantCondition',
      'injuryDescription': '$injuryDescription',
      'causeOfDeath': '$causeOfDeath',
      'mannerOfDeath': '$mannerOfDeath',
      'incident_longitude': '$incidentLocation.longitude',
      'incident_latitude': '$incidentLocation.latitude',
      'incident_censusTract': '$incidentLocation.censusTract',
      'residence_longitude': '$residenceLocation.longitude',
      'residence_latitude': '$residenceLocation.latitude',
      'residence_censusTract': '$residenceLocation.censusTract',
      'isDrugRelated': '$drugRelated.isDrugRelated',
      'drugsInvolved': '$drugRelated.drugsInvolved'
    }
  }
];


// return all death records flattened and sanitized for postgres
// mode can be 'json' or 'csv'
var exportDeathRecords = function(mode = 'csv', filename) {
  var res;
  mode = mode || 'json';
  console.log('query db')
  DeathRecord.aggregate(flat_and_sanitary_query).exec(function(err, results) {
    console.log('agg, here')
    if (err) {
      console.log('ERROR: ', errorHandler.getErrorMessage(err));
    } else {
      var output = []
      if (mode === 'csv') {
        var headers = 'yearOfDeath|monthOfDeath|otherSignificantCondition|injuryDescription|causeOfDeath|mannerOfDeath|incident_longitude|incident_latitude|incident_censusTract|residence_longitude|residence_latitude|residence_censusTract|isDrugRelated|drugsInvolved';
        output.push(headers);
        results.forEach(function(u) {
          var row = u.yearOfDeath + "|" + u.monthOfDeath + "|" + u.otherSignificantCondition + "|" + u.injuryDescription + "|" + u.causeOfDeath + "|" + u.mannerOfDeath + "|" + u.incident_longitude + "|" + u.incident_latitude + "|" + "\'" + u.incident_censusTract + "\'" + "|" + u.residence_longitude + "|" + u.residence_latitude + "|" + "\'" + u.residence_censusTract + "\'" + "|" + u.isDrugRelated + "|" + u.drugsInvolved; // eslint-disable-line quotes
          row = row.replace(/\;/g, ' ');
          row = row.replace(/\n/g, ' ');
          row = row.replace(/\"/g, ' ');
          row = row.replace(/'undefined'/g, 'NULL');
          row = row.replace(/undefined/g, 'NULL');
          output.push(row);
        });
        output = output.join('\n');
      } else {
        output = JSON.stringify(results);
      }
      if (filename) {
        console.log('writing to ' | filename);
        fs.writeFileSync(filename, output);
      } else {
        console.log(output);
      }
    }
    console.log('Done');
    exitMongoose();
  });
};

if (process.argv.length > 1) {
  var outFile = process.argv[2];
  console.log(`attempting to export death-records to ${outFile}`);
  mongoose.connect(function(internal) {
    db = internal;
    require(path.resolve('modules/death-records/server/models/death-record.server.model.js'));
    DeathRecord = db.model('DeathRecord');
    exportDeathRecords('csv', outFile);
  });
} else {
  console.error('must provide an export file name');
  process.exit(1);
}

var exitMongoose = function(){
  mongoose.disconnect(function() {
    console.log('closing');
    process.exit(0);
  });
};
