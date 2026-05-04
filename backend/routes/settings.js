const express = require("express");
const UserSettings = require("../models/UserSettings");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

// Lấy settings
router.get("/", async (req, res) => {
  try {
    let settings = await UserSettings.findOne({ userId: req.userId });

    if (!settings) {
      settings = new UserSettings({ userId: req.userId });
      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cập nhật settings
router.put("/", async (req, res) => {
  try {
    let settings = await UserSettings.findOne({ userId: req.userId });

    if (!settings) {
      settings = new UserSettings({ userId: req.userId });
    }

    Object.assign(settings, req.body);
    await settings.save();

    res.json(settings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Backup notes
router.get("/backup", async (req, res) => {
  try {
    const Note = require("../models/Note");
    const notes = await Note.find({
      userId: req.userId,
      deletedAt: null,
    });

    const settings = await UserSettings.findOne({ userId: req.userId });
    if (settings) {
      settings.lastBackup = new Date();
      await settings.save();
    }

    res.json({ notes, backupDate: new Date() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
