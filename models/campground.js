const mongoose = require('mongoose');
const Review = require('./review');//Campground Delete Middleware: (474)
const Schema = mongoose.Schema; 
//this help to shortcut the code, insted of writing "mongoose.Schema.bla bla" => "Schema.bla bla" 

const ImageSchema = new Schema({
    url: String,
    filename: String
});
ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
});

//Adding Custom Popups: (558)
const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],

    //Working With GeoJSON: (547)
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author:
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts); ////Adding Custom Popups: (558)

//Adding Custom Popups: (558)
CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
    return `<strong><a href="/campgrounds/${this._id}" >${this.title}</a></strong>
    <p>${this.description.substring(0, 50)}..</p>`
});

//Campground Delete Middleware: (474)
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if(doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
});

module.exports = mongoose.model('Campground', CampgroundSchema);
