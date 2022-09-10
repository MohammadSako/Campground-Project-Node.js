// const express = require('express');
// const router = express.Router();
// const catchAsync = require('../utility/catchAsync'); //Register Route Logic: (513)
// const User = require('../models/user');
// const passport = require('passport');
// const users = require('../controllers/users');

// router.get('/register', users.renderRegister);

// //catchAsync => will just take any issues, any errors from here, and then pass them along to next, which will hit our error. Handler

// //Register Route Logic: (513) Fixing Register Route: (518)
// router.post('/register', catchAsync(users.register))

// router.get('/login', users.renderLogin)

// //ReturnTo Behavior: (519)
// router.post('/login', passport.authenticate('local', {failureFlash:true, failureRedirect:'/login', failureMessage: true, keepSessionInfo: true}), users.login)

// //Adding Logout: (516)
// router.get('/logout', users.logout); 

// module.exports = router;


////// Before => without => router.route(path) //////
// ---------------------------------------------- //
////// After => with => router.route(path) ////////

const express = require('express');
const router = express.Router();
const catchAsync = require('../utility/catchAsync'); //Register Route Logic: (513)
const User = require('../models/user');
const passport = require('passport');
const users = require('../controllers/users');

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register))

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', {failureFlash:true, failureRedirect:'/login', failureMessage: true, keepSessionInfo: true}), users.login)

router.get('/logout', users.logout) 

module.exports = router;