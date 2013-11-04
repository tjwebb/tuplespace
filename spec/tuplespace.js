var T = require('../t.js'),
  assert = require('chai').assert;

describe('T.space', function () {
  describe('sanity', function () {
    it('exists', function () {
      assert.ok(T);
      assert.ok(T.Space);
    });
  });
});
