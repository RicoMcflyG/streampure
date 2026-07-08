// backend/server/server.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

// Origins allowed to call this API, e.g.
//   ALLOWED_ORIGINS=https://www.mystreampure.com
// Comma-separated, for exact-match custom domains. Local dev origins and any
// streampureapp*.vercel.app URL (production alias AND every per-deployment
// preview URL Vercel generates, e.g. streampureapp-1pkmee2n6-stream-pure.vercel.app)
// are always allowed automatically — see VERCEL_PREVIEW_PATTERN below.
const DEV_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"];
const envOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...DEV_ORIGINS, ...envOrigins])];

// Matches https://streampureapp.vercel.app (production) and any Vercel
// preview deployment for this same project, e.g.
// https://streampureapp-<hash>-stream-pure.vercel.app or
// https://streampureapp-git-<branch>-stream-pure.vercel.app. Scoped to the
// "streampureapp" prefix so it doesn't blanket-allow unrelated *.vercel.app sites.
const VERCEL_PREVIEW_PATTERN = /^https:\/\/streampureapp(-[\w-]+)?\.vercel\.app$/;

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman, curl, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin) || VERCEL_PREVIEW_PATTERN.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (_req, res) =>
  res.json({ ok: true, service: "streampure-backend" })
);

// Simple health check for uptime monitors / Render's health check config.
app.get("/healthz", (_req, res) => {
  const dbState = mongoose.connection.readyState; // 1 = connected
  res.status(dbState === 1 ? 200 : 503).json({
    ok: dbState === 1,
    db: ["disconnected", "connected", "connecting", "disconnecting"][dbState] || "unknown",
  });
});

app.use("/api/charts", require("./routes/charts"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/radio", require("./routes/radio"));

// Catch-all JSON error handler (must be defined last, after all routes).
// Without this, an unhandled error (e.g. surfaced via asyncHandler) falls
// through to Express's default HTML error page, which is unhelpful for a
// JSON API / breaks the frontend's error handling.
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  if (err && err.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "Not allowed by CORS" });
  }
  res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 5005;
const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  console.error(
    "MONGO_URL is not set. Set it in backend/.env locally, or in your host's " +
      "environment variables in production (see DEPLOYMENT.md)."
  );
  process.exit(1);
}

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
