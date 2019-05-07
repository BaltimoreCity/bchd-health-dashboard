'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  DeathRecord = mongoose.model('DeathRecord');

/**
 * Globals
 */
var user,
  deathRecord;

/**
 * Unit tests
 */
describe('Death record Model Unit Tests:', function() {
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
      deathRecord = new DeathRecord({
        name: 'Death record Name',
        user: user
      });

      done();
    });
  });

  describe('Method Save', function() {
    it('should be able to save without problems', function(done) {
      this.timeout(0);
      return deathRecord.save(function(err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without name', function(done) {
      deathRecord.name = '';

      return deathRecord.save(function(err) {
        should.exist(err);
        done();
      });
    });
  });

  afterEach(function(done) {
    DeathRecord.remove().exec(function() {
      User.remove().exec(function() {
        done();
      });
    });
  });
});
