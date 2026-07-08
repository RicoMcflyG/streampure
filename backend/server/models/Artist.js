const mongoose = require("mongoose");
const artistSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  bio: String,
  image: String,
  albums: [String],
  collaborations: [String]
});
module.exports = mongoose.model("Artist", artistSchema);
