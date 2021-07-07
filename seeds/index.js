const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

//To connect database
const db = mongoose.connection;
db.on("erro", console.error.bind(console, "connection error: "));
db.once("open", () => {
  console.log("Database Connected");
});

//picking up random element from given array
const sample = (array) => array[Math.floor(Math.random() * array.length)];

//seeding our database
const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 200; i++) {
    const random100 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      // Your user id
      author: "60e1b22576b1170a44564d80",
      //random city and state from cities
      location: `${cities[random100].city}, ${cities[random100].state}`,
      //random element from descriptors and places array
      title: `${sample(descriptors)} ${sample(places)}`,
      geometry: {
        type: "Point",
        coordinates: [cities[random100].longitude, cities[random100].latitude],
      },
      images: [
        {
          url: "https://res.cloudinary.com/dfreaqahi/image/upload/v1625493072/YelpCamp/xdoi6cr0liqjodigcfsp.jpg",
          filename: "YelpCamp/xdoi6cr0liqjodigcfsp",
        },
        {
          url: "https://res.cloudinary.com/dfreaqahi/image/upload/v1625493073/YelpCamp/ljizoznkh07pzshjihek.jpg",
          filename: "YelpCamp/ljizoznkh07pzshjihek",
        },
        {
          url: "https://res.cloudinary.com/dfreaqahi/image/upload/v1625493072/YelpCamp/zt01ssx17b48zih18nvo.jpg",
          filename: "YelpCamp/zt01ssx17b48zih18nvo",
        },
        {
          url: "https://res.cloudinary.com/dfreaqahi/image/upload/v1625493073/YelpCamp/s34wjri9j8d5kh9tlnks.jpg",
          filename: "YelpCamp/s34wjri9j8d5kh9tlnks",
        },
      ],
      description:
        "Donec at diam eleifend, dignissim arcu eget, egestas tortor. Proin ex massa, fringilla eget massa eget, feugiat pellentesque quam. Integer consequat neque quis tortor pellentesque, ut aliquam arcu rutrum. Vestibulum interdum et justo eget malesuada. Vivamus condimentum erat et elit accumsan viverra. Sed suscipit nibh neque. Nam eget pharetra mi. Pellentesque nec tincidunt magna. Fusce dapibus ante nec massa pretium facilisis. Proin blandit egestas urna, sit amet auctor orci condimentum eget. Mauris justo felis, condimentum at est ac, volutpat semper tellus.",
      price,
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
