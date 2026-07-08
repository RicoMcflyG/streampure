const express = require("express");
const router = express.Router();
const Station = require("../models/Station");

router.get("/", async (_req, res) => {
  const stations = await Station.find();
  res.json(stations);
});

router.get("/mood/:mood", async (req, res) => {
  const stations = await Station.find({ mood: req.params.mood });
  res.json(stations);
});

router.get("/:name", async (req, res) => {
  const station = await Station.findOne({ name: req.params.name });
  if (!station) return res.status(404).json({ message: "Station not found" });
  res.json(station);
});

module.exports = router;
