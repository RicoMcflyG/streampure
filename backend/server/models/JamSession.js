const mongoose = require("mongoose");
const jamSessionSchema = new mongoose.Schema({
  name: String,
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  previewTrack: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("JamSession", jamSessionSchema);
