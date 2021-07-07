const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const flash = require("connect-flash");
const passport = require("passport");
const { isLoggedin, isAuthor, validateCampground } = require("../middleware");
const campgrounds = require("../controllers/campgrounds");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

router.use(passport.initialize());
router.use(passport.session());
// middleware for joi

// list of all campgrounds
router
  .route("/")
  .get(catchAsync(campgrounds.index))
  .post(
    isLoggedin,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.createCampground)
  );

// a new campground: Place this above /campgrounds/:id, or else /new will be read as /:id !!!
router.get("/new", isLoggedin, campgrounds.renderNewForm);

router
  .route("/:id")
  //Show campground details
  .get(catchAsync(campgrounds.showCampground))
  .put(
    isLoggedin,
    isAuthor,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.updateCampground)
  );

//edit campgrounds
router.get(
  "/:id/edit",
  isLoggedin,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

module.exports = router;
