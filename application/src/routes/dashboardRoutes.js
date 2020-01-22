/*
Author: Gem Angelo Lagman
Date: 12/16/19
Description: These routes are specifically for  messages and dashboard.
*/

// API's for messages and dashboard
const express = require("express");
const db = require("../models/database.js");
const router = express.Router();
const passport = require("passport");

// Checks to see if user is logged in
async function checkAuthentication(req, res, next) {
  if (req.isAuthenticated()) next();
  else res.redirect("/login");
}

// Gets list of categories
async function getCategories(req, res, next) {
  await db.execute("SELECT * FROM category", (err, categories) => {
    if (err) throw err;
    req.categoriesList = categories;
    next();
  });
}

// Gets list of messages sent and received from user
async function getMessages(req, res, next) {
  var uid = req.user.id;

  var query =
    "SELECT DISTINCT message.id, listing.user_id AS seller_id, seller.username AS seller, message.sender_id, sender.username AS sender, message.receiver_id, receiver.username AS receiver, message.date, message.listing_id, listing.title AS listing, message.message FROM message, listing, user seller, user sender, user receiver WHERE (message.sender_id = " +
    uid +
    " || message.receiver_id = " +
    uid +
    ") AND message.listing_id = listing.id AND seller.username IN (SELECT username FROM user WHERE user.id = listing.user_id) AND sender.username IN (SELECT username FROM user WHERE user.id = message.sender_id) AND receiver.username IN (SELECT username FROM user WHERE user.id = message.receiver_id) ORDER BY date DESC";

  await db.execute(query, (err, result) => {
    if (err) {
      req.userMessages = "";
      next();
    }
    req.userMessages = result;
    next();
  });
}

// Gets list of listings posted by user
async function getListings(req, res, next) {
  var uid = req.user.id;

  var query = "SELECT * FROM listing WHERE is_sold != 1 AND user_id = " + uid;
  await db.execute(query, (err, result) => {
    if (err) {
      req.listings = "";
      next();
    }
    req.listings = result;
    next();
  });
}

// Updates listing as sold
async function updateListing(req, res, next) {
  var lid = req.body.listingId;
  console.log("lid: ", lid);

  var query = "UPDATE listing SET is_sold = 1 WHERE id = " + lid;
  await db.execute(query, (err, result) => {
    if (err) {
      console.log(err);
    }
    next();
  });
}

// Deletes listing from database
async function deleteListing(req, res, next) {
  var lid = req.body.listingId;
  console.log("lid: ", lid);

  var query = "DELETE FROM listing WHERE id = " + lid;
  await db.execute(query, (err, result) => {
    if (err) {
      console.log(err);
    }
    next();
  });
}

// creates and sends message to receiver
async function createMessage(req, res, next) {
  var message = req.body.message;
  var senderId = req.user.id;
  var receiverId = req.body.receiverId;
  var listingId = req.body.listingId;

  // console.log("senderId:", senderId);
  // console.log("message:", message);
  // console.log("receiverId:", receiverId);
  // console.log("listingId:", listingId);

  var query =
    `INSERT INTO message (message, sender_id, receiver_id, listing_id ) VALUES ( "` +
    message +
    `", ` +
    senderId +
    `, ` +
    receiverId +
    `, ` +
    listingId +
    `)`;

  console.log("query = ", query);

  await db.execute(query, (err, results) => {
    if (err) {
      console.log(err);
      next();
    }
    console.log("Succesful message");
    next();
  });
}

// Renders user dashboard with user's listings and messages
router.get(
  "/dashboard",
  checkAuthentication,
  getCategories,
  getMessages,
  getListings,
  (req, res) => {
    var categoriesList = req.categoriesList;
    var userMessages = req.userMessages;
    var userListings = req.listings;
    var userId = req.user.id;
    var username = req.user.username;
    console.log("username: ", username);

    res.render("pages/messages", {
      categoriesList: categoriesList,
      searchTerm: "",
      searchCategory: "All",
      emails: userMessages,
      cards: userListings,
      userId: userId,
      isLoggedIn: req.isAuthenticated(),
      username: username
    });
  }
);

// Updates listing and then renders dashboard again
router.post(
  "/updateListing",
  checkAuthentication,
  updateListing,
  (req, res) => {
    res.redirect("/dashboard");
  }
);

// Deletes listing and then renders dashboard again
router.post(
  "/deleteListing",
  checkAuthentication,
  deleteListing,
  (req, res) => {
    res.redirect("/dashboard");
  }
);

// Creates and sends message and then renders dashboard
router.post("/message", checkAuthentication, createMessage, (req, res) => {
  res.redirect("/dashboard");
});

module.exports = router;
