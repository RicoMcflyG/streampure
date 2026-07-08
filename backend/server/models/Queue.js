const mongoose = require("mongoose");
const queueSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  tracks: [{ title: String, artist: String, duration: String }]
});
module.exports = mongoose.model("Queue", queueSchema);
