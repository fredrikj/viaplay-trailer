var cacheFetch = function(fetch) {
  return (function() {
    var cache = {};
    return function(key, callback) {
      if (cache[key] && cache[key].pending) { // Fetch pending
        cache[key].callbacks.push(callback);
      } else if (cache[key]) {                // In cache
        callback(undefined, cache[key]);
      } else {                                // First fetch
        cache[key] = { pending : true,
          callbacks : [ callback ] };
        fetch(key, 
          function(err, val) { 
            for (var i=0; i<cache[key].callbacks.length; i++) {
              cache[key].callbacks[i](err, val); // Watch out for recursion
            }
            cache[key] = val; 
          });
      }
    };
  }());
};

module.exports = cacheFetch;
