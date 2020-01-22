/*
Author: Raya Farshad, Gem Angelo Lagman
Date: 12/16/19
Description: API to retrieve each members' about me page
*/

var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/danabout", function(req, res, next) {
  res.render("about/danabout", { title: "Express" });
});
// Gets Moniques's about page
router.get("/moniqueabout", function(req, res, next) {
  res.render("about/moniqueabout", { title: "Express" });
});
// Gets Gem's about page
router.get("/gemabout", function(req, res, next) {
  res.render("about/gemabout", { title: "Express" });
});
// Gets Pramish's about page
router.get("/pramishabout", function(req, res, next) {
  res.render("about/pramishabout", { title: "Express" });
});
// Gets Raya's about page
router.get("/rayaabout", function(req, res, next) {
  res.render("about/raya_about_page", { title: "Express" });
});
// Gets to the team page
router.get("/", function(req, res, next) {
  res.render("pages/index");
});

module.exports = router;
