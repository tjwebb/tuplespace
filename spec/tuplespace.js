var assert = require('assert'),
  space = require('..'),
  _ = require('lodash');

describe('tuplespace', function () {
  var Tuple = space.Tuple;

  describe('#select', function () {
    before(function () {
      Tuple.create({ foo: 'bar' });
    });
    it('original implementation should still work to spec', function () {
      var found = Tuple.select(function (record) {
        return record.foo === 'bar';
      });
      assert.equal(found.length, 1);
      assert.equal(found[0].foo, 'bar');
    });
    it('should find a simple tuple with exact template', function () {
      var found = Tuple.select({ foo: 'bar' });
      assert.equal(found.length, 1);
      assert.equal(found[0].foo, 'bar');
    });
    it('should find a simple tuple with similar template', function () {
      var found = Tuple.select({ foo: _.isString });
      assert.equal(found.length, 1);
      assert.equal(found[0].foo, 'bar');
    });
  });
});
