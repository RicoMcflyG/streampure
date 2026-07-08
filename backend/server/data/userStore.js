// backend/server/data/userStore.js
//
// Was previously a hand-rolled JSON-file "database" (read/write
// data/users.json on every call). Now backed by MongoDB Atlas via
// Mongoose so user accounts, liked songs, and playlists actually survive
// redeploys/restarts on hosts with an ephemeral filesystem (Render, most
// serverless platforms, etc).
//
// Every function here now returns a Promise — callers (middleware/auth.js,
// routes/auth.js, routes/profile.js) must `await` them.
const User = require("../models/User");

async function findUserByEmail(email) {
  if (!email) return null;
  return User.findOne({ email: String(email).toLowerCase().trim() });
}

async function findUserById(id) {
  if (!id) return null;
  try {
    return await User.findById(id);
  } catch {
    // Malformed id (e.g. a stale/garbage token subject) -> just "not found"
    // instead of letting a Mongoose CastError bubble up as a 500.
    return null;
  }
}

async function createUser({ email, passwordHash, displayName }) {
  const existing = await findUserByEmail(email);
  if (existing) throw new Error("EMAIL_TAKEN");

  const user = new User({
    email: String(email).toLowerCase().trim(),
    passwordHash,
    displayName,
    recentlyPlayed: [],
    playCounts: {},
    likedSongs: [],
    playlists: [],
  });
  await user.save();
  return user;
}

// `user` is always a live Mongoose document here (returned by one of the
// finders/creator above), so persisting it is just a save. Kept as its own
// function so route handlers didn't need to change when this module moved
// off the old JSON-file store.
async function updateUser(user) {
  return user.save();
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
};
