let express = require("express");
let router = express.Router();
let passport = require("passport");
let User = require("../models/user");

router.get("/", function(req, res) {
  res.render("landing");
});

// ----------------------------------------------
// AUTHENTICATION ROUTES
// ----------------------------------------------
// Show registration form
router.get("/register", function(req, res) {
  res.render("register");
});

// Handle registration form
router.post("/register", function(req, res) {
  let newUser = new User({ username: req.body.username });
  User.register(newUser, req.body.password, function(err, user) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("/register");
    }
    passport.authenticate("local")(req, res, function() {
      req.flash("success", "Welcome to Plenty Pages " + user.username);
      res.redirect("/books");
    });
  });
});

// Show login form
router.get("/login", function(req, res) {
  res.render("login");
});

// Handle login form
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/books",
    failureRedirect: "/register",
    failureFlash: "You do not have an account! Please register."
  }),
  function(req, res) {}
);

// logout
router.get("/logout", function(req, res) {
  req.logout();
  req.flash("success", "Successfully logged out!");
  res.redirect("/");
});

// ----------------------------------
// MIDDLEWARE
// ----------------------------------

function checkIfAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.username === "admin") {
    next();
  } else {
    req.flash("error", "You are not authorized!");
    res.redirect("back");
  }
}

function calculateAverage(reviews) {
  if (reviews.length === 0) {
    return 0;
  }
  let sum = 0;
  reviews.forEach(function(element) {
    sum += element.rating;
  });
  return sum / reviews.length;
}

module.exports = router;
