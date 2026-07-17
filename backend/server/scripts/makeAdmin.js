// backend/server/scripts/makeAdmin.js
//
// One-off CLI script to grant (or revoke) admin access, since there's no
// UI for it — the first admin has to be created this way.
//
// Usage (from the backend/ directory, with MONGO_URL set in your
// environment or backend/.env):
//   node server/scripts/makeAdmin.js you@example.com
//   node server/scripts/makeAdmin.js you@example.com --revoke
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

async function main() {
  const email = process.argv[2];
  const revoke = process.argv.includes("--revoke");

  if (!email) {
    console.error("Usage: node server/scripts/makeAdmin.js <email> [--revoke]");
    process.exit(1);
  }
  if (!process.env.MONGO_URL) {
    console.error("MONGO_URL is not set (check backend/.env or your shell environment).");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URL);

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    console.error(`No user found with email ${email}. They need to sign up first.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  user.isAdmin = !revoke;
  await user.save();

  console.log(`${revoke ? "Revoked" : "Granted"} admin access for ${user.email} (id: ${user.id}).`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("makeAdmin failed:", err);
  process.exit(1);
});
