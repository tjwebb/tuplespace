(function () {
  'use strict';

  var _ = require('underscore'),
    Backbone = require('backbone'),
    fnv = require('./fnv'),


    /**
     * @static
     * @constant
     * Wildcard value for matching a tuple
     */
    ANY = '__any__',

    /**
     * @static
     * @constant
     * Specifically exclude this key for matching a tuple
     */
    NOT = '__not__',

    /**
     * @class Tuple
     */
    Tuple = Backbone.Model.extend({
      idAttribute: 'signature',

      defaults: {
        signature: null,
        tuple: null,
        handlers: new Backbone.Collection()
      },

      /**
       * @override
       * Always parse attributes.
       */
      constructor: function (attributes, options) {
        return Backbone.Model.call(this, attributes, _.extend({ parse: true }, options));
      },

      /**
       * @override
       * Invoked by the constructor before initialize. 
       */
      parse: function (data, options) {
        return {
          tuple: data
        };
      },

      initialize: function () {
        if (!this.isValid()) return;

        this.set({ signature: Tuple.getSignature(this.get('tuple')) });
      },

      validate: function () {
        var t = this.get('tuple');
        if (!t) {
          return 'Falsy is not a valid tuple';
        }
        if (_.isArray(t)) {
          return 'Array cannot be stored in the tuple space';
        }
        if (_.isBoolean(t)) {
          return 'Boolean is not a valid tuple';
        }
        if (_.isNumber(t)) {
          return 'Number is not a valid tuple';
        }

        /**
         * Backbone.Model's constructor by default converts falsy values to { }
         */
        if (_.isObject(t) && _.isEmpty(t)) {
          return 'tuple cannot be empty';
        }
        if (t instanceof Backbone.Model && _.isEmpty(t.attributes)) {
          return 'tuple cannot be empty';
        }
      }
    }, {

      /**
       * Generate a searchable hash code for a tuple.
       * @protected
       * @static
       */
      getSignature: function (t) {
        if (!_.isObject(t)) return fnv.hash(t).str();

        var keys = (t instanceof Backbone.Model) ? t.keys() : _.keys(t),
            keystr = keys.join(',');

        return fnv.hash(keystr).str();
      }
    }),

    /**
     * @class Space
     */
    Space = Backbone.Collection.extend({
      /** @lends x.Space.prototype */

      model: Tuple,

      /**
       * @override
       * Put a tuple into the space. It will remain there forever until taken.
       *
       * @name x.Space.add
       * @param {Object}  the tuple to add to the tuple space
       * @returns true if successfully added; false if duplicate
       */
      add: function (t, options) {
        Backbone.Collection.prototype.add.call(this, new Tuple(t), options);
      },

      /**
       * Read a tuple. The tuple will be copied, and will remain in the space.
       *
       * @name x.Space.get
       * @param {Object}    tuple   the tuple template to get
       * @returns The matching tuple if found, null otherwise
       */
      get: function (t) {
        var key = t;

        if (!_.isString(t) && !_.isObject(t) && !(t instanceof Backbone.Model)) {
          console.warn('tuple must be either a string, object, or inherit Backbone.Model');
          console.warn('tuple: '+ t);
          return;
        }
        if (t instanceof Backbone.Model) {
          key = t.id;
        }

        return Backbone.Collection.prototype.get.call(this, t);
      },

      /**
       * Wait for a tuple. The tuple will be copied, and will remain in the
       * space until removed.
       *
       * @name x.Space.on
       * @param {Object}    the tuple template to listen for
       * @param {Function}  function invoked when tuple is matched
       */
      on: function (tuple, handler) {

      },

      /**
       * @override
       * Take a tuple from the space. The original tuple will be returned to
       * this caller and removed from the space.
       *
       * @name x.Space.remove
       * @param {Object}    the tuple template to take
       * @param {Function}  function invoked when tuple is matched
       * @returns true if handler is registered; false if another consumer
       *  is already listening for this tuple.
       */
      remove: function (tuple, onRemove) {

      },

      /**
       * @override
       * Erase all tuples and unregister all listeners.
       *
       * @name x.Space.reset
       */
      reset: function () {

      }
    });

  module.exports = {
    Space: new Space(),
    Tuple: Tuple
  };
})();
