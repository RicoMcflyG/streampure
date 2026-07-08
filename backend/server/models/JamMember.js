const mongoose = require("mongoose");
const jamMemberSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "JamSession" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  joinedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("JamMember", jamMemberSchema);
