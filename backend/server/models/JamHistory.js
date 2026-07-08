const mongoose = require("mongoose");
const jamHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sessionName: String,
  date: Date,
  tracks: [String]
});
module.exports = mongoose.model("JamHistory", jamHistorySchema);
