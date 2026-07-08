const express = require("express");
const router = express.Router();
const Concert = require("../models/Concert");

router.get("/", async (_req, res) => {
  const concerts = await Concert.find().sort({ date: 1 });
  res.json(concerts);
});

router.get("/location/:city", async (req, res) => {
  const concerts = await Concert.find({ location: { $regex: req.params.city, $options: "i" } });
  res.json(concerts);
});

router.get("/range", async (req, res) => {
  const { start, end } = req.query;
  const concerts = await Concert.find({
    date: { $gte: new Date(start), $lte: new Date(end) }
  });
  res.json(concerts);
});

router.get("/artist/:name", async (req, res) => {
  const concerts = await Concert.find({ artist: req.params.name });
  res.json(concerts);
});

module.exports = router;
