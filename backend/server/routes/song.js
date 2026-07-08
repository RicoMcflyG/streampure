const express = require("express");
const router = express.Router();
const Song = require("../models/Song");

router.get("/:title", async (req, res) => {
  try {
    const song = await Song.findOne({ title: req.params.title });
    if (!song) return res.status(404).json({ message: "Song not found" });
    res.json(song);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/contributor/:name", async (req, res) => {
  const songs = await Song.find({ "contributors.name": req.params.name });
  res.json(songs);
});

module.exports = router;
