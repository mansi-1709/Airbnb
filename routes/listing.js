const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const methodOverride = require("method-override");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listing");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

router.use(express.urlencoded({ extended: true }));
router.use(methodOverride('_method'));

router
.route("/")
//index route
.get( wrapAsync(listingController.index))
//create route
.post(isLoggedIn, upload.single('listing[image]'),   wrapAsync(listingController.createListing));


//New Route
router.get("/new",isLoggedIn, listingController.renderNewForm );

router
.route("/:id")
//Show Route
.get( wrapAsync(listingController.showListing))
//Update Route
.put(isLoggedIn, isOwner, upload.single('listing[image]'), validateListing,  wrapAsync(listingController.updateListing))
//Delete Route
.delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));



//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing));

module.exports = router;
