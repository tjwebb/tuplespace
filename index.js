var Q = require('q'),
  _ = require('lodash'),
  Spine = require('spine');

_.mixin(require('congruence'));

var Tuple = Spine.Model.sub();
Tuple.configure('Tuple');

/**
 * @class Tuple
 */
Tuple.extend({

  /**
   *
   *
   */
  subscribe: function (template) {
    var deferred = Q.defer();
    Tuple.bind('create', function (tuple) {
      if (_.similar(template, tuple)) {
        deferred.resolve(tuple);
      }
    });
    return deferred.promise;
  },

  /**
   * Support selection via congruence templates
   * @override
   */
  select: function (val) {
    var callback = _.isFunction(val) ? val : function (tuple) {
      return _.similar(val, tuple);
    };
    return Spine.Model.select.call(this, callback);
  }
});

Tuple.include({

  /**
   * All non-function attributes are persistent.
   *
   * @override
   */
  attributes: function () {
    return _.omit(this, _.functions(this));
  },

  /**
   * Use _.create instead of spine.js createObject function so that all
   * properties are copied.
   *
   * @override
   */
  clone: function () {
    return _.create(this);
  }

});

exports.Tuple = Tuple;
