(function () {
  'use strict';

  var default_bitlen = 32,
    fnv_prime = {
      '32':   Math.pow(2, 24)   + Math.pow(2, 8) + 0x93,

      // TODO modifications needed to support > 32bit
      '64':   Math.pow(2, 40)   + Math.pow(2, 8) + 0xb3,
      '128':  Math.pow(2, 88)   + Math.pow(2, 8) + 0x3b,
      '256':  Math.pow(2, 168)  + Math.pow(2, 8) + 0x63
    },
    fnv_offset = {
      '32':   0x811C9DC5,

      // TODO modifications needed to support > 32bit
      '64':   0xcbf29ce484222325,
      '128':  0x6c62272e07bb014262b821756295c58d,
      '256':  0xdd268dbcaac550362d98c384c4e576ccc8b1536847b6bbb31023b4c8caee0535
    },
    FnvResult = function (val) {
      return {
        val: val,
        dec: function () {
          return val.toString(10);
        },
        hex: function () {
          return val.toString(16);
        },
        str: function () {
          return val.toString(36);
        }
      };
    },
    hash = function (str, _bitlen) {
      var bitlen = _bitlen || default_bitlen,
        prime = fnv_prime[bitlen],
        offset = fnv_offset[bitlen],
        hash = offset;
        
      for (var i = 0; i < str.length; ++i) {
        hash = hash ^ str.charCodeAt(i);
        hash = hash * prime;
      }
      return new FnvResult(hash >>> 0);
    };

  /**
   * FNV-1a hash implementation
   * @author Travis Webb <me@traviswebb.com>
   */
  module.exports = {
    default_bitlen: default_bitlen,
    hash: hash
  };

})();
