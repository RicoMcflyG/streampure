const express = require("express");
const router = express.Router();
const JamSession = require("../models/JamSession");
const JamMember = require("../models/JamMember");
const JamHistory = require("../models/JamHistory");
const auth = require("../middleware/auth");

router.post("/create", auth, async (req, res) => {
  const { name, previewTrack } = req.body;
  try {
    const session = new JamSession({ name, previewTrack, creatorId: req.user.id });
    await session.save();
    res.status(201).json({ message: "Jam created", session });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/session/:id", auth, async (req, res) => {
  try {
    const session = await JamSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/sync", auth, async (_req, res) => {
  res.json({ message: "Playback synced" });
});

router.get("/dashboard/:id", auth, async (req, res) => {
  try {
    const session = await JamSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });
    const members = await JamMember.find({ sessionId: session._id }).populate("userId", "name");
    const memberNames = members.map(m => m.userId.name);
    res.json({ session: { name: session.name, track: session.previewTrack }, members: memberNames });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/join/:id", auth, async (req, res) => {
  try {
    const existing = await JamMember.findOne({ sessionId: req.params.id, userId: req.user.id });
    if (existing) return res.status(200).json({ message: "Already joined" });
    const member = new JamMember({ sessionId: req.params.id, userId: req.user.id });
    await member.save();
    res.status(201).json({ message: "Joined session" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/history", auth, async (req, res) => {
  try {
    const history = await JamHistory.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/end", auth, async (req, res) => {
  const { sessionName, tracks } = req.body;
  const entry = new JamHistory({ userId: req.user.id, sessionName, date: new Date(), tracks });
  await entry.save();
  res.json({ message: "Jam session archived" });
});

module.exports = router;
