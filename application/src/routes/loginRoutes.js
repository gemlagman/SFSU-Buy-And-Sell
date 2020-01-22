/*
Author: Raya Farshad
Date: 12/16/19
Description: API for user registration, Login, Logout and authentication.
*/

const express = require("express");
const router = express.Router();
const { User } = require("../models/user.js");
const { validationResult } = require("express-validator/check");
const passport = require("passport");
var expressValidator = require("express-validator");

// Gets registration page
router.get("/register", function(req, res, next) {
  // console.log("10 : " + req.user);
  // console.log("10 : " + req.isAuthenticated());
  res.render("register", {
    title: "Form Validation",
    isLoggedIn: req.isAuthenticated(),
    success: req.session.success,
    errors: req.session.errors
  });
  req.session.errors = null;
});

// Verifies that new user has filled in the signup form correctly and creates user
router.post("/register", function(req, res, next) {
  console.log(req);
  req
    .check("name", "username must be between  6 and 18 character")
    .isLength({ min: 6, max: 18 }),
    req
      .check("email", "invalid email adress")
      .exists()
      .isEmail()
      .contains("mail.sfsu.edu");
  // req.check('email', 'Please enter your sfsu student email').not().contains('mail.sfsu.edu');
  req
    .check("password", "password must be between  6 and 18 character")
    .isLength({ min: 6, max: 18 }),
    //req.check('password', 'password not match').equals(req.body.password_confirm);
    req.check("terms", "You must accept the terms and conditions.").equals("1");
  req.check("privacy", "You must accept the privacy policy").equals("1");

  var errors = req.validationErrors();
  // const errors = validationResult(req).array({ onlyFirstError: true });
  if (errors) {
    console.log(`errors: ${JSON.stringify(errors)}`);

    res.json(JSON.stringify({ errors: errors }));
    // res.render("register", {
    //   title: "Registeration Error",
    //   errors: errors
    // });
  } else {
    const { name, email, password, password_confirm } = req.body;
    console.log("email is: " + req.body.email);
    User.checkValid(email).then(isValid => {
      //if there is no similar user in the the user table--> insert the user
      if (isValid) {
        console.log("valid");
        User.register(name, email, password).then(userID => {
          const user_id = userID;
          req.login({ id: userID }, () => res.redirect("/"));
          console.log(userID);
          console.log("user register post: " + req.user);
          // console.log("isAthenticated: "+req.isAuthenticated());
        });

        //if there is similar user exists in the table --> show error
      } else {
        console.log("not valid");
        res.render("register", {
          title: "Error : Similar user exists",
          isLoggedIn: req.isAuthenticated()
        });
      }
    });
  }
});

// Redirect for failed login
router.get("/login/failed", (req, res) => {
  res.render("register", {
    login: true,
    loginError: true,
    isLoggedIn: req.isAuthenticated()
  });
});

// Get login page
router.get("/login", function(req, res) {
  res.render("login", {
    title: "Login",
    isLoggedIn: req.isAuthenticated()
  });
  console.log("user login get: " + req.user.id);
});

// Logs in user
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login/failed",
    failureFlash: false
  })
);

// Logs out user
router.get("/logout", function(req, res) {
  req.logout();
  req.session.destroy();
  res.redirect("/");
});

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((id, done) => {
  done(null, id);
});

module.exports = router;
