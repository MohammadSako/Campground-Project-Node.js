const { campgroundSchema, reviewsSchema } = require('./schemas.js'); //JOI Validation Middleware: (450)(470)
const ExpressError = require('./utility/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // console.log(req.path, req.originalUrl) //=> /new , /campgrounds/new
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You are not signed in..');
        return res.redirect('/login');
    }
    next();
}

//JOI Validation Middleware: (450)
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
} 

//Authorization Middleware: (523)
//Campground Permissions: (522)
module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You cant do this, you dont have the permission..');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

//More Reviews Authorization: (524)
module.exports.isReviewAuthor = async(req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You cant do this, you dont have the permission..');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

//Authorization Middleware: (523)
//Validating Reviews: (470)
module.exports.validateReview = (req, res, next) => {
    const {error} = reviewsSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}