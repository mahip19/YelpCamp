const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");
const mxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mxGeocoding({ accessToken: mapboxToken });

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
  // if (!req.body.campground)
  //   throw new ExpressError("Invalid campground data", 400);
  const geodata = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 3,
    })
    .send();

  const newCampground = new Campground(req.body.campground);

  newCampground.geometry = geodata.body.features[0].geometry;

  newCampground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  newCampground.author = req.user._id;
  await newCampground.save();
  console.log(newCampground);
  req.flash("success", "Successfully made a new campground!");
  res.redirect(`/campgrounds/${newCampground._id}`);
};

module.exports.showCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");

  // console.log(campground);

  res.render("campgrounds/show", { campground });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;

  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Cannot find that campground");
    return res.redirect("/campgrounds");
  }

  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  const updatedCamp = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });

  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));

  updatedCamp.images.push(...imgs);

  if (req.body.deleteImages) {
    for (let file_name of req.body.deleteImages) {
      await cloudinary.uploader.destroy(file_name);
    }

    await updatedCamp.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
    console.log(updatedCamp);
  }

  await updatedCamp.save();
  req.flash("success", "Camground has been updated!");
  res.redirect(`/campgrounds/${updatedCamp._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;

  const deletedCamp = await Campground.findByIdAndDelete(id);
  req.flash("success", "Deleted a campground");

  res.redirect("/campgrounds/");
};
