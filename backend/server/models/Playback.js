const mongoose = require("mongoose");
const playbackSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "JamSession" },
  track: String,
  timestamp: Number,
  isPlaying: Boolean
});
module.exports = mongoose.model("Playback", playbackSchema);
