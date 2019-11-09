let mongoose = require("mongoose");

let bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  image: String,
  synopsis: String,
  price: Number,
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review"
    }
  ],
  rating: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Book", bookSchema);
