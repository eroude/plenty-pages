let express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  flash = require("connect-flash"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  methodOverride = require("method-override"),
  Book = require("./models/book"),
  User = require("./models/user"),
  seedDB = require("./seeds");

let PORT = process.env.PORT || 27017;

// Requiring routes
let reviewRoutes = require("./routes/reviews"),
  bookRoutes = require("./routes/books"),
  cartRoutes = require("./routes/cart"),
  indexRoutes = require("./routes/index");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(flash());
// seedDB(); **** Seed the database

// PASSPORT CONFIGURATION
app.use(
  require("express-session")({
    secret: "You guessed it!",
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// CREATE CURRENTUSER USED FOR ALL ROUTES AND FOR ACCESS TO CERTAIN APP FEATURES
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

// Make cart available in each get request
app.get("*", function(req, res, next) {
  res.locals.cart = req.session.cart;
  next();
});

// ********************USE THIS CODE FOR GITHUB******************************
// mongoose.connect("mongodb://localhost:27017/bookstore", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });
mongoose
  .connect(
    "mongodb+srv://me:<howcani55>@cluster0-rkjxu.mongodb.net/test?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  )
  .then(() => {
    console.log("Connected to DB!");
  })
  .catch(err => {
    console.log("ERROR: ", err.message);
  });

// Added because the edit route for reviews findbyidandupdate is deprciated
mongoose.set("useFindAndModify", false);

app.use("/", indexRoutes);
app.use("/books", bookRoutes);
app.use("/cart", cartRoutes);
app.use("/books/:id/reviews", reviewRoutes);

app.listen(PORT, function() {
  console.log("Bookstore Server Started");
});
