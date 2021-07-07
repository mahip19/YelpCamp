const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const Review = require("../models/review");
const { reviewSchema } = require("../schemas.js");
const { validateReview, isLoggedin, isReviewAuthor } = require("../middleware");
const reviews = require("../controllers/reviews");

//create a review
router.post("/", isLoggedin, validateReview, catchAsync(reviews.createReview));

// delete review
router.delete(
  "/:reviewId",
  isLoggedin,
  isReviewAuthor,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
