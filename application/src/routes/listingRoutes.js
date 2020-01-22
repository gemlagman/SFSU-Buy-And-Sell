/*
Author: Gem Angelo Lagman
Date: 12/16/19
Description: API for listings
*/
const express = require("express");
const db = require("../models/database.js");
const router = express.Router();
const sortJsonArray = require("sort-json-array");

// Gets list of categories
async function getCategories(req, res, next) {
  await db.execute("SELECT * FROM category", (err, categories) => {
    if (err) throw err;
    //console.log(categories);
    req.categoriesList = categories;
    next();
  });
}

// Gets most recent 12 approved listings
async function getRecentListings(req, res, next) {
  let query =
    "SELECT listing.id, listing.title, listing.price, listing.description, listing.image, listing.is_sold, listing.date, listing.is_approved, category.name, listing.user_id FROM listing INNER JOIN category ON listing.category_id = category.id WHERE is_sold = 0 AND is_approved = 1 ORDER BY date DESC LIMIT 12;";

  await db.execute(query, (err, results) => {
    if (err) {
      req.searchResult = "";
      next();
    }
    req.searchResult = results;
    next();
  });
}

// Gets list of classes available to post for textbook
async function getClasses(req, res, next) {
  await db.execute("SELECT * FROM classes", (err, classes) => {
    if (err) throw err;
    //console.log(classes);
    req.classesList = classes;
    next();
  });
}

//Search function
async function search(req, res, next) {
  var searchTerm = req.query.search;
  var category = req.query.category;
  var sort = req.query.sort;
  var classId = req.query.class;

  let join =
    "SELECT listing.id, listing.title, listing.price, listing.description, listing.image, listing.is_sold, listing.date, category.name, listing.user_id, listing.is_approved FROM listing INNER JOIN category ON listing.category_id = category.id";
  let query = "";
  if (
    searchTerm != "" &&
    category != "" &&
    category != "All" &&
    category != "Recent"
  ) {
    query =
      ` WHERE name = '` +
      category +
      `' AND (title LIKE '%` +
      searchTerm +
      `%' OR description LIKE '%` +
      searchTerm +
      `%') AND is_sold = 0 AND is_approved = 1`;
  } else if (
    searchTerm != "" &&
    (category == "" || category == "All" || category == "Recent")
  ) {
    query =
      ` WHERE (title LIKE '%` +
      searchTerm +
      `%' OR description LIKE '%` +
      searchTerm +
      `%') AND is_sold = 0 AND is_approved = 1`;
  } else if (
    searchTerm == "" &&
    category != "" &&
    category != "All" &&
    category != "Recent"
  ) {
    query =
      ` WHERE name = '` + category + `' AND is_sold = 0 AND is_approved = 1`;
  } else if (searchTerm == "" && (category == "All" || category == "Recent")) {
    query = ` WHERE is_sold = 0 AND is_approved = 1`;
  }

  var classQuery = "";
  if (classId != undefined) {
    req.classId = classId;
    classQuery = " AND listing.class_id = " + classId;
  }

  var orderby = "";
  if (sort == 1) {
    orderby = " ORDER BY listing.date DESC";
  } else if (sort == 2) {
    orderby = " ORDER BY listing.price ASC";
  } else {
    orderby = " ORDER BY listing.price DESC";
  }

  let sql = join + query + classQuery + orderby;
  console.log("this is sql: " + sql);
  await db.execute(sql, (err, result) => {
    if (err) {
      req.searchResult = "";
      next();
    }
    req.searchResult = result;
    next();
  });
}

//gets search results and renders searchpage
router.get("/search", search, getCategories, getClasses, (req, res) => {
  var searchResult = req.searchResult;
  var categoriesList = req.categoriesList;
  var classesList = req.classesList;
  var classId = req.classId;
  res.render("pages/mainpage", {
    userLogged: true,
    cards: searchResult,
    categoriesList: categoriesList,
    classesList: classesList,
    searchTerm: req.query.search,
    searchCategory: req.query.category,
    isLoggedIn: req.isAuthenticated(),
    classId: classId
  });
});

//Landing page
router.get("/", getRecentListings, getCategories, getClasses, (req, res) => {
  var searchResult = req.searchResult;
  var categoriesList = req.categoriesList;
  var classesList = req.classesList;
  var classId = req.classId;
  res.render("pages/mainpage", {
    userLogged: true,
    cards: searchResult,
    categoriesList: categoriesList,
    classesList: classesList,
    searchTerm: "",
    searchCategory: "Recent",
    isLoggedIn: req.isAuthenticated(),
    classId: classId
  });
});

module.exports = router;
