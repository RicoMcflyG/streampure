// backend/server/routes/charts.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

// Apple Music Marketing Tools RSS – Top 100 USA
const APPLE_TOP100_US =
  "https://rss.applemarketingtools.com/api/v2/us/music/most-played/100/songs.json";

// Small static fallback in case Apple is down (so your UI still works)
const FALLBACK_TOP100 = [
  {
    id: "fallback-1",
    rank: 1,
    title: "Fallback Song 1",
    artist: "Fallback Artist",
    cover: "",
    url: "",
    preview: null,
    source: "fallback",
  },
  {
    id: "fallback-2",
    rank: 2,
    title: "Fallback Song 2",
    artist: "Fallback Artist",
    cover: "",
    url: "",
    preview: null,
    source: "fallback",
  },
];

// GET /api/charts/apple/us-top100
router.get("/apple/us-top100", async (_req, res) => {
  try {
    // validateStatus so we can inspect non-200 instead of throwing
    const { data, status } = await axios.get(APPLE_TOP100_US, {
      timeout: 12000,
      validateStatus: () => true,
    });

    console.log("Apple Top100 status:", status);

    if (status !== 200) {
      console.error("Apple RSS non-200:", status);
      // ✅ instead of 502, give a fallback so frontend has something to render
      return res.json(FALLBACK_TOP100);
    }

    console.log("Apple raw Top100 snippet:", JSON.stringify(data).slice(0, 400));

    let results = [];

    if (Array.isArray(data)) {
      results = data;
    } else if (Array.isArray(data?.feed?.results)) {
      results = data.feed.results;
    } else if (Array.isArray(data?.results)) {
      results = data.results;
    }

    const items = results.map((s, i) => ({
      id: s.id,
      rank: i + 1,
      title: s.name,
      artist: s.artistName,
      cover:
        s.artworkUrl100?.replace("100x100", "512x512") ||
        s.artworkUrl100 ||
        "",
      url: s.url,
      preview: null,
      source: "apple",
    }));

    // If for some reason Apple gave us no items, still fallback
    if (!items.length) {
      console.warn("Apple Top100 empty, using fallback list.");
      return res.json(FALLBACK_TOP100);
    }

    return res.json(items);
  } catch (e) {
    console.error("Top100 error:", e.response?.data || e.message);
    // ✅ on error, also fallback instead of 502
    return res.json(FALLBACK_TOP100);
  }
});

// Shared in-memory cache for iTunes preview lookups, used by both the
// single-track endpoint and the batch endpoint below. Top 100 doesn't churn
// fast, so this also means a whole chart's worth of lookups only ever really
// hits iTunes once per TTL window, instead of on every page load/click.
const previewCache = new Map(); // key -> { previewUrl, artwork, at }
const PREVIEW_TTL_MS = 60 * 60 * 1000; // 1 hour

function previewCacheKey(title, artist) {
  return `${(title || "").trim().toLowerCase()}|${(artist || "").trim().toLowerCase()}`;
}

async function lookupPreview(title, artist) {
  const key = previewCacheKey(title, artist);
  const hit = previewCache.get(key);
  if (hit && Date.now() - hit.at < PREVIEW_TTL_MS) return hit;

  const term = [title, artist].filter(Boolean).join(" ");
  const { data } = await axios.get("https://itunes.apple.com/search", {
    params: { term, media: "music", entity: "song", country: "US", limit: 3 },
    timeout: 12000,
  });

  const best = (data?.results || []).find(Boolean);
  const result = {
    previewUrl: best?.previewUrl || null,
    artwork:
      (best?.artworkUrl100 || "").replace("100x100", "512x512") ||
      best?.artworkUrl100 ||
      null,
    at: Date.now(),
  };
  previewCache.set(key, result);
  return result;
}

// 30s preview lookup via iTunes Search (no auth)
router.get("/preview", async (req, res) => {
  const title = (req.query.title || "").trim();
  const artist = (req.query.artist || "").trim();
  if (!title && !artist) {
    return res.status(400).json({ message: "Missing title or artist" });
  }

  try {
    const { previewUrl, artwork } = await lookupPreview(title, artist);
    return res.json({ previewUrl, artwork });
  } catch (e) {
    console.error("Preview lookup failed:", e.response?.data || e.message);
    return res.status(e.response?.status || 502).json({
      message: "Preview lookup failed",
      detail: e.response?.data || e.message,
    });
  }
});

// Batch preview lookup so a whole chart (e.g. Top 100) can be turned into a
// real, playable playlist instead of only ever loading the single track you
// clicked. Runs with limited concurrency so we don't fire 100 simultaneous
// requests at iTunes at once.
//
// POST /api/charts/previews  { tracks: [{ id, title, artist }, ...] }
// -> { [id]: { previewUrl, artwork } }
router.post("/previews", async (req, res) => {
  const list = Array.isArray(req.body?.tracks) ? req.body.tracks : [];
  if (!list.length) return res.json({});

  const out = {};
  const CONCURRENCY = 6;
  let cursor = 0;

  async function worker() {
    while (cursor < list.length) {
      const t = list[cursor++];
      try {
        const { previewUrl, artwork } = await lookupPreview(t.title, t.artist);
        out[t.id] = { previewUrl, artwork };
      } catch (e) {
        out[t.id] = { previewUrl: null, artwork: null };
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, list.length) }, worker)
  );

  return res.json(out);
});

// Small in-memory cache for artist top-track lookups (separate from the
// title+artist preview cache above, keyed by artist name instead).
const artistCache = new Map(); // artist name (lowercase) -> { at, items }
const ARTIST_TTL_MS = 60 * 60 * 1000; // 1 hour

// GET /api/charts/artist/:name/top
// Real, playable "top tracks" for an artist page, via iTunes Search scoped
// to that artist. Unlike the Apple chart RSS feed, this endpoint already
// gets preview URLs back in the same request — no second lookup needed.
router.get("/artist/:name/top", async (req, res) => {
  const name = (req.params.name || "").trim();
  if (!name) return res.status(400).json({ message: "Missing artist name" });

  const key = name.toLowerCase();
  const hit = artistCache.get(key);
  if (hit && Date.now() - hit.at < ARTIST_TTL_MS) {
    return res.json(hit.items);
  }

  try {
    const { data } = await axios.get("https://itunes.apple.com/search", {
      params: {
        term: name,
        media: "music",
        entity: "song",
        attribute: "artistTerm",
        country: "US",
        limit: 15,
      },
      timeout: 12000,
    });

    const wanted = key;
    const items = (data?.results || [])
      // iTunes' artistTerm search can return loosely-related results —
      // keep the ones that actually look like this artist.
      .filter((s) => (s.artistName || "").toLowerCase().includes(wanted) || wanted.includes((s.artistName || "").toLowerCase()))
      .filter((s) => s.previewUrl && s.trackName)
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

    artistCache.set(key, { at: Date.now(), items });
    return res.json(items);
  } catch (e) {
    console.error("Artist top-tracks failed:", name, e.response?.data || e.message);
    return res.json(hit?.items || []);
  }
});

// Small in-memory cache for search queries (short TTL — queries are much
// more varied/long-tail than the fixed artist/genre lists above).
const searchCache = new Map(); // query (lowercase) -> { at, items }
const SEARCH_TTL_MS = 10 * 60 * 1000; // 10 minutes

// GET /api/charts/search?q=...
// General track search (title, artist, lyrics-adjacent terms) via iTunes,
// with real preview URLs already attached — powers the global search bar.
router.get("/search", async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json([]);

  const key = q.toLowerCase();
  const hit = searchCache.get(key);
  if (hit && Date.now() - hit.at < SEARCH_TTL_MS) {
    return res.json(hit.items);
  }

  try {
    const { data } = await axios.get("https://itunes.apple.com/search", {
      params: { term: q, media: "music", entity: "song", country: "US", limit: 20 },
      timeout: 12000,
    });

    const items = (data?.results || [])
      .filter((s) => s.previewUrl && s.trackName)
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

    searchCache.set(key, { at: Date.now(), items });
    return res.json(items);
  } catch (e) {
    console.error("Search failed:", q, e.response?.data || e.message);
    return res.json(hit?.items || []);
  }
});

module.exports = router;