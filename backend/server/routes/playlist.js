const express = require("express");
const router = express.Router();
const Track = require("../models/Track");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  try {
    const tracks = await Track.find({ ownerId: req.user.id });
    res.json(tracks);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/queue", auth, async (_req, res) => {
  res.json({ message: "Track added to queue" });
});

router.post("/share", auth, async (_req, res) => {
  res.json({ message: "Track shared successfully" });
});

module.exports = router;
