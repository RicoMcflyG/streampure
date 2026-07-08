// backend/server/routes/radio.js
//
// Powers the frontend "Radio" page using the public, key-free iTunes Search
// API. (Spotify's Browse "Featured Playlists" / "Category Playlists"
// endpoints were deprecated for standard apps in Nov 2024 and preview_url
// is null for most tracks now, so this avoids that dead end entirely.)
const express = require("express");
const axios = require("axios");
const router = express.Router();

// Curated "stations" for the Radio page. Each genre is just a search term
// against iTunes — no auth, no approval process, works immediately.
const GENRES = [
  { id: "pop", name: "Pop", term: "pop hits" },
  { id: "hiphop", name: "Hip-Hop", term: "hip hop rap" },
  { id: "rnb", name: "R&B / Soul", term: "r&b soul" },
  { id: "gospel", name: "Gospel", term: "gospel praise" },
  { id: "island", name: "Island / Reggae", term: "reggae island music" },
  { id: "rock", name: "Rock", term: "rock" },
  { id: "electronic", name: "Electronic", term: "electronic dance music" },
  { id: "country", name: "Country", term: "country" },
  { id: "latin", name: "Latin", term: "latin pop reggaeton" },
  { id: "jazz", name: "Jazz", term: "jazz" },
  { id: "chill", name: "Chill / Instrumental", term: "chill instrumental lofi" },
];

// GET /api/radio/genres
router.get("/genres", (_req, res) => {
  res.json(GENRES.map(({ id, name }) => ({ id, name })));
});

// Tiny in-memory cache so repeat clicks on the same genre don't hammer iTunes.
const cache = new Map(); // genreId -> { at, items }
const TTL_MS = 10 * 60 * 1000;

// GET /api/radio/genres/:id/tracks
router.get("/genres/:id/tracks", async (req, res) => {
  const genre = GENRES.find((g) => g.id === req.params.id);
  if (!genre) return res.status(404).json({ message: "Unknown genre" });

  const hit = cache.get(genre.id);
  if (hit && Date.now() - hit.at < TTL_MS) {
    return res.json(hit.items);
  }

  try {
    const { data } = await axios.get("https://itunes.apple.com/search", {
      params: {
        term: genre.term,
        media: "music",
        entity: "song",
        country: "US",
        limit: 25,
      },
      timeout: 12000,
    });

    const items = (data?.results || [])
      // Only keep tracks that actually have a playable 30s preview.
      .filter((s) => s.previewUrl && s.trackName && s.artistName)
      .map((s) => ({
        id: String(s.trackId),
        title: s.trackName,
        artist: s.artistName,
        cover:
          (s.artworkUrl100 || "").replace("100x100", "512x512") ||
          s.artworkUrl100 ||
          "",
        durationMs: s.trackTimeMillis || 0,
        preview: s.previewUrl || null,
      }));

    cache.set(genre.id, { at: Date.now(), items });
    return res.json(items);
  } catch (e) {
    console.error("Radio genre fetch failed:", genre.id, e.response?.data || e.message);
    // Serve stale cache if we have it rather than a hard failure.
    return res.json(hit?.items || []);
  }
});

module.exports = router;
