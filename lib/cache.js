var cacheFetch = function(fetch) {
  return (function() {
    var cache = {};
    return function(key, callback) {
      if (cache[key] && cache[key].pending) { // Fetch pending
        cache[key].callbacks.push(callback);
      } else if (cache[key]) {                // In cache
        callback(cache[key]);
      } else {                                // First fetch
        cache[key] = { pending : true,
          callbacks : [ callback ] };
        fetch(key, 
          function(val) { 
            for (var i=0; i<cache[key].callbacks.length; i++) {
              cache[key].callbacks[i](val);
            }
            cache[key] = val;
          });
      }
    };
  }());
};

module.exports = cacheFetch;
