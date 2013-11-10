var x = require('../x.js'),
  assert = require('chai').assert,
  Backbone = require('backbone');

describe('x.Space', function () {
  it('is sane', function () {
    assert.ok(x);
    assert.ok(x.Space);
    assert.isFunction(x.Space.add);
    assert.isFunction(x.Space.get);
    assert.isFunction(x.Space.remove);
    assert.isFunction(x.Space.on);
    assert.isFunction(x.Space.reset);
  });
  describe('#add', function () {
    it('should produce a new tuple in the space', function () {
      var tuple = { hello: 'world' },
        p = x.Space.add(tuple);

      console.log(p);

      assert.isTrue(p);

      //assert.ok(x.Space._space);
      //assert.equal(x.Space
      //assert.equal(tuple

    });
  });
});

describe('x.Tuple', function () {
  var helloTuple, modelTuple;


  beforeEach(function () {
    helloTuple = { hello: 'world', foo: 'bar' };
    helloModel = new Backbone.Model({
      hello: 'world',
      foo: 'bar'
    });
  });

  it('is sane', function () {
    assert.ok(x);
    assert.ok(x.Tuple);
    assert.instanceOf(x.Tuple.prototype, Backbone.Model);
  });

  describe('#isValid()', function () {
    it('should not validate falsy values', function () {
      assert.isFalse(new x.Tuple(false).isValid());
      assert.isFalse(new x.Tuple(null).isValid());
      assert.isFalse(new x.Tuple(undefined).isValid());
      assert.isFalse(new x.Tuple(0).isValid());
    });
    it('should not validate Array', function () {
      assert.isFalse(new x.Tuple([ ]).isValid());
      assert.isFalse(new x.Tuple([1,2,3,4]).isValid());

    });
    it('should not validate Boolean', function () {
      assert.isFalse(new x.Tuple(true).isValid());
      assert.isFalse(new x.Tuple(false).isValid());
      assert.isFalse(new x.Tuple(Boolean()).isValid());
    });

    /**
     * Raw Numbers are magical, and should not be allowed as tuplespace keys.
     */
    it('should not validate Number', function () {
      assert.isFalse(new x.Tuple(0).isValid());
      assert.isFalse(new x.Tuple(1).isValid());
      assert.isFalse(new x.Tuple(999).isValid());
      assert.isFalse(new x.Tuple(-123).isValid());
      assert.isFalse(new x.Tuple(Infinity).isValid());
      assert.isFalse(new x.Tuple(NaN).isValid());
    });
    it('should not validate empty Object', function () {
      assert.isFalse(new x.Tuple({ }).isValid());
    });
    it('should not validate empty String', function () {
      assert.isFalse(new x.Tuple('').isValid());
    });
    it('should validate Object', function () {
      assert.isTrue(new x.Tuple({ 1: null }).isValid());
      assert.isTrue(new x.Tuple({ foo: 'bar' }).isValid());
    });
    it('should validate String', function () {
      assert.isTrue(new x.Tuple('eventkey').isValid());
      assert.isTrue(new x.Tuple('a').isValid());
      assert.isTrue(new x.Tuple('1' + 'abc' + '\n').isValid());
    });
  });

  describe('#getSignature()', function () {
    var helloTupleSignature = '6ctw1t';

    it('should generate a stable hash signature for a particular tuple', function () {
      assert.equal(x.Tuple.getSignature(helloTuple), helloTupleSignature);
      assert.equal(x.Tuple.getSignature(helloTuple), helloTupleSignature);
    });
    it('should generate the same signature for a particular pojo and Backbone.Model', function () {
      assert.equal(x.Tuple.getSignature(helloTuple), helloTupleSignature);
      assert.equal(x.Tuple.getSignature(helloModel), helloTupleSignature);
    });
  });
});
