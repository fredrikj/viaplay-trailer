"use strict";

require("mocha-cakes");
var chai = require("chai");
chai.should();
var app = require("../../app.js");
var request = require("supertest");
var nock = require("nock");
var fs = require("fs");

var goodViaplayURL = "film/the-internship-2013";
var badViaplayURL = "film/the-vinternship-2013";

function mockSetup() {
  var viaplayData = fs.readFileSync("test/data/viaplay.json", 'utf8'); 
  nock("https://content.viaplay.se").get("/web-se/" + goodViaplayURL).reply(200,viaplayData);
  nock("https://content.viaplay.se").get("/web-se/" + badViaplayURL).reply(404,{});
  var traileraddictData = fs.readFileSync("test/data/trailer.xml", 'utf8'); 
  nock("http://api.traileraddict.com").get("/?imdb=2234155").reply(200, traileraddictData);
}

Feature("Get trailer URL", function () {
  var response;

  beforeEach(mockSetup);

  Scenario("GET existing URL", function() {
    When("requesting trailer for a film URL", function(done) {
      request(app)
      .get("/trailer/" + goodViaplayURL)
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


  Scenario("GET non-existing URL", function() {
    When("requesting trailer for a film URL that does not exist in Viaplay", function(done) {
      request(app)
      .get("/trailer/" + badViaplayURL)
      .end(function(err, res) {
        if (err) return done(err);
        response = res;
        done();
      });
    });
    Then("get 404", function() {
      response.statusCode.should.equal(404);
    });
  });
});
