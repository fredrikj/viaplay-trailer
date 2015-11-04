"use strict";

require("mocha-cakes");
var chai = require("chai");
chai.should();
var app = require("../../app.js");
var request = require("supertest");
var nock = require("nock");
var fs = require("fs");

Feature("Get trailer URL", function () {
  var response;

  function mockSetup() {
    var viaplayData = fs.readFileSync("test/data/viaplay.json", 'utf8'); 
    nock("https://content.viaplay.se").get("/web-se/film/the-internship-2013").reply(200,viaplayData);
    var traileraddictData = fs.readFileSync("test/data/trailer.xml", 'utf8'); 
    nock("http://api.traileraddict.com").get("/?imdb=2234155").reply(200, traileraddictData);
  }

  before(mockSetup);

  When("requesting trailer for a film URL", function(done) {
    request(app)
    .get("/trailer/film/the-internship-2013")
    .end(function(err, res) {
      response = res;
      if (err) return done(err);
      done();
    });
  });

  Then("get 200 OK with JSON containing link", function() {
    response.statusCode.should.equal(200);
    var data = JSON.parse(response.text);
    data.link.should.equal("https://v.traileraddict.com/92106");
  });
});
