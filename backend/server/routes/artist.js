const express = require("express");
const router = express.Router();
const Artist = require("../models/Artist");

router.get("/:name", async (req, res) => {
  try {
    const artist = await Artist.findOne({ name: req.params.name });
    if (!artist) return res.status(404).json({ message: "Artist not found" });
    res.json(artist);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", async (_req, res) => {
  const artists = await Artist.find().select("name image");
  res.json(artists);
});

module.exports = router;
