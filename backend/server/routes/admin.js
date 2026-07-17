// backend/server/routes/admin.js
//
// Admin-only catalog management: upload a track (audio + optional cover)
// so it's streamable to every user, or remove one. Mounted at /api/admin.
const express = require("express");
const multer = require("multer");
const { authRequired } = require("../middleware/auth");
const { adminRequired } = require("../middleware/adminRequired");
const asyncHandler = require("../middleware/asyncHandler");
const r2 = require("../lib/r2");
const Track = require("../models/Track");

const router = express.Router();

const AUDIO_TYPES = new Set(["audio/mpeg", "audio/mp4", "audio/x-m4a", "audio/wav", "audio/x-wav", "audio/ogg"]);
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_AUDIO_MB = 25;
const MAX_COVER_MB = 5;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_AUDIO_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "audio" && !AUDIO_TYPES.has(file.mimetype)) {
      return cb(new Error("Unsupported audio format. Use MP3, M4A, WAV, or OGG."));
    }
    if (file.fieldname === "cover" && !IMAGE_TYPES.has(file.mimetype)) {
      return cb(new Error("Unsupported cover image format. Use JPEG, PNG, or WebP."));
    }
    cb(null, true);
  },
});

function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

// POST /api/admin/tracks  (multipart/form-data: audio, cover?, title?, artist?)
router.post(
  "/tracks",
  authRequired,
  adminRequired,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  asyncHandler(async (req, res) => {
    if (!r2.isConfigured()) {
      return res.status(503).json({
        message: "File storage isn't configured yet — set the R2_* env vars (see DEPLOYMENT.md).",
      });
    }

    const audioFile = req.files?.audio?.[0];
    const coverFile = req.files?.cover?.[0];
    if (!audioFile) {
      return res.status(400).json({ message: "An audio file is required." });
    }
    if (coverFile && coverFile.size > MAX_COVER_MB * 1024 * 1024) {
      return res.status(400).json({ message: `Cover image must be under ${MAX_COVER_MB}MB.` });
    }

    // Auto-fill title/artist/duration from the file's own tags where
    // possible; anything typed into the form wins over what we detect.
    let detected = {};
    try {
      const { parseBuffer } = await import("music-metadata");
      const parsed = await parseBuffer(audioFile.buffer, audioFile.mimetype);
      detected = {
        title: parsed.common?.title,
        artist: parsed.common?.artist,
        duration: parsed.format?.duration,
        picture: parsed.common?.picture?.[0],
      };
    } catch (e) {
      console.warn("Metadata parse failed, falling back to manual fields:", e.message);
    }

    const title = (req.body?.title || detected.title || audioFile.originalname || "").trim();
    const artist = (req.body?.artist || detected.artist || "Unknown Artist").trim();
    if (!title) {
      return res.status(400).json({ message: "Couldn't determine a title — enter one manually." });
    }

    const { url: fileUrl, key: fileKey } = await r2.uploadBuffer(audioFile.buffer, {
      prefix: "audio",
      originalName: audioFile.originalname,
      contentType: audioFile.mimetype,
    });

    let cover = "";
    let coverKey = "";
    if (coverFile) {
      const uploaded = await r2.uploadBuffer(coverFile.buffer, {
        prefix: "covers",
        originalName: coverFile.originalname,
        contentType: coverFile.mimetype,
      });
      cover = uploaded.url;
      coverKey = uploaded.key;
    } else if (detected.picture?.data) {
      const uploaded = await r2.uploadBuffer(Buffer.from(detected.picture.data), {
        prefix: "covers",
        originalName: `embedded.${(detected.picture.format || "image/jpeg").split("/")[1] || "jpg"}`,
        contentType: detected.picture.format || "image/jpeg",
      });
      cover = uploaded.url;
      coverKey = uploaded.key;
    }

    const track = await Track.create({
      title,
      artist,
      cover,
      coverKey,
      fileUrl,
      fileKey,
      durationHint: formatDuration(detected.duration),
      uploadedBy: req.user.id,
    });

    res.status(201).json(track);
  })
);

// DELETE /api/admin/tracks/:id
router.delete(
  "/tracks/:id",
  authRequired,
  adminRequired,
  asyncHandler(async (req, res) => {
    const track = await Track.findById(req.params.id);
    if (!track) return res.status(404).json({ message: "Track not found" });

    await Promise.all([
      r2.deleteObject(track.fileKey).catch((e) => console.error("R2 delete (audio) failed:", e.message)),
      track.coverKey
        ? r2.deleteObject(track.coverKey).catch((e) => console.error("R2 delete (cover) failed:", e.message))
        : Promise.resolve(),
    ]);
    await track.deleteOne();

    res.json({ ok: true });
  })
);

module.exports = router;
