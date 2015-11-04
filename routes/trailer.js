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
  var traileraddictUrl = "https://api.traileraddict.com/";
  request(traileraddictUrl + "?imdb=" + imdbID, function(err, res, body) {
    getLinkFromTraileraddictXML(body, callback);
  });
}

/* GET home page. */
router.get('/film/:filmUrl', function(req, res, next) {
  get_imdbID("https://content.viaplay.se/web-se/film/" + req.params.filmUrl, 
    function(imdbID) {
      getTrailerLink(imdbID, 
        function(link) {
          res.send({link: link});
        });
    });
});

module.exports = router;
