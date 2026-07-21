// backend/server/routes/auth.js
const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByResetToken,
  updateUser,
} = require("../data/userStore");
const { authRequired, JWT_SECRET } = require("../middleware/auth");
// Named `mailer`, not `email` — signup/login below already use `email` as a
// local var name for the request body field, and shadowing this module
// import with that would be an easy bug to introduce later.
const mailer = require("../lib/email");

const router = express.Router();

function publicUser(u) {
  return {
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    isAdmin: Boolean(u.isAdmin),
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

// The exact same response for "no such email" and "email sent" on purpose —
// otherwise this endpoint becomes a way to probe which emails have accounts.
const GENERIC_FORGOT_RESPONSE = {
  message: "If an account exists for that email, a reset link has been sent.",
};

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email: rawEmail } = req.body || {};
    if (!rawEmail) {
      return res.status(400).json({ message: "Email required." });
    }

    const user = await findUserByEmail(rawEmail);
    if (!user) return res.json(GENERIC_FORGOT_RESPONSE);

    if (!mailer.isConfigured()) {
      console.error(
        "Forgot-password requested but RESEND_API_KEY/RESEND_FROM_EMAIL aren't set — see DEPLOYMENT.md."
      );
      return res.json(GENERIC_FORGOT_RESPONSE);
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordTokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await updateUser(user);

    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
    const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;
    await mailer.sendPasswordResetEmail(user.email, resetUrl);

    res.json(GENERIC_FORGOT_RESPONSE);
  } catch (e) {
    console.error("Forgot-password error:", e);
    // Same generic body even on an unexpected error — a different response
    // shape here would leak information just like a different message would.
    res.json(GENERIC_FORGOT_RESPONSE);
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body || {};
    if (!token || !password) {
      return res.status(400).json({ message: "Token and new password required." });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await findUserByResetToken(tokenHash);
    if (!user) {
      return res.status(400).json({ message: "This reset link is invalid or has expired." });
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetPasswordTokenHash = null;
    user.resetPasswordExpires = null;
    await updateUser(user);

    res.json({ message: "Password updated — you can log in now." });
  } catch (e) {
    console.error("Reset-password error:", e);
    res.status(500).json({ message: "Could not reset password." });
  }
});

module.exports = router;