const mongoose = require("mongoose");
const stationSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  mood: String,
  color: String,
  tracks: [String]
});
module.exports = mongoose.model("Station", stationSchema);
