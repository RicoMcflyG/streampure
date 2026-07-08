const express = require("express");
const router = express.Router();
const Queue = require("../models/Queue");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  const queue = await Queue.findOne({ userId: req.user.id });
  res.json(queue?.tracks || []);
});

router.post("/add", auth, async (req, res) => {
  const { title, artist, duration } = req.body;
  let queue = await Queue.findOne({ userId: req.user.id });
  if (!queue) queue = new Queue({ userId: req.user.id, tracks: [] });
  queue.tracks.push({ title, artist, duration });
  await queue.save();
  res.json({ message: "Track added to queue", tracks: queue.tracks });
});

router.delete("/remove/:index", auth, async (req, res) => {
  const index = parseInt(req.params.index);
  const queue = await Queue.findOne({ userId: req.user.id });
  if (!queue || index < 0 || index >= queue.tracks.length) {
    return res.status(400).json({ message: "Invalid index" });
  }
  queue.tracks.splice(index, 1);
  await queue.save();
  res.json({ message: "Track removed", tracks: queue.tracks });
});

module.exports = router;
