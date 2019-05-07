'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  CauseOfDeath = mongoose.model('CauseOfDeath');

/**
 * Globals
 */
var user,
  causeOfDeath;

/**
 * Unit tests
 */
describe('Cause of death Model Unit Tests:', function() {
  beforeEach(function(done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'password'
    });

    user.save(function() {
      causeOfDeath = new CauseOfDeath({
        name: 'Cause of death Name',
        user: user
      });

      done();
    });
  });

  describe('Method Save', function() {
    it('should be able to save without problems', function(done) {
      this.timeout(0);
      return causeOfDeath.save(function(err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without name', function(done) {
      causeOfDeath.name = '';

      return causeOfDeath.save(function(err) {
        should.exist(err);
        done();
      });
    });
  });

  afterEach(function(done) {
    CauseOfDeath.remove().exec(function() {
      User.remove().exec(function() {
        done();
      });
    });
  });
});
