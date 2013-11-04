(function () {
  'use strict';

  var _ = require('underscore'),
    Backbone = require('backbone');

  /**
   * Create a searchable hash code for a tuple.
   * @private
   */
  function hashCode (tuple) {
    if (!_.isObject(tuple)) return tuple;

    return _.reduce(_.keys(tuple), function (memo, x) {

      return memo + (function () {

        if (tuple[x] instanceof Backbone.Model) {
          var idAttribute = tuple[x].idAttribute;
          return tuple[x].recordType + ':' + tuple[x][idAttribute];
        }

        return _.keys(tuple[x]).join(',');

      });
    });
  }

  /**
   * Simple tuple-space implementation.
   * @author Travis Webb <travis@xtuple.org>
   */
  var tuplespace = {
    /** @lends T.Space.prototype */

    put: function (_tuple) {
      var tuple = _.extend({ _tuplekey: hashCode(_tuple) }, _tuple),
        index = _.sortedIndex(this._tuples, tuple, '_tuplekey');

      console.log(index);
      console.log(tuple);

      return true;
    },


    read: function (_tuple, _handler) {
      if (_.isString(tuple)) {
        return Backbone.Model.prototype.on.apply(this, arguments);
      }
      if (!_.isObject(tuple)) {
        //console.warn('tuple must be either a string or object');
        return;
      }
    },

    _tuples: { }
  };

  module.exports = tuplespace;

})();
