// backend/server/models/Track.js
//
// The admin-uploaded catalog: tracks anyone can browse and stream,
// distinct from any one user's personal library (liked songs / playlists
// live on the User model instead). Uploaded via POST /api/admin/tracks
// (admin-only) and listed via GET /api/tracks (public — every signed-in
// or anonymous visitor can see and play these).
//
// This file previously held an unused placeholder schema left over from an
// earlier scaffold (never imported anywhere) — repurposed here as the real
// thing rather than adding yet another near-duplicate model file.
const mongoose = require("mongoose");
const { Schema } = mongoose;

const trackSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    album: String,
    cover: String, // public R2 URL, or blank -> frontend shows a placeholder
    coverKey: String, // R2 object key, needed to delete it later
    fileUrl: { type: String, required: true }, // public R2 URL for the audio file
    fileKey: { type: String, required: true }, // R2 object key, needed to delete it later
    durationHint: String, // e.g. "3:42", derived from the file's metadata when available
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Track", trackSchema);
