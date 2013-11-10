(function () {
  'use strict';

  /**
   * @namespace x
   */
  module.exports = Object.create({
    Space: Object.freeze(require('./lib/tuplespace').Space),
    Tuple: Object.freeze(require('./lib/tuplespace').Tuple)
  });

})();
