// backend/server/routes/tracks.js
//
// Public read access to the admin-uploaded catalog — no auth required,
// same as Charts/Radio/Search. Anyone using the app can browse and stream
// these; only admins can add or remove them (see routes/admin.js).
const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const Track = require("../models/Track");

const router = express.Router();

// GET /api/tracks
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const tracks = await Track.find().sort({ createdAt: -1 }).lean();
    res.json(
      tracks.map((t) => ({
        id: String(t._id),
        title: t.title,
        artist: t.artist,
        cover: t.cover || "",
        preview: t.fileUrl, // same field name the player already expects
        durationHint: t.durationHint || "",
      }))
    );
  })
);

module.exports = router;
