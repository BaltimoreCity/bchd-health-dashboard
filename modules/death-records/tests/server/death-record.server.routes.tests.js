'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  DeathRecord = mongoose.model('DeathRecord'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  deathRecord;

/**
 * Death record routes tests
 */
describe('Death record CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Death record
    user.save(function () {
      deathRecord = {
        name: 'Death record name'
      };

      done();
    });
  });

  it('should be able to save a Death record if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Death record
        agent.post('/api/deathRecords')
          .send(deathRecord)
          .expect(200)
          .end(function (deathRecordSaveErr, deathRecordSaveRes) {
            // Handle Death record save error
            if (deathRecordSaveErr) {
              return done(deathRecordSaveErr);
            }

            // Get a list of Death records
            agent.get('/api/deathRecords')
              .end(function (deathRecordsGetErr, deathRecordsGetRes) {
                // Handle Death records save error
                if (deathRecordsGetErr) {
                  return done(deathRecordsGetErr);
                }

                // Get Death records list
                var deathRecords = deathRecordsGetRes.body;

                // Set assertions
                (deathRecords[0].user._id).should.equal(userId);
                (deathRecords[0].name).should.match('Death record name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Death record if not logged in', function (done) {
    agent.post('/api/deathRecords')
      .send(deathRecord)
      .expect(403)
      .end(function (deathRecordSaveErr, deathRecordSaveRes) {
        // Call the assertion callback
        done(deathRecordSaveErr);
      });
  });

  it('should not be able to save an Death record if no name is provided', function (done) {
    // Invalidate name field
    deathRecord.name = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Death record
        agent.post('/api/deathRecords')
          .send(deathRecord)
          .expect(400)
          .end(function (deathRecordSaveErr, deathRecordSaveRes) {
            // Set message assertion
            (deathRecordSaveRes.body.message).should.match('Please fill Death record name');

            // Handle Death record save error
            done(deathRecordSaveErr);
          });
      });
  });

  it('should be able to update an Death record if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Death record
        agent.post('/api/deathRecords')
          .send(deathRecord)
          .expect(200)
          .end(function (deathRecordSaveErr, deathRecordSaveRes) {
            // Handle Death record save error
            if (deathRecordSaveErr) {
              return done(deathRecordSaveErr);
            }

            // Update Death record name
            deathRecord.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Death record
            agent.put('/api/deathRecords/' + deathRecordSaveRes.body._id)
              .send(deathRecord)
              .expect(200)
              .end(function (deathRecordUpdateErr, deathRecordUpdateRes) {
                // Handle Death record update error
                if (deathRecordUpdateErr) {
                  return done(deathRecordUpdateErr);
                }

                // Set assertions
                (deathRecordUpdateRes.body._id).should.equal(deathRecordSaveRes.body._id);
                (deathRecordUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Death records if not signed in', function (done) {
    // Create new Death record model instance
    var deathRecordObj = new DeathRecord(deathRecord);

    // Save the deathRecord
    deathRecordObj.save(function () {
      // Request Death records
      request(app).get('/api/deathRecords')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Death record if not signed in', function (done) {
    // Create new Death record model instance
    var deathRecordObj = new DeathRecord(deathRecord);

    // Save the Death record
    deathRecordObj.save(function () {
      request(app).get('/api/deathRecords/' + deathRecordObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', deathRecord.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Death record with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/deathRecords/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Death record is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Death record which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Death record
    request(app).get('/api/deathRecords/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Death record with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Death record if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Death record
        agent.post('/api/deathRecords')
          .send(deathRecord)
          .expect(200)
          .end(function (deathRecordSaveErr, deathRecordSaveRes) {
            // Handle Death record save error
            if (deathRecordSaveErr) {
              return done(deathRecordSaveErr);
            }

            // Delete an existing Death record
            agent.delete('/api/deathRecords/' + deathRecordSaveRes.body._id)
              .send(deathRecord)
              .expect(200)
              .end(function (deathRecordDeleteErr, deathRecordDeleteRes) {
                // Handle deathRecord error error
                if (deathRecordDeleteErr) {
                  return done(deathRecordDeleteErr);
                }

                // Set assertions
                (deathRecordDeleteRes.body._id).should.equal(deathRecordSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Death record if not signed in', function (done) {
    // Set Death record user
    deathRecord.user = user;

    // Create new Death record model instance
    var deathRecordObj = new DeathRecord(deathRecord);

    // Save the Death record
    deathRecordObj.save(function () {
      // Try deleting Death record
      request(app).delete('/api/deathRecords/' + deathRecordObj._id)
        .expect(403)
        .end(function (deathRecordDeleteErr, deathRecordDeleteRes) {
          // Set message assertion
          (deathRecordDeleteRes.body.message).should.match('User is not authorized');

          // Handle Death record error error
          done(deathRecordDeleteErr);
        });

    });
  });

  it('should be able to get a single Death record that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new Death record
          agent.post('/api/deathRecords')
            .send(deathRecord)
            .expect(200)
            .end(function (deathRecordSaveErr, deathRecordSaveRes) {
              // Handle Death record save error
              if (deathRecordSaveErr) {
                return done(deathRecordSaveErr);
              }

              // Set assertions on new Death record
              (deathRecordSaveRes.body.name).should.equal(deathRecord.name);
              should.exist(deathRecordSaveRes.body.user);
              should.equal(deathRecordSaveRes.body.user._id, orphanId);

              // force the Death record to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the Death record
                    agent.get('/api/deathRecords/' + deathRecordSaveRes.body._id)
                      .expect(200)
                      .end(function (deathRecordInfoErr, deathRecordInfoRes) {
                        // Handle Death record error
                        if (deathRecordInfoErr) {
                          return done(deathRecordInfoErr);
                        }

                        // Set assertions
                        (deathRecordInfoRes.body._id).should.equal(deathRecordSaveRes.body._id);
                        (deathRecordInfoRes.body.name).should.equal(deathRecord.name);
                        should.equal(deathRecordInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      DeathRecord.remove().exec(done);
    });
  });
});
