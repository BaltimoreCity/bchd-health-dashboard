'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  CauseOfDeath = mongoose.model('CauseOfDeath'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  causeOfDeath;

/**
 * Cause of death routes tests
 */
describe('Cause of death CRUD tests', function () {

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

    // Save a user to the test db and create new Cause of death
    user.save(function () {
      causeOfDeath = {
        name: 'Cause of death name'
      };

      done();
    });
  });

  it('should be able to save a Cause of death if logged in', function (done) {
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

        // Save a new Cause of death
        agent.post('/api/causeOfDeaths')
          .send(causeOfDeath)
          .expect(200)
          .end(function (causeOfDeathSaveErr, causeOfDeathSaveRes) {
            // Handle Cause of death save error
            if (causeOfDeathSaveErr) {
              return done(causeOfDeathSaveErr);
            }

            // Get a list of Cause of deaths
            agent.get('/api/causeOfDeaths')
              .end(function (causeOfDeathsGetErr, causeOfDeathsGetRes) {
                // Handle Cause of deaths save error
                if (causeOfDeathsGetErr) {
                  return done(causeOfDeathsGetErr);
                }

                // Get Cause of deaths list
                var causeOfDeaths = causeOfDeathsGetRes.body;

                // Set assertions
                (causeOfDeaths[0].user._id).should.equal(userId);
                (causeOfDeaths[0].name).should.match('Cause of death name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Cause of death if not logged in', function (done) {
    agent.post('/api/causeOfDeaths')
      .send(causeOfDeath)
      .expect(403)
      .end(function (causeOfDeathSaveErr, causeOfDeathSaveRes) {
        // Call the assertion callback
        done(causeOfDeathSaveErr);
      });
  });

  it('should not be able to save an Cause of death if no name is provided', function (done) {
    // Invalidate name field
    causeOfDeath.name = '';

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

        // Save a new Cause of death
        agent.post('/api/causeOfDeaths')
          .send(causeOfDeath)
          .expect(400)
          .end(function (causeOfDeathSaveErr, causeOfDeathSaveRes) {
            // Set message assertion
            (causeOfDeathSaveRes.body.message).should.match('Please fill Cause of death name');

            // Handle Cause of death save error
            done(causeOfDeathSaveErr);
          });
      });
  });

  it('should be able to update an Cause of death if signed in', function (done) {
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

        // Save a new Cause of death
        agent.post('/api/causeOfDeaths')
          .send(causeOfDeath)
          .expect(200)
          .end(function (causeOfDeathSaveErr, causeOfDeathSaveRes) {
            // Handle Cause of death save error
            if (causeOfDeathSaveErr) {
              return done(causeOfDeathSaveErr);
            }

            // Update Cause of death name
            causeOfDeath.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Cause of death
            agent.put('/api/causeOfDeaths/' + causeOfDeathSaveRes.body._id)
              .send(causeOfDeath)
              .expect(200)
              .end(function (causeOfDeathUpdateErr, causeOfDeathUpdateRes) {
                // Handle Cause of death update error
                if (causeOfDeathUpdateErr) {
                  return done(causeOfDeathUpdateErr);
                }

                // Set assertions
                (causeOfDeathUpdateRes.body._id).should.equal(causeOfDeathSaveRes.body._id);
                (causeOfDeathUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Cause of deaths if not signed in', function (done) {
    // Create new Cause of death model instance
    var causeOfDeathObj = new CauseOfDeath(causeOfDeath);

    // Save the causeOfDeath
    causeOfDeathObj.save(function () {
      // Request Cause of deaths
      request(app).get('/api/causeOfDeaths')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Cause of death if not signed in', function (done) {
    // Create new Cause of death model instance
    var causeOfDeathObj = new CauseOfDeath(causeOfDeath);

    // Save the Cause of death
    causeOfDeathObj.save(function () {
      request(app).get('/api/causeOfDeaths/' + causeOfDeathObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', causeOfDeath.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Cause of death with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/causeOfDeaths/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Cause of death is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Cause of death which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Cause of death
    request(app).get('/api/causeOfDeaths/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Cause of death with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Cause of death if signed in', function (done) {
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

        // Save a new Cause of death
        agent.post('/api/causeOfDeaths')
          .send(causeOfDeath)
          .expect(200)
          .end(function (causeOfDeathSaveErr, causeOfDeathSaveRes) {
            // Handle Cause of death save error
            if (causeOfDeathSaveErr) {
              return done(causeOfDeathSaveErr);
            }

            // Delete an existing Cause of death
            agent.delete('/api/causeOfDeaths/' + causeOfDeathSaveRes.body._id)
              .send(causeOfDeath)
              .expect(200)
              .end(function (causeOfDeathDeleteErr, causeOfDeathDeleteRes) {
                // Handle causeOfDeath error error
                if (causeOfDeathDeleteErr) {
                  return done(causeOfDeathDeleteErr);
                }

                // Set assertions
                (causeOfDeathDeleteRes.body._id).should.equal(causeOfDeathSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Cause of death if not signed in', function (done) {
    // Set Cause of death user
    causeOfDeath.user = user;

    // Create new Cause of death model instance
    var causeOfDeathObj = new CauseOfDeath(causeOfDeath);

    // Save the Cause of death
    causeOfDeathObj.save(function () {
      // Try deleting Cause of death
      request(app).delete('/api/causeOfDeaths/' + causeOfDeathObj._id)
        .expect(403)
        .end(function (causeOfDeathDeleteErr, causeOfDeathDeleteRes) {
          // Set message assertion
          (causeOfDeathDeleteRes.body.message).should.match('User is not authorized');

          // Handle Cause of death error error
          done(causeOfDeathDeleteErr);
        });

    });
  });

  it('should be able to get a single Cause of death that has an orphaned user reference', function (done) {
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

          // Save a new Cause of death
          agent.post('/api/causeOfDeaths')
            .send(causeOfDeath)
            .expect(200)
            .end(function (causeOfDeathSaveErr, causeOfDeathSaveRes) {
              // Handle Cause of death save error
              if (causeOfDeathSaveErr) {
                return done(causeOfDeathSaveErr);
              }

              // Set assertions on new Cause of death
              (causeOfDeathSaveRes.body.name).should.equal(causeOfDeath.name);
              should.exist(causeOfDeathSaveRes.body.user);
              should.equal(causeOfDeathSaveRes.body.user._id, orphanId);

              // force the Cause of death to have an orphaned user reference
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

                    // Get the Cause of death
                    agent.get('/api/causeOfDeaths/' + causeOfDeathSaveRes.body._id)
                      .expect(200)
                      .end(function (causeOfDeathInfoErr, causeOfDeathInfoRes) {
                        // Handle Cause of death error
                        if (causeOfDeathInfoErr) {
                          return done(causeOfDeathInfoErr);
                        }

                        // Set assertions
                        (causeOfDeathInfoRes.body._id).should.equal(causeOfDeathSaveRes.body._id);
                        (causeOfDeathInfoRes.body.name).should.equal(causeOfDeath.name);
                        should.equal(causeOfDeathInfoRes.body.user, undefined);

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
      CauseOfDeath.remove().exec(done);
    });
  });
});
