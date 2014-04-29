var assert = require('assert'),
  space = require('..'),
  _ = require('lodash');

describe('tuplespace', function () {
  var Tuple = space.Tuple;

  describe('Tuple', function () {

    describe('#attributes', function () {
      before(function () {
        Tuple.create({ test: 'attributes', name: 'tjw' });
      });
      it('should return all attributes originally given via #create', function () {
        var results = Tuple.select({ test: 'attributes' });
        assert.equal(_.first(results).name, 'tjw');
        assert(_.has(_.first(results).attributes(), 'test'));
        assert(_.has(_.first(results).attributes(), 'name'));
      });
      it('should filter out functions specified as model properties', function () {
        Tuple.create({ test: 'attributes', name: 'tjw', pointless: function () { return 1; } });
        var results = Tuple.select({ test: 'attributes' });
        assert(!_.has(_.first(results).attributes(), 'pointless'));
      });
    });

    describe('#select', function () {
      before(function () {
        Tuple.create({ test: 'select', name: 'tjw' });
      });
      it('original implementation should still work to spec', function () {
        var results = Tuple.select(function (record) {
          return record.test === 'select';
        });
        assert.equal(_.first(results).name, 'tjw');
      });
      it('should find a simple tuple with exact template', function () {
        var results = Tuple.select({ test: 'select' });
        assert.equal(_.first(results).name, 'tjw');
      });
      it('should find a simple tuple with similar template', function () {
        var results = Tuple.select({ test: /sele/ });
        assert.equal(_.first(results).name, 'tjw');
      });
    });

  });
});
