'use strict';

describe('Death records E2E Tests:', function () {
  describe('Test Death records page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/death-records');
      expect(element.all(by.repeater('death-record in death-records')).count()).toEqual(0);
    });
  });
});
