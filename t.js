(function () {

  var _ = require('underscore'),
    Backbone = require('backbone'),
    space = require('./lib/tuplespace');

  /**
   * @namespace T
   */
  var T = { };

  /**
   * @class T.Space
   * @mixes Backbone.Events (http://backbonejs.org/#Events)
   * @mixes lib/tuplespace
   */
  T.Space = _.extend(space, Backbone.Events, {
    /**
     * Put a tuple into the space. It will remain there forever until taken.
     *
     * @static
     * @name T.Space.put
     * @param {Object}  the tuple to add to the tuple space
     * @returns true if successfully added; false if duplicate
     */
    put: function (tuple) {

    },

    /**
     * Read a tuple. The tuple will be copied, and will remain in the space.
     *
     * @static
     * @name T.Space.read
     * @param {Object}    tuple   the tuple template to read
     * @returns The matching tuple if found, null otherwise
     */
    read: function (tuple) {

    },

    /**
     * Wait for a tuple. The tuple will be copied, and will remain in the
     * space until taken.
     *
     * @static
     * @name T.Space.on
     * @param {Object}    tuple   the tuple template to read
     * @param {Function}  handler function invoked when tuple is matched
     */
    on: function (tuple, handler) {

    },

    /**
     * Take a tuple from the space. The original tuple will be returned to
     * this caller and removed from the space.
     *
     * @static
     * @name T.Space.take
     * @param {Object}    tuple   the tuple template to take
     * @param {Function}  handler function invoked when tuple is matched
     * @returns true if handler is registered; false if another consumer
     *  is already listening for this tuple.
     */
    take: function (tuple, handler) {

    }
  });

  module.exports = T;
})();
