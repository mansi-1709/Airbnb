const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const methodOverride = require("method-override");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");
const reviewController = require("../controllers/review");

router.use(express.urlencoded({ extended: true }));
router.use(methodOverride('_method'));


//Reviews Post Route
router.post("/" ,isLoggedIn, validateReview, wrapAsync(reviewController.createReview));
 

//Review Delete Route
router.delete("/:reviewId",isLoggedIn, isReviewAuthor, wrapAsync(reviewController.deleteReview));

module.exports = router;
