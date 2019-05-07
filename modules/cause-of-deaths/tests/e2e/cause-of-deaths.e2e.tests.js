'use strict';

describe('Cause of deaths E2E Tests:', function () {
  describe('Test Cause of deaths page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/cause-of-deaths');
      expect(element.all(by.repeater('cause-of-death in cause-of-deaths')).count()).toEqual(0);
    });
  });
});
