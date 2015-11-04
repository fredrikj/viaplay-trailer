var express = require('express');
var router = express.Router();
var request = require("request");
var xml2js = require("xml2js");

function get_imdbID(url, callback) {
  var imdbID, jsonData;
  request(url, function(err, res, body) {
    jsonData = JSON.parse(body);
    //FIXME Crashes if something undefined
    imdbID = jsonData._embedded["viaplay:blocks"][0]._embedded["viaplay:product"].content.imdb.id;
    imdbID = imdbID.replace(/tt(.*)$/,"$1");
    callback(imdbID);
  });
}

function getLinkFromTraileraddictXML(xml, callback) {
  var xmlParser = new xml2js.Parser();
  xmlParser.parseString(xml, function(err, data) {
    var trailerId = data.trailers.trailer[0].trailer_id[0];
    callback("https://v.traileraddict.com/" + trailerId);
  });
}

function getTrailerLink(imdbID, callback) {
  var traileraddictUrl = "http://api.traileraddict.com/";
  request(traileraddictUrl + "?imdb=" + imdbID, function(err, res, body) {
    getLinkFromTraileraddictXML(body, callback);
  });
}

function fetch(url, callback) {
  get_imdbID("https://content.viaplay.se/web-se/film/" + url, 
      function(imdbID) {
        getTrailerLink(imdbID, 
          function(link) {
            callback(link);
          });
      });
}

var cacheFetch = (function() {
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

/* GET home page. */
router.get('/film/:filmUrl', function(req, res, next) {
  cacheFetch(req.params.filmUrl, 
    function(link) {
      res.send({link : link});
    });
});

module.exports = router;
