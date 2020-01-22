/*
Author: Raya Farshad
Date: 12/16/19
Description: API for posting listings.
*/

const express = require("express");
const multer = require("multer");
const Jimp = require("jimp");
const path = require("path");
const db = require("../models/database.js");
const router = express.Router();

// Converts js time to MySQL datetime format to fit database model
(function() {
  Date.prototype.toYMD = Date_toYMD;
  function Date_toYMD() {
    var year, month, day;
    year = String(this.getFullYear());
    month = String(this.getMonth() + 1);
    if (month.length == 1) {
      month = "0" + month;
    }
    day = String(this.getDate());
    if (day.length == 1) {
      day = "0" + day;
    }
    return year + "-" + month + "-" + day;
  }
})();

// Checks if user is logged in
async function checkAuthentication(req, res, next) {
  if (req.isAuthenticated()) next();
  else res.redirect("/");
}

// Gets list of classes to post textbooks for
async function getClasses(req, res, next) {
  await db.execute("SELECT * FROM classes", (err, classes) => {
    if (err) throw err;
    console.log(classes);
    req.classesList = classes;
    next();
  });
}

//Set Storage for file uploads
const storage = multer.diskStorage({
  destination: "./public/images/",
  filename(req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});

//Initialize the upload variable
const upload = multer({
  storage: storage,
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  },
  limits: { fileSize: 5000000 }
});

//check file type
function checkFileType(file, cb) {
  //Allowed ext
  const filetypes = /jpeg|jpg|png/;
  //check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  //check mime
  // const mimetype = filetypes.test(file.mimeType);
  if (extname) {
    return cb(null, true);
  } else {
    cb("Error: Upload images only!");
  }
}

// Gets list of listing categories
async function getCategories(req, res, next) {
  await db.execute("SELECT * FROM category", (err, categories) => {
    if (err) throw err;
    req.categoriesList = categories;
    next();
  });
}

// generates thumbnail for posting
async function makeThumb(path) {
  try {
    const buffer = await Jimp.read(path).then(lenna =>
      lenna
        .resize(300, Jimp.AUTO) // resize
        .quality(60) // set JPEG quality
        .getBufferAsync(Jimp.MIME_JPEG)
    );
    return buffer;
  } catch (err) {
    return "err";
  }
}

//gets sell page
router.get(
  "/sell",
  checkAuthentication,
  getCategories,
  getClasses,
  (req, res) => {
    // var searchResult = req.searchResult;
    var categoriesList = req.categoriesList;
    var userid = req.user.id;
    var classesList = req.classesList;

    res.render("pages/postlistings", {
      // cards: searchResult,
      categoriesList: categoriesList,
      searchTerm: req.query.search,
      searchCategory: req.query.category,
      isLoggedIn: req.isAuthenticated(),
      classesList: classesList
    });
  }
);

// Creates new listing from required fields in form
router.post(
  "/sell",
  checkAuthentication,
  upload.single("thumb"),
  (req, res) => {
    // const img = fs.readFileSync(req.file.path);
    (async () => {
      let thumb;
      if (req.file) {
        thumb = await makeThumb(req.file.path);
        console.log(req.file);
      }
      if (thumb === "err") {
        res.render("pages/postlistings", {
          isLoggedIn: req.isAuthenticated(),
          err: "Error parsing image."
        });
        console.log("there is an error in making tumb");
        return;
      }
      if (req.file == undefined) {
        res.redirect("/sell");
        return;
      }

      var curDate = new Date();
      var curDateYMD = curDate.toYMD();
      const insertRes = await db.query(
        `INSERT INTO listing (
       title, price, description, 
      image, is_sold, date, user_id, category_id, class_id
      ) VALUES (?,?,?,?,?,?,?,?,?) `,
        [
          req.body.title,
          req.body.price,
          req.body.description,
          req.file.path.substring(7),
          0,
          curDateYMD,
          req.user.id,
          req.body.category,
          req.body.class
        ]
      );
      console.log("req.body: " + req.user.id);
      console.log("date: " + curDateYMD);

      res.redirect("/dashboard");
    })();
  }
);

module.exports = router;
