const express = require("express");
const Note = require("../models/Note");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

// Thống kê tổng quan
router.get("/overview", async (req, res) => {
  try {
    const notes = await Note.find({
      userId: req.userId,
      deletedAt: null,
    });

    const stats = {
      total: notes.length,
      pinned: notes.filter((n) => n.isPinned).length,
      favorites: notes.filter((n) => n.isFavorite).length,
      archived: notes.filter((n) => n.isArchived).length,
      byCategory: {},
      byTag: {},
      byMonth: {},
    };

    notes.forEach((note) => {
      // Thống kê theo category
      stats.byCategory[note.category] = (stats.byCategory[note.category] || 0) + 1;

      // Thống kê theo tag
      note.tags.forEach((tag) => {
        stats.byTag[tag] = (stats.byTag[tag] || 0) + 1;
      });

      // Thống kê theo tháng
      const month = new Date(note.createdAt).toISOString().substring(0, 7);
      stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Thống kê theo thời gian
router.get("/timeline", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {
      userId: req.userId,
      deletedAt: null,
    };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const notes = await Note.find(query).sort({ createdAt: -1 });

    const timeline = {};
    notes.forEach((note) => {
      const date = new Date(note.createdAt).toISOString().split("T")[0];
      if (!timeline[date]) {
        timeline[date] = [];
      }
      timeline[date].push(note);
    });

    res.json(timeline);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
