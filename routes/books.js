let express = require("express");
let router = express.Router();
let Book = require("../models/book");
let Review = require("../models/review");
let middleware = require("../middleware");

// INDEX - Show all books
router.get("/", function(req, res) {
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), "gi");
    Book.find({ title: regex }, function(err, allBooks) {
      if (err) {
        console.log(err);
      } else {
        res.render("index", { books: allBooks });
      }
    });
  } else {
    Book.find({}, function(err, allBooks) {
      if (err) {
        console.log(err);
      } else {
        res.render("index", { books: allBooks });
      }
    });
  }
});

// CREATE - Add new books to bookstore
router.post("/", middleware.checkIfAdmin, function(req, res) {
  let title = req.body.title;
  let author = req.body.author;
  let image = req.body.image;
  let synopsis = req.body.synopsis;
  let price = req.body.price;
  let newBook = {
    title: title,
    author: author,
    image: image,
    synopsis: synopsis,
    price: price
  };
  Book.create(newBook, function(err, newlyCreated) {
    if (err) {
      console.log(err);
    } else {
      req.flash("success", "Successfully added book!");
      res.redirect("/books");
    }
  });
});

// NEW - Show form to add new book
router.get("/new", middleware.checkIfAdmin, function(req, res) {
  res.render("new");
});

// SHOW - shows more info about 1 book
router.get("/:id", function(req, res) {
  //find the book with provided ID
  Book.findById(req.params.id)
    .populate("books")
    .populate({
      path: "reviews",
      options: { sort: { createdAt: -1 } }
    })
    .exec(function(err, foundBook) {
      if (err) {
        console.log(err);
      } else {
        //render show template with that book
        res.render("show", { book: foundBook });
      }
    });
});

// EDIT - Show edit form for 1 book
router.get("/:id/edit", middleware.checkIfAdmin, function(req, res) {
  Book.findById(req.params.id, function(err, foundBook) {
    res.render("edit", { book: foundBook }); // change to render books/edit if using routing
  });
});

// UPDATE - Handle edit form
router.put("/:id", middleware.checkIfAdmin, function(req, res) {
  Book.findByIdAndUpdate(req.params.id, req.body.book, function(
    err,
    updatedBook
  ) {
    if (err) {
      res.redirect("/books");
    } else {
      req.flash("success", "Book updated successfully!");
      res.redirect("/books/" + req.params.id);
    }
  });
});

// DELETE
router.delete("/:id", middleware.checkIfAdmin, function(req, res) {
  Book.findById(req.params.id, function(err, book) {
    if (err) {
      res.redirect("/books");
    } else {
      // deletes all reviews associated with the book
      Review.deleteMany({ _id: { $in: book.reviews } }, function(err) {
        if (err) {
          console.log(err);
          return res.redirect("/books");
        }
        //  delete the book
        book.deleteOne();
        req.flash("success", "Book deleted successfully!");
        res.redirect("/books");
      });
    }
    // }
  });
});

// For Fuzzy Search validation
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
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
