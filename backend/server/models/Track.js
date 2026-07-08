const mongoose = require("mongoose");
const trackSchema = new mongoose.Schema({
  title: String,
  artist: String,
  album: String,
  cover: String,
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});
module.exports = mongoose.model("Track", trackSchema);
