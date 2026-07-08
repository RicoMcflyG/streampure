const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Jam = require("../models/Jam");
const auth = require("../middleware/auth");

router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    const jams = await Jam.find({ userId: req.user.id }).sort({ date: -1 });
    res.json({ user: { name: user.name, email: user.email, avatar: user.avatar || "" }, jams });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
