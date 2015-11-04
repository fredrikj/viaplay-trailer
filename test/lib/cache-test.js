"use strict";
var assert = require("assert");

var expensiveFunction = (function() {
  var counter = {};
  return function(key, callback) {
    if (!counter[key]) {
      counter[key] = 1;
    } else {
      counter[key] += 1;
    }
    setTimeout(function() { callback(key+counter[key]);}, 10);
  };
}());

var cache = require("../../lib/cache.js");
var cachedExpensiveFunction = cache(expensiveFunction);

describe("Cache a function", function() {

  var doneAfterTwoCalls = (function() {
    var i=0;
    return function(done) {
      i += 1;
      if (i>1) {
        done();
      }
    };
  }());

  it("calls the function only once", function(done) {
    for (var i=0; i<2; i++) {
      cachedExpensiveFunction("test", function(result) {
        result.should.equal("test1");
        doneAfterTwoCalls(done);
      });
    }
  });
});
