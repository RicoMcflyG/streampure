// backend/server/routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  createUser,
  findUserByEmail,
  findUserById,
} = require("../data/userStore");
const { authRequired, JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

function publicUser(u) {
  return {
    id: u.id,
    email: u.email,
    displayName: u.displayName,
  };
}

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { email, password, displayName } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required." });
    }
    const name = displayName || email.split("@")[0];

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({ email, passwordHash, displayName: name });

    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: publicUser(user) });
  } catch (e) {
    if (e.message === "EMAIL_TAKEN") {
      return res.status(409).json({ message: "Email already in use." });
    }
    console.error("Signup error:", e);
    res.status(500).json({ message: "Signup failed." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required." });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: publicUser(user) });
  } catch (e) {
    console.error("Login error:", e);
    res.status(500).json({ message: "Login failed." });
  }
});

// GET /api/auth/me
router.get("/me", authRequired, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

module.exports = router;