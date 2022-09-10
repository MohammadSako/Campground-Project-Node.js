const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const Campground = require('../models/campground'); //Campground Edit & Update: (416)
const Review = require('../models/review');
const reviews = require('../controllers/reviews')//Adding a Reviews Controller: (527)
const ExpressError = require('../utility/ExpressError')//More Errors: (447)
const catchAsync = require('../utility/catchAsync'); //Defining ExpressError Class: (446)

//Creating Reviews: (469)
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

//Deleting Reviews: (473)
router.delete('/:reviewId',isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;