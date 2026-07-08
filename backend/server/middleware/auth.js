// backend/server/middleware/auth.js
const jwt = require("jsonwebtoken");
const { findUserById } = require("../data/userStore");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

async function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await findUserById(payload.sub);
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = { authRequired, JWT_SECRET };
