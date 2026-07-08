// backend/server/models/User.js
//
// Replaces the old JSON-file "database" (data/userStore.js used to read/write
// data/users.json directly). Shape matches exactly what the app already
// reads/writes, so routes/auth.js and routes/profile.js didn't need to
// change their data structures — only how they're persisted.
const mongoose = require("mongoose");
const { Schema } = mongoose;

// `_id: false` on the nested schemas below keeps these objects shaped
// exactly like the plain JSON the frontend already expects (just
// {id, title, artist, ...}) instead of Mongoose injecting its own `_id`
// into every track/playlist entry.
const recentlyPlayedSchema = new Schema(
  {
    trackId: String,
    title: String,
    artist: String,
    cover: String,
    playedAt: String,
  },
  { _id: false }
);

const trackSchema = new Schema(
  {
    id: String,
    title: String,
    artist: String,
    cover: String,
    preview: String,
    durationHint: String,
    likedAt: String,
  },
  { _id: false }
);

const playlistSchema = new Schema(
  {
    id: { type: String, required: true },
    name: String,
    createdAt: String,
    tracks: { type: [trackSchema], default: [] },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    displayName: String,
    passwordHash: { type: String, required: true },

    // playback data
    recentlyPlayed: { type: [recentlyPlayedSchema], default: [] },
    // trackId -> { trackId, title, artist, cover, count }. Left as a loose
    // object (not a sub-schema) since it's keyed by arbitrary track ids;
    // Mongoose can't auto-detect in-place mutations of a Mixed field, so
    // any handler that edits it needs user.markModified("playCounts")
    // before saving (see routes/profile.js).
    playCounts: { type: Schema.Types.Mixed, default: {} },

    // library data
    likedSongs: { type: [trackSchema], default: [] },
    playlists: { type: [playlistSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
