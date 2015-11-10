var express = require('express');
var router = express.Router();
var request = require("request");
var xml2js = require("xml2js");
var cache = require("../lib/cache.js");

function get_imdbID(url, callback) {
  var imdbID, jsonData;
  request(url, function(err, res, body) {
    if (err) {
      callback("HTTP : " + JSON.stringify(err));
    }
    jsonData = JSON.parse(body);
    try {
      imdbID = jsonData._embedded["viaplay:blocks"][0]._embedded["viaplay:product"].content.imdb.id;
      imdbID = imdbID.replace(/tt(.*)$/,"$1");
      callback(null, imdbID);
    }
    catch (err) {
      callback("Could not get IMDB from Viaplay JSON");
    }
  });
}

function getLinkFromTraileraddictXML(xml, callback) {
  var xmlParser = new xml2js.Parser();
  xmlParser.parseString(xml, function(err, data) {
    try {
      var trailerId = data.trailers.trailer[0].trailer_id[0];
      callback(null, "https://v.traileraddict.com/" + trailerId);
    } 
    catch(err) {
      callback("Could not get traileraddict link");
    }
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
      function(err, imdbID) {
        if (err) {
          callback(err);
        } else {
          getTrailerLink(imdbID, callback);
        }
      });
}

var cachedFetch = cache(fetch);

/* GET home page. */
router.get('/film/:filmUrl', function(req, res, next) {
  cachedFetch(req.params.filmUrl, 
    function(err, link) {
      if (err) {
        res.status(404).send(err);
      } else {
        res.send({link : link});
      }
    });
});

module.exports = router;
