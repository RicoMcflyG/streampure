// backend/server/routes/profile.js
const express = require("express");
const crypto = require("crypto");
const { authRequired } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const { updateUser } = require("../data/userStore");

const router = express.Router();

// Log a play: POST /api/profile/log-play
router.post(
  "/log-play",
  authRequired,
  asyncHandler(async (req, res) => {
    const user = req.user;
    const { id, title, artist, cover } = req.body || {};
    if (!id || !title) {
      return res.status(400).json({ message: "Track id and title required" });
    }

    const now = new Date().toISOString();

    // Recently played: newest first, max 50
    user.recentlyPlayed = [
      {
        trackId: id,
        title,
        artist,
        cover: cover || "",
        playedAt: now,
      },
      ...(user.recentlyPlayed || []).filter((t) => t.trackId !== id),
    ].slice(0, 50);

    // Play counts
    if (!user.playCounts) user.playCounts = {};
    const existing = user.playCounts[id] || {
      trackId: id,
      title,
      artist,
      cover: cover || "",
      count: 0,
    };
    existing.count += 1;
    user.playCounts[id] = existing;
    // playCounts is a Mixed field, so Mongoose can't auto-detect the
    // in-place mutation above — flag it explicitly or the counts silently
    // wouldn't persist.
    user.markModified("playCounts");

    await updateUser(user);
    res.json({ ok: true });
  })
);

// GET /api/profile/recently-played
router.get(
  "/recently-played",
  authRequired,
  asyncHandler(async (req, res) => {
    const user = req.user;
    const recently = user.recentlyPlayed || [];
    const playCounts = user.playCounts || {};

    const mostPlayed = Object.values(playCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    res.json({ recently, mostPlayed });
  })
);

// ---------------------------------------------------------------------
// Liked Songs
// ---------------------------------------------------------------------

// GET /api/profile/liked
router.get(
  "/liked",
  authRequired,
  asyncHandler(async (req, res) => {
    res.json(req.user.likedSongs || []);
  })
);

// POST /api/profile/liked  { id, title, artist, cover, preview }
router.post(
  "/liked",
  authRequired,
  asyncHandler(async (req, res) => {
    const user = req.user;
    const { id, title, artist, cover, preview } = req.body || {};
    if (!id || !title) {
      return res.status(400).json({ message: "Track id and title required" });
    }

    const liked = user.likedSongs || [];
    if (!liked.some((t) => String(t.id) === String(id))) {
      liked.unshift({
        id,
        title,
        artist: artist || "",
        cover: cover || "",
        preview: preview || null,
        likedAt: new Date().toISOString(),
      });
    }
    user.likedSongs = liked;
    await updateUser(user);
    res.json(user.likedSongs);
  })
);

// DELETE /api/profile/liked/:id
router.delete(
  "/liked/:id",
  authRequired,
  asyncHandler(async (req, res) => {
    const user = req.user;
    user.likedSongs = (user.likedSongs || []).filter(
      (t) => String(t.id) !== String(req.params.id)
    );
    await updateUser(user);
    res.json(user.likedSongs);
  })
);

// ---------------------------------------------------------------------
// User-created playlists
// ---------------------------------------------------------------------

// GET /api/profile/playlists
router.get(
  "/playlists",
  authRequired,
  asyncHandler(async (req, res) => {
    res.json(req.user.playlists || []);
  })
);

// POST /api/profile/playlists  { name }
router.post(
  "/playlists",
  authRequired,
  asyncHandler(async (req, res) => {
    const user = req.user;
    const name = (req.body?.name || "").trim();
    if (!name) return res.status(400).json({ message: "Playlist name required" });

    const playlist = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      tracks: [],
    };
    user.playlists = [...(user.playlists || []), playlist];
    await updateUser(user);
    res.status(201).json(playlist);
  })
);

// DELETE /api/profile/playlists/:playlistId
router.delete(
  "/playlists/:playlistId",
  authRequired,
  asyncHandler(async (req, res) => {
    const user = req.user;
    user.playlists = (user.playlists || []).filter((p) => p.id !== req.params.playlistId);
    await updateUser(user);
    res.json(user.playlists);
  })
);

// POST /api/profile/playlists/:playlistId/tracks  { id, title, artist, cover, preview, durationHint }
router.post(
  "/playlists/:playlistId/tracks",
  authRequired,
  asyncHandler(async (req, res) => {
    const user = req.user;
    const playlist = (user.playlists || []).find((p) => p.id === req.params.playlistId);
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    const { id, title, artist, cover, preview, durationHint } = req.body || {};
    if (!id || !title) {
      return res.status(400).json({ message: "Track id and title required" });
    }

    if (!playlist.tracks.some((t) => String(t.id) === String(id))) {
      playlist.tracks.push({
        id,
        title,
        artist: artist || "",
        cover: cover || "",
        preview: preview || null,
        durationHint: durationHint || "",
      });
    }
    await updateUser(user);
    res.json(playlist);
  })
);

// DELETE /api/profile/playlists/:playlistId/tracks/:trackId
router.delete(
  "/playlists/:playlistId/tracks/:trackId",
  authRequired,
  asyncHandler(async (req, res) => {
    const user = req.user;
    const playlist = (user.playlists || []).find((p) => p.id === req.params.playlistId);
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    playlist.tracks = playlist.tracks.filter((t) => String(t.id) !== String(req.params.trackId));
    await updateUser(user);
    res.json(playlist);
  })
);

module.exports = router;
