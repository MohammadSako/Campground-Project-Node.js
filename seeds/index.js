const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground'); 

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    // useCreateIndex: true,// maybe not supported..
    useUnifiedTopology: true
});
//to connect to mongoose server mongodb..

const db = mongoose.connection;
//mongoose.connection.on() to shortcut this
//mongoose.connection.once() to shortcut this
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database is connected..");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        //because the data is 1000 cities..
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 30) + 10;
        const camp = new Campground({
            author: '6300bfcc65dcdc0ff799f9e6', //Your User ID
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Iste, minima blanditiis maxime nam cupiditate architecto ipsam doloribus',
            price,
            geometry: { 
                "type" : "Point",
                "coordinates" : [//Reseeding Our Database (again): (554) this will connect the campground with its location.
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ] 
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dai7hljsg/image/upload/v1661777132/YelpCamp/yfffpwbfkcn1cegskxao.jpg',
                    filename: 'YelpCamp/yfffpwbfkcn1cegskxao',
                }
            ],
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})
