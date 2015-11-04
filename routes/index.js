var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/trailer/film/:filmUrl', function(req, res, next) {
  res.send({link: "https://v.traileraddict.com/92106"});
});

module.exports = router;
