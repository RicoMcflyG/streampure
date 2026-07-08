const mongoose = require("mongoose");
const songSchema = new mongoose.Schema({
  title: String,
  artist: String,
  album: String,
  contributors: [{ role: String, name: String }]
});
module.exports = mongoose.model("Song", songSchema);
