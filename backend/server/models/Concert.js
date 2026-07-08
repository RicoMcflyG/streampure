const mongoose = require("mongoose");
const concertSchema = new mongoose.Schema({
  title: String,
  date: Date,
  location: String,
  image: String,
  artist: String
});
module.exports = mongoose.model("Concert", concertSchema);
