// // Breaking Out Campground Routes: (489)
// const express = require('express');
// const router = express.Router();
// const campgrounds = require('../controllers/campgrounds')
// const catchAsync = require('../utility/catchAsync'); 
// const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

// const Campground = require('../models/campground');

// // Refactoring To Campgrounds Controller: (526)
// //Campground Index: (413)
// router.get('/', catchAsync(campgrounds.index));

// // Refactoring To Campgrounds Controller: (526)
// //Campground New & Create: (415), isLoggedIn Middleware: (515)
// router.get('/new', isLoggedIn, campgrounds.renderNewForm);

// // Refactoring To Campgrounds Controller: (526)
// router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

// // Refactoring To Campgrounds Controller: (526)
// //Campground Show: (414), Displaying Reviews: (471)
// router.get('/:id', catchAsync(campgrounds.showCampground));

// // Refactoring To Campgrounds Controller: (526)
// //Campground Edit & Update: (416)
// router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

// // Refactoring To Campgrounds Controller: (526)
// router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))

// // Refactoring To Campgrounds Controller: (526)
// // Campground Delete: (417)

// router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));
// //Adding a Reviews Controller: (527) 5:50 =>
// //1- check if you are logged in.
// //2- then => are you the Author.
// //3- then => call delete campground on the controller, then we can go look at that controller It contains all the campground related functionality. 
// module.exports = router;



////// Before => without => router.route(path) //////
// ---------------------------------------------- //
////// After => with => router.route(path) ////////

//A Fancy Way To Restructure Routes: (528)
const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds')
const catchAsync = require('../utility/catchAsync'); 
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer  = require('multer');
const { storage } = require('../cloudinary');//Uploading To Cloudinary Basics: (535)
const upload = multer({ storage });

const Campground = require('../models/campground');

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))
    
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;