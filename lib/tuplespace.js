(function () {
  'use strict';

  var _ = require('underscore'),
    Backbone = require('backbone'),
    fnv = require('./fnv'),

    /**
     * @class Match
     */
    Match = {

      /**
       * @static
       * @constant
       * Wildcard for matching any tuple vlaue
       */
      ANY: '__any__',

      /**
       * @static
       * @constant
       * Specifically exclude this key for matching a tuple
       */
      NOT: '__not__',

    },

    Type = {
      STRING:   '__string__',
      NUMBER:   '__number__',
      INTEGER:  '__integer__',
      FUNCTION: '__function__',
      DATE:     '__date__',
      OBJECT:   '__object__',
      ARRAY:    '__array__',
      FALSY:    '__falsy__',
      TRUTHY:   '__truthy__'
    },

    Handler = Backbone.Model.extend({

      /**
       * Handle a matched tuple
       */
      handle: function (tuple) {
        this.get('handler')(tuple);
        return true;
      }

    }),

    /**
     * @class Consumer
     * @extends Backbone.Model
     */
    Consumer = Handler.extend({

      /**
       * @override
       * Consume a tuple
       */
      handle: function (tuple) {
        this.get('handler')(this.collection.space.remove(tuple));
        return true;
      }
    }),

    /**
     * @class ConsumerQueue
     * @extends Backbone.Collection
     */
    ConsumerQueue = Backbone.Collection.extend({
      model: Consumer,

      initialize: function (space) {
        this.space = space;
      }
    }),

    /**
     * @class Tuple
     */
    Tuple = Backbone.Model.extend({
      idAttribute: 'checksum',

      defaults: {
        signature: null,
        checksum: null,
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
        return { tuple: data };
      },

      /**
       * @override
       */
      initialize: function () {
        if (!this.isValid()) return;

        var tuple = this.get('tuple'),
            signature = Tuple.getSignature(tuple),
            checksum = Tuple.getChecksum(tuple);

        this.set({
          signature: signature,
          checksum: checksum,
          uid: signature + ':' + checksum
        });
      },

      /**
       * @override
       */
      validate: function () {
        var t = this.get('tuple');
        if (!t) {
          return Tuple.error.INVALID_FALSY;
        }
        if (_.isArray(t)) {
          return Tuple.error.INVALID_ARRAY;
        }
        if (_.isBoolean(t)) {
          return Tuple.error.INVALID_BOOLEAN;
        }
        if (_.isNumber(t)) {
          return Tuple.error.INVALID_NUMBER;
        }
        if (_.isString(t)) {
          return Tuple.error.INVALID_STRING;
        }

        /**
         * Backbone.Model's constructor by default converts falsy values to { }
         */
        if (_.isObject(t) && _.isEmpty(t)) {
          return Tuple.error.INVALID_EMPTY;
        }
        if (t instanceof Backbone.Model && _.isEmpty(t.attributes)) {
          return Tuple.error.INVALID_EMPTY;
        }
      }
    }, {
      error: {
        INVALID_EMPTY: 'tuple cannot be empty',
        INVALID_FALSY: 'tuple cannot be created from a falsy value',
        INVALID_ARRAY: 'a raw Array cannot be stored in the tuple space',
        INVALID_STRING: 'tuple cannot be primitive (String)',
        INVALID_BOOLEAN: 'tuple cannot be primitive (Boolean)',
        INVALID_NUMBER: 'tuple cannot be primitive (Number)'
      },

      /**
       * Generate a searchable hash code for a tuple's template.
       *
       * @protected
       * @static
       */
      getSignature: function (t) {
        if (!_.isObject(t)) return fnv.hash(t).str();

        var keys = (t instanceof Backbone.Model) ? t.keys() : _.keys(t),
            keystr = keys.join(',');

        return fnv.hash(keystr).str();
      },

      /**
       * Generate a unique hash code for a tuple's value.
       *
       * @protected
       * @static
       */
      getChecksum: function (t) {
        var values = (t instanceof Backbone.Model) ? t.values() : _.values(t),
            valstr = values.join(',');

        return fnv.hash(valstr).str();
      },

      /**
       * Get a unique event name for prefixing events from or about this
       * tuple.
       */
      getEventName: function (t) {
        if (t instanceof Tuple) {
          return t.get('eventname');
        }
        else {
          this.set({ eventname: 'tuple:' + Tuple.getSignature(t) });
        }
      }
    }),

    /**
     * A collection of tuples inside a group.
     */
    TupleCollection = Backbone.Collection.extend({
      model: Tuple
    }),

    /**
     * Group of Tuples that share the same signature.
     */
    TupleGroup = Backbone.Model.extend({
      idAttribute: 'signature',

      defaults: {
        signature: null,
        tuples: new TupleCollection()
      },

      /**
       * @override
       * @param {Tuple}
       *
       * Match a tuple by query.
       */
      get: function (tuple) {
        var query = _.omit(
            tuple,
            /**
             * Exclude any properties of Match or Type for the value-match
             * query.
             */
            _.filter(_.keys(tuple), function (key) {
              return _.contains(
                _.union(_.keys(Match), _.keys(Type)),
                tuple[key]
              );
            })
          ),
        results = this.get('tuples').where(query);
      }

    }),

    /**
     * @class Space
     */
    Space = Backbone.Collection.extend({
      model: TupleGroup,

      initialize: function (attributes, options) {

        //this.on('add', this._onAdd);
        //this.on('remove', this._onRemove);
      },

      /**
       * @override
       * Put a tuple into the space. It will remain there forever until taken.
       *
       * @name x.Space.add
       * @param {Object}  the tuple to add to the tuple space
       * @returns true if successfully added; false if duplicate
       */
      add: function (t, options) {
        var tuple = this.$(t);
        if (!tuple) return;

        if (this.get(tuple)) {
          this.trigger('add:exists', tuple);
          return false;
        }

        var r = Backbone.Collection.prototype.add.call(this, tuple, options);
        console.log(r);
        return r;
      },

      _onAdd: function (tuple, space, options) {
        this.trigger(tuple.get('eventname'), tuple);
      },

      /**
       * Read a tuple. The tuple will be copied, and will remain in the space.
       * If the tuple is not in the space, return null.
       *
       * @name x.Space.get
       * @param {Object}    tuple   the tuple template to get
       * @returns The matching tuple if found, null otherwise
       */
      get: function (t) {
        var tuple = this.$(t);
        if (!tuple) return;

        var signature = tuple.get('signature'),
          group = Backbone.Collection.prototype.get.call(this, signature),
          result = group && group.match(tuple);

        console.log(group);
        console.log(result);

        if (!group)  return this.trigger('get:notfound', t);
        if (!result) return this.trigger('get:notfound', t);

        return result;
      },

      /**
       * Wait for a tuple. When matched, the tuple will be copied, and will
       * remain in the space until removed.
       *
       * @name x.Space.on
       * @param {Object}    the tuple template to listen for
       * @param {Function}  function invoked when tuple is matched
       */
      on: function (t, handler) {
        var tuple = this.$(t);
        if (!tuple) return;

        return Backbone.Collection.prototype.on.call(this, tuple.get('eventname'), handler);
      },

      /**
       * Take a tuple from the space. The original tuple will be returned to
       *
       * this caller and removed from the space.
       *
       * @name Space.remove
       * @see Tuple#remove()
       * @param {Object}    the tuple template to take
       * @param {Function}  function invoked when tuple is matched
       * @returns true if handler is registered; false if another consumer
       *  is already listening for this tuple.
       */
      remove: function (tuple, onRemove) {

      },

      _onRemove: function (t, space, options) {

      },

      /**
       * @override
       * Erase all tuples and unregister all listeners. This is somewhat more
       * destructive than the standard Backbone.Model#clear.
       *
       * @name x.Space.clear
       */
      clear: function () {
        this.off();
        Backbone.Model.call(this);
      },

      /**
       * Syntax sugar for wrapping and validating a tuple.
       */
      $: function (t) {
        var tuple = (t instanceof Tuple) ? t : new Tuple(t);
        return tuple.isValid() ? tuple : null;
      }
    });

  module.exports = Object.freeze({
    Space: new Space(),
    Tuple: Tuple,
    Match: Match
  });
})();
