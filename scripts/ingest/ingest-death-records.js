'use strict';

var csv = require('fast-csv'),
  chalk = require('chalk'),
  path = require('path'),
  config = require('../../config/config'),
  mongoose = require('../../config/lib/mongoose'),
  deathRecordHandler = require('./death-records-csv-to-json'),
  async = require('async'),
  fs = require('fs'),
  _ = require('lodash');

var db;

var convertFromFilename = function(filename, headerArray, callback) {
  var objects = [];

  var row = 0;
  csv.fromPath(filename, {
    headers: headerArray,
    discardUnmappedColumns: true
  }).on('data', function (obj) {
    if (row > 0) {
      objects.push(obj);
    }
    row++;
  }).on('end', function() {
    callback(objects);
  });
};

if (process.argv.length > 2) {
  var filename = process.argv[2];
  var timeout = process.argv[3] || 200;
  console.log('filename', filename);
  console.log('timeout', timeout);
  mongoose.connect(function(internal) {
    db = internal;
    require(path.resolve('modules/death-records/server/models/death-record.server.model.js'));
    var DeathRecord = db.model('DeathRecord');

    convertFromFilename(filename, deathRecordHandler.headerArray, function(records) {
      console.log('records: ' + records.length);
      var ingestLoop = function(index, records, callback) {
        if (index < records.length) {
          var item = records[index];
          setTimeout(function() {
            if (index%10 === 0) {console.log('ingested rows:', index)}
            deathRecordHandler.saveObjToDatabase(item, function(err, dbObj) {
              ingestLoop((index + 1), records, callback);
            });
          }, parseInt(timeout, 10));
        } else {
          callback();
        }
      };

      ingestLoop(0, records, function() {
        mongoose.disconnect(function() {
          process.exit(0);
        });
      });
    });
  });
} else {
  console.error('must provide a csv file to import');
  process.exit(1);
}

process.on('SIGINT', function() {
  console.log('closing');
  mongoose.disconnect(function () {
    process.exit(0);
  });
});
