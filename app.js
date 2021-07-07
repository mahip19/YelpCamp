if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
// for using boiler plates in ejs files
const ejsMate = require("ejs-mate");
const session = require("express-session");

const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");

const methodoverride = require("method-override");

const campgroundsRoutes = require("./routes/campgrounds");
const reviewsRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

const mongoSanitize = require("express-mongo-sanitize");

const helmet = require("helmet");

const MongoDBStore = require("connect-mongo")(session);
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";
// const dbUrl = "mongodb://localhost:27017/yelp-camp";
// mongodb://localhost:27017/yelp-camp
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

//To connect database
const db = mongoose.connection;
db.on("erro", console.error.bind(console, "connection error: "));
db.once("open", () => {
  console.log("Database Connected");
});

const app = express();
const path = require("path");

//ask express to use 'ejs-mate' instead of default 'ejs'
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodoverride("_method"));

app.use(express.static(path.join(__dirname, "public")));

app.use(mongoSanitize());

const secret = process.env.SECRET || "thisshouldbeabettersecret";

const store = new MongoDBStore({
  url: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60,
});

store.on("error", function (e) {
  console.log("mongo session error: ", e);
});

const sessionConfig = {
  store,
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //expired after a week
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));

// for every single req, we'll check if there's something in flash
// under 'success' and then pass it to locals to get access
app.use(flash());
// equired to initialize Passport.
// If your application uses persistent login sessions
app.use(passport.initialize());
app.use(passport.session());

app.use(helmet());

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
  "https://cdn.jsdelivr.net",
  "https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha1/css/bootstrap.min.css",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
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
        "https://res.cloudinary.com/dfreaqahi/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

app.use((req, res, next) => {
  res.locals.currUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/campgrounds", campgroundsRoutes);
app.use("/campgrounds/:id/reviews", reviewsRoutes);
app.use("/", userRoutes);

// passport would use the localStrategy and authentication method for that
// will be in User
//  ---- authenticate method will be added already as it is static method
// ----- for passport-local-mongoose
passport.use(new LocalStrategy(User.authenticate()));

// tells passport how to serialize user i.e
// how do we store user in session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
  res.render("home");
  //   res.send("Hello");
});

app.get("/fakeUser", async (req, res) => {
  const user = new User({ email: "mahip@gmail.com", username: "brabbit" });
  //will store username and hashedpwd on its own
  const newUser = await User.register(user, "12345");
  res.send(newUser);
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Requested page not found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oops, something went wrong";
  res.status(statusCode).render("errors", { err });
});

app.listen(3000, () => {
  console.log("connected");
});
