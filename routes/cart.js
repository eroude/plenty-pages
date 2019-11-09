let express = require("express");
let router = express.Router();
let middleware = require("../middleware");

// Get book model
let Book = require("../models/book");

// Get add book to cart
router.get("/add/:id", middleware.isLoggedIn, function(req, res) {
  Book.findById(req.params.id, function(err, book) {
    if (err) console.log(err);

    if (typeof req.session.cart == "undefined") {
      req.session.cart = [];
      req.session.cart.push({
        title: book.title,
        qty: 1,
        price: book.price,
        image: book.image
      });
    } else {
      let cart = req.session.cart;
      let newItem = true;
      for (let i = 0; i < cart.length; i++) {
        if (cart[i].title == book.title) {
          cart[i].qty++;
          newItem = false;
          break;
        }
      }

      if (newItem) {
        cart.push({
          title: book.title,
          qty: 1,
          price: book.price,
          image: book.image
        });
      }
    }

    console.log(req.session.cart);
    req.flash("success", "Book added to cart!");
    res.redirect("/books");
  });
});

// Get checkout page
router.get("/checkout", middleware.isLoggedIn, function(req, res) {
  if (req.session.cart && req.session.cart.length == 0) {
    delete req.session.cart;
    res.redirect("/cart/checkout");
  } else {
    res.render("checkout", {
      title: "Checkout",
      cart: req.session.cart
    });
  }
});

// Get update book quantity
router.get("/update/:product", middleware.isLoggedIn, function(req, res) {
  let slug = req.params.product;
  let cart = req.session.cart;
  let action = req.query.action;

  for (let i = 0; i < cart.length; i++) {
    if (cart[i].title === slug) {
      switch (action) {
        case "add":
          cart[i].qty++;
          break;
        case "remove":
          cart[i].qty--;
          if (cart[i].qty < 1) cart.splice(i, 1);
          break;
        case "clear":
          cart.splice(i, 1);
          if (cart.length == 0) delete req.session.cart;
          break;
        default:
          console.log("Update failed!");
          break;
      }
      break;
    }
  }
  req.flash("success", "Cart updated!");
  res.redirect("/cart/checkout");
});

// Get clear cart
router.get("/clear", middleware.isLoggedIn, function(req, res) {
  delete req.session.cart;
  req.flash("success", "Cart cleared!");
  res.redirect("/cart/checkout");
});

// Get buy now
router.get("/buynow", middleware.isLoggedIn, function(req, res) {
  delete req.session.cart;
  res.sendStatus(200);
});

module.exports = router;
