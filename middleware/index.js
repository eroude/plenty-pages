// all middleware
let Book = require("../models/book");
let Review = require("../models/review");
let middlewareObj = {};

middlewareObj.checkIfAdmin = function(req, res, next) {
  if (req.isAuthenticated() && req.user.username === "admin") {
    next();
  } else {
    req.flash("error", "You are not authorized!");
    res.redirect("back");
  }
};

middlewareObj.checkReviewOwnership = function(req, res, next) {
  if (req.isAuthenticated()) {
    Review.findById(req.params.review_id, function(err, foundReview) {
      if (err || !foundReview) {
        res.redirect("back");
      } else {
        // does user own the review?
        if (foundReview.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash("error", "You don't have permission to do that");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in to do that");
    res.redirect("back");
  }
};

middlewareObj.checkReviewExistence = function(req, res, next) {
  if (req.isAuthenticated()) {
    Book.findById(req.params.id)
      .populate("reviews")
      .exec(function(err, foundBook) {
        if (err || !foundBook) {
          req.flash("error", "Book not found.");
          res.redirect("back");
        } else {
          // check if req.user._id exists in foundBook.reviews
          let foundUserReview = foundBook.reviews.some(function(review) {
            return review.author.id.equals(req.user._id);
          });
          if (foundUserReview) {
            req.flash("error", "You already wrote a review.");
            return res.redirect("/books/" + foundBook._id);
          }
          // if the review was not found, go to the next middleware
          next();
        }
      });
  } else {
    req.flash("error", "You need to login first.");
    res.redirect("back");
  }
};

middlewareObj.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You need to be logged in to do that");
  res.redirect("/login");
};

module.exports = middlewareObj;
