'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  config = require('../../config/config'),
  mongoose = require('../../config/lib/mongoose'),
  deathRecordHandler = require('./death-records-csv-to-json'),
  moment = require('moment'),
  _ = require('lodash');

var db,
  DeathRecord,
  deathRecord;

var csvObj = {
  'Case Number': '46-1580',
  'Case Type': 'Partial Autopsy',
  'Last Name': 'Izito',
  'First Name': 'Wrbk',
  'Middle': 'Y',
  'Suffix': '',
  'Year of Death': '2008',
  'Month of Death': '11',
  'Date of Death': '',
  'Sex': 'Female',
  'Race': 'African American',
  'Age': '76 Years',
  'Date of Birth': '11/1/32',
  'Year of Birth': '1932',
  'Res. Street': '',
  'Res. City': 'Baltimore City',
  'Res. County': 'Baltimore City',
  'Res. State': 'MD',
  'Res. ZIPCODE': '21214',
  'Homeless': 'No',
  'COD': 'Metastatic Breast Cancer',
  'Other significant condition': 'Hypertensive Atherosclerotic Cardiovascular Disease',
  'Manner': 'Natural',
  'Incident Street': '',
  'Incident City': 'Baltimore City',
  'Incident County': 'Baltimore City',
  'Incident State': 'MD',
  'Incident ZIPDCODE': '21213',
  'Injury Description': '',
  'Report Signed Date': '11/29/08'
};

/**
 * Death record ingest tests
 */
describe('Death record ingest tests', function() {
  before(function (done) {
    mongoose.connect(function(internal) {
      db = internal;
      require(path.resolve('modules/death-records/server/models/death-record.server.model.js'));
      DeathRecord = db.model('DeathRecord');
      done();
    });
  });

  it('should be able to add a death record', function (done) {
    deathRecordHandler.saveObjToDatabase(csvObj, function(err, dbObj) {
      should.not.exist(err);
      done();
    });
  });

  it('should be able to add a minimum death record', function (done) {
    var copyObj = Object.create(csvObj);
    copyObj.Middle = '';
    copyObj.Suffix = '';
    copyObj['Date of Death'] = '';
    copyObj['Res. Street'] = '';
    copyObj['Res. City'] = '';
    copyObj['Res. County'] = '';
    copyObj['Res. State'] = '';
    copyObj['Res. ZIPCODE'] = '';
    copyObj['Other significant condition'] = '';
    copyObj['Incident Street'] = '';
    copyObj['Incident City'] = '';
    copyObj['Incident County'] = '';
    copyObj['Incident State'] = '';
    copyObj['Incident ZIPDCODE'] = '';
    copyObj['Injury Description'] = '';
    copyObj['Report Signed Date'] = '';
    deathRecordHandler.saveObjToDatabase(copyObj, function(err, dbObj) {
      should.not.exist(err);
      done();
    });
  });

  it('should be able to add a date of death before 2000', function (done) {
    var copyObj = Object.create(csvObj);
    copyObj['Date of Death'] = '11/10/99';
    copyObj['Year of Death'] = '1999';
    deathRecordHandler.saveObjToDatabase(copyObj, function(err, dbObj) {
      should.not.exist(err);
      moment('11/10/1999', 'M/D/YYYY').format('MM/DD/YYYY').should.equal(moment(dbObj.dateOfDeath).format('MM/DD/YYYY'));
      done();
    });
  });

  it('should be able to add a date of death after 2000', function (done) {
    var copyObj = Object.create(csvObj);
    copyObj['Date of Death'] = '11/10/08';
    copyObj['Year of Death'] = '2008';
    deathRecordHandler.saveObjToDatabase(copyObj, function(err, dbObj) {
      should.not.exist(err);
      moment('11/10/2008', 'M/D/YYYY').format('MM/DD/YYYY').should.equal(moment(dbObj.dateOfDeath).format('MM/DD/YYYY'));
      done();
    });
  });

  it('should be able to add a date of birth before 2000', function (done) {
    var copyObj = Object.create(csvObj);
    copyObj['Date of Birth'] = '11/1/32';
    copyObj['Year of Birth'] = '1932';
    deathRecordHandler.saveObjToDatabase(copyObj, function(err, dbObj) {
      should.not.exist(err);
      moment('11/1/1932', 'M/D/YYYY').format('MM/DD/YYYY').should.equal(moment(dbObj.dateOfBirth).format('MM/DD/YYYY'));
      done();
    });
  });

  it('should be able to add a date of birth after 2000', function (done) {
    var copyObj = Object.create(csvObj);
    copyObj['Date of Birth'] = '11/1/02';
    copyObj['Year of Birth'] = '2002';
    deathRecordHandler.saveObjToDatabase(copyObj, function(err, dbObj) {
      should.not.exist(err);
      moment('11/1/2002', 'M/D/YYYY').format('MM/DD/YYYY').should.equal(moment(dbObj.dateOfBirth).format('MM/DD/YYYY'));
      done();
    });
  });

  it('should be able to add a report signed date', function (done) {
    var copyObj = Object.create(csvObj);
    copyObj['Report Signed Date'] = '11/29/08';
    deathRecordHandler.saveObjToDatabase(copyObj, function(err, dbObj) {
      should.not.exist(err);
      moment('11/29/08', 'M/D/YY').format('MM/DD/YYYY').should.equal(moment(dbObj.reportSignedDate).format('MM/DD/YYYY'));
      done();
    });
  });

  it('should be able to convert years at death to a number', function (done) {
    var copyObj = Object.create(csvObj);
    copyObj['Year of Birth'] = '1932';
    copyObj['Date of Birth'] = '11/1/32';
    copyObj.Age = '76 years';
    deathRecordHandler.saveObjToDatabase(copyObj, function(err, dbObj) {
      should.not.exist(err);
      var age = 76;
      age.should.equal(dbObj.ageInYearsAtDeath);
      done();
    });
  });

  it('should be able to convert younger than a year at death to a number', function (done) {
    var copyObj = Object.create(csvObj);
    copyObj['Year of Birth'] = '2008';
    copyObj['Date of Birth'] = '6/1/08';
    copyObj.Age = '5 mo';
    deathRecordHandler.saveObjToDatabase(copyObj, function(err, dbObj) {
      should.not.exist(err);
      var age = 0;
      age.should.equal(dbObj.ageInYearsAtDeath);
      done();
    });
  });

  it('should be able to convert younger than a month at death to a number', function (done) {
    var copyObj = Object.create(csvObj);
    copyObj['Year of Birth'] = '2008';
    copyObj['Date of Birth'] = '10/14/08';
    copyObj.Age = '27 day';
    deathRecordHandler.saveObjToDatabase(copyObj, function(err, dbObj) {
      should.not.exist(err);
      var age = 0;
      age.should.equal(dbObj.ageInYearsAtDeath);
      done();
    });
  });

  it('should be able to convert no years at death to a number', function (done) {
    var copyObj = Object.create(csvObj);
    copyObj['Year of Birth'] = '1932';
    copyObj['Date of Birth'] = '11/1/32';
    copyObj['Date of Death'] = '11/10/08';
    copyObj.Age = '';
    deathRecordHandler.saveObjToDatabase(copyObj, function(err, dbObj) {
      should.not.exist(err);
      var age = 76;
      age.should.equal(dbObj.ageInYearsAtDeath);
      done();
    });
  });

  it('should be able to handle an empty manner', function (done) {
    var copyObj = Object.create(csvObj);
    copyObj.Manner = '';
    deathRecordHandler.saveObjToDatabase(copyObj, function(err, dbObj) {
      should.not.exist(err);
      'Missing'.should.equal(dbObj.mannerOfDeath);
      done();
    });
  });

  it('should be able to handle N/A manner', function (done) {
    var copyObj = Object.create(csvObj);
    copyObj.Manner = 'Not Applicable';
    deathRecordHandler.saveObjToDatabase(copyObj, function(err, dbObj) {
      should.not.exist(err);
      'Missing'.should.equal(dbObj.mannerOfDeath);
      done();
    });
  });

  it('should be able to handle pending manner', function (done) {
    var copyObj = Object.create(csvObj);
    copyObj.Manner = 'Pending';
    deathRecordHandler.saveObjToDatabase(copyObj, function(err, dbObj) {
      should.not.exist(err);
      'Missing'.should.equal(dbObj.mannerOfDeath);
      done();
    });
  });

  it('should be able to determine if death was drug related and undetermined', function (done) {
    var copyObj = Object.create(csvObj);
    copyObj.Manner = 'Undetermined';
    copyObj.COD = 'Narcotic (Heroin) Intoxication and Cocaine Intoxication';
    deathRecordHandler.saveObjToDatabase(copyObj, function(err, dbObj) {
      should.not.exist(err);
      (dbObj.drugRelated.isDrugRelated).should.be.true();
      done();
    });
  });

  it('should be able to determine if death was drug related and an accident', function (done) {
    var copyObj = Object.create(csvObj);
    copyObj.Manner = 'Accident';
    copyObj.COD = 'Alcohol, Fentanyl and Morphine Intoxication';
    deathRecordHandler.saveObjToDatabase(copyObj, function(err, dbObj) {
      should.not.exist(err);
      (dbObj.drugRelated.isDrugRelated).should.be.true();
      done();
    });
  });

  it('should be able to determine a death was not drug related if it was fire', function (done) {
    var copyObj = Object.create(csvObj);
    copyObj.Manner = 'Accident';
    copyObj.COD = 'Death by smoke inhalation and thermal injuries';
    deathRecordHandler.saveObjToDatabase(copyObj, function(err, dbObj) {
      should.not.exist(err);
      (dbObj.drugRelated.isDrugRelated).should.be.false();
      done();
    });
  });

  it('should be able to determine a death was not drug realted if it was fire 2', function (done) {
    var copyObj = Object.create(csvObj);
    copyObj.Manner = 'Accident';
    copyObj.COD = 'Death from thermal injuries and smoke inhalation';
    deathRecordHandler.saveObjToDatabase(copyObj, function(err, dbObj) {
      should.not.exist(err);
      (dbObj.drugRelated.isDrugRelated).should.be.false();
      done();
    });
  });

  it('should not mark natural death with drug related term as drug related', function (done) {
    var copyObj = Object.create(csvObj);
    copyObj.Manner = 'Natural';
    copyObj.COD = 'Cancer related from exposure to sun';
    deathRecordHandler.saveObjToDatabase(copyObj, function(err, dbObj) {
      should.not.exist(err);
      (dbObj.drugRelated.isDrugRelated).should.be.false();
      done();
    });
  });

  it('should determine drugs involved in drug related deaths - fentanyl and wildnil', function (done) {
    var copyObj = Object.create(csvObj);
    copyObj.Manner = 'Accident';
    copyObj.COD = 'Fentanyl and wildnil intoxication';
    deathRecordHandler.saveObjToDatabase(copyObj, function(err, dbObj) {
      should.not.exist(err);
      (dbObj.drugRelated.isDrugRelated).should.be.true();
      var fentanylIndex = _.indexOf(dbObj.drugRelated.drugsInvolved, 'fentanyl');
      var carfentanylIndex = _.indexOf(dbObj.drugRelated.drugsInvolved, 'carfentanyl');
      var wildnilIndex = _.indexOf(dbObj.drugRelated.drugsInvolved, 'wildnil');
      fentanylIndex.should.be.greaterThan(-1);
      carfentanylIndex.should.be.equal(-1);
      wildnilIndex.should.be.greaterThan(-1);
      done();
    });
  });

  it('should determine drugs involved in drug related deaths - carfentanyl', function (done) {
    var copyObj = Object.create(csvObj);
    copyObj.Manner = 'Accident';
    copyObj.COD = 'Carfentanyl intoxication';
    deathRecordHandler.saveObjToDatabase(copyObj, function(err, dbObj) {
      should.not.exist(err);
      (dbObj.drugRelated.isDrugRelated).should.be.true();
      var fentanylIndex = _.indexOf(dbObj.drugRelated.drugsInvolved, 'fentanyl');
      var carfentanylIndex = _.indexOf(dbObj.drugRelated.drugsInvolved, 'carfentanyl');
      var wildnilIndex = _.indexOf(dbObj.drugRelated.drugsInvolved, 'wildnil');
      fentanylIndex.should.be.equal(-1);
      carfentanylIndex.should.be.greaterThan(-1);
      wildnilIndex.should.be.equal(-1);
      done();
    });
  });

  it('should determine if a death was related to hypothermia', function(done) {
    var copyObj = Object.create(csvObj);
    copyObj.COD = 'possible hypothermia';
    deathRecordHandler.saveObjToDatabase(copyObj, function(err, dbObj) {
      should.not.exist(err);
      (dbObj.otherCauses.possHypothermia).should.be.true();
      should.not.exist(dbObj.otherCauses.possCarbonMonoxide);
      done();
    });
  });

  it('should determine if a death was related to carbon monoxide', function(done) {
    var copyObj = Object.create(csvObj);
    copyObj.COD = 'possible carbon monoxide';
    deathRecordHandler.saveObjToDatabase(copyObj, function(err, dbObj) {
      should.not.exist(err);
      (dbObj.otherCauses.possCarbonMonoxide).should.be.true();
      should.not.exist(dbObj.otherCauses.possHypothermia);
      done();
    });
  });

  afterEach(function(done) {
    DeathRecord.remove().exec(function() {
      done();
    });
  });

  after(function(done) {
    mongoose.disconnect(function() {
      done();
    });
  });
});
