const mongoose = require("mongoose");

const images = mongoose.Schema({
  name: {
    type: String,
  },
  created_at: {
    type: Date,
    default : Date.now()
  },
  updated_at: {
    type: Date
  },
});

const Image = mongoose.model("image", images);
module.exports.Image = Image;
module.exports.images = images;
