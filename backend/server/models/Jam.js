const mongoose = require("mongoose");
const jamSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: Date,
  tracks: [String]
});
module.exports = mongoose.model("Jam", jamSchema);
