// Refactoring To Campgrounds Controller: (526)
const Campground = require('../models/campground');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken }); //this contains the two methods we want, forward and reverse geo code.
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    // if (!req.isAuthenticated()) {
    //     req.flash('error', 'You not signed in..');
    //     return res.redirect('/login');
    // } // we moved this to a middleware.js
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res) => {//catchAsync => Defining ExpressError Class: (446)
    //More Errors: (447)
    // if(!req.body.campground) throw new ExpressError('Invalid campground Data', 400);
    //Working With GeoJSON: (546-547)
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}));//Storing Uploaded Image Links In Mongo: (536)
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'A New Campground has been Made..'); //(493)
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Campground not found!!!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cant find the campground..')
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));//Storing Uploaded Image Links In Mongo: (536)
    campground.images.push(...imgs);//spread operator 
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) { //this will delete from Cloudinary
            await cloudinary.uploader.destroy(filename);
        } 
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } } ) //this will delete from Mongo
    }
    req.flash('success', 'Successfully Updated the Campground..');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully Deleted the Campground..');
    res.redirect(`/campgrounds`)
}