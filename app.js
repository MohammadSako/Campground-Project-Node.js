if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utility/ExpressError')//More Errors: (447)
const methodOverride = require('method-override');
const passport = require('passport'); // Configuring Passport: (510)
const localStrategy = require('passport-local'); // Configuring Passport: (510)
const User = require('./models/user'); // Configuring Passport: (510)
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');//Mongo Injection: (566)
const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds'); 
const reviewRoutes = require('./routes/reviews'); 

// Using Mongo For Our Session Store: (573)
const MongoStore = require('connect-mongo')(session);

//Pushing to Heroku: (576)
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    // useCreateIndex: true,// maybe not supported..
    useUnifiedTopology: true,
    // useFindAndModify: false// maybe not supported..
});


// // Setting Up Mongo Atlas: (573) //Use this to store the data in the cloud..
// const dbUrl = process.env.DB_URL
// mongoose.connect(dbUrl, {
//     useNewUrlParser: true,
//     // useCreateIndex: true,// maybe not supported..
//     useUnifiedTopology: true,
//     // useFindAndModify: false// maybe not supported..
// });
// mongoose.connect('mongodb://localhost:27017/yelp-camp', {
//     useNewUrlParser: true,
//     // useCreateIndex: true,// maybe not supported..
//     useUnifiedTopology: true,
//     // useFindAndModify: false// maybe not supported..
// });
//to connect to mongoose server mongodb..

const db = mongoose.connection;
//mongoose.connection.on() to shortcut this
//mongoose.connection.once() to shortcut this
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database is connected..");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })); //=>this purse the request body.
app.use(methodOverride('_method')); //Campground Edit & Update: (416)
//Serving Static Assets: (491)
app.use(express.static(path.join(__dirname, 'public')));

//Mongo Injection: (566)
// app.use(mongoSanitize());
//// Or, to replace these prohibited characters with _, use:
app.use(mongoSanitize({replaceWith: '_',}),);

//Pushing to Heroku: (576)
const secret = process.env.SECRET || 'mysecretcode';

// Setting Up Mongo Atlas: (573)
const store = new MongoStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60 //update after 24 hours automatically..
});
store.on("error", function (e) {
    console.log('Session store has an Error!!', e)
})// if it has an Error..



// Configuring Session: (492)
const sessionConfig = {
    store, //Setting Up Mongo Atlas: (573)
    name: 'session', //(569)
    secret,
    resave: false,
    saveUninitialized: true, 
    cookie: {
        httpOnly: true,
        // secure: true, // (569) use this when you Deploy..
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
// app.use(helmet());//Content Security Policy Fun: (572)(571)


//Content Security Policy Fun: (572)
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    // "https://cdn.jsdelivr.net/"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dai7hljsg/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);
// //End of => Content Security Policy Fun: (572)



// Configuring Passport: (510)
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//currentUser Helper: (517)
app.use((req, res, next) => {
    // console.log(req.session);
    console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//Register Form: (511)
app.use('/', userRoutes);
//Breaking Out Campground Routes: (489)
app.use('/campgrounds', campgroundRoutes);
//Breaking Out Review Routes: (490)
app.use('/campgrounds/:id/reviews', reviewRoutes);

//request, respond
app.get('/', (req, res) => {
    res.render('home')
});

// More Errors: (447)
// app.all('*', (req, res, next) => {
//     res.send("404 Error..")
// })
//or
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found!!!', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'There is something wrong!!'
    res.status(statusCode).render('error', { err })
})

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server Ready on ${port}..`)
});