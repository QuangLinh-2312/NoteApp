const express = require("express");
const SyncState = require("../models/SyncState");
const Note = require("../models/Note");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

const crypto = require("crypto");

// Helper để tạo device ID từ user agent
const generateDeviceId = (req) => {
  const userAgent = req.headers["user-agent"] || "";
  const ip = req.ip || req.connection.remoteAddress || "unknown";
  return crypto
    .createHash("md5")
    .update(`${req.userId}-${userAgent}-${ip}`)
    .digest("hex");
};

// Lấy sync state
router.get("/state", async (req, res) => {
  try {
    const deviceId = generateDeviceId(req);
    let syncState = await SyncState.findOne({ userId: req.userId, deviceId });

    if (!syncState) {
      syncState = new SyncState({
        userId: req.userId,
        deviceId,
        deviceName: req.headers["user-agent"] || "Unknown Device",
      });
      await syncState.save();
    }

    res.json(syncState);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync notes - lấy changes từ server
router.get("/changes", async (req, res) => {
  try {
    const { lastSyncVersion } = req.query;
    const deviceId = generateDeviceId(req);

    const syncState = await SyncState.findOne({ userId: req.userId, deviceId });
    if (!syncState) {
      return res.status(404).json({ error: "Sync state not found" });
    }

    // Lấy notes đã thay đổi sau lastSyncVersion
    const notes = await Note.find({
      userId: req.userId,
      updatedAt: { $gt: new Date(parseInt(lastSyncVersion || 0)) },
      deletedAt: null,
    }).sort({ updatedAt: 1 });

    res.json({
      changes: notes.map((note) => ({
        entityType: "note",
        entityId: note._id,
        action: "update",
        data: note,
        timestamp: note.updatedAt.getTime(),
      })),
      syncVersion: Date.now(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Push changes từ client
router.post("/push", async (req, res) => {
  try {
    const { changes } = req.body;
    const deviceId = generateDeviceId(req);

    if (!Array.isArray(changes)) {
      return res.status(400).json({ error: "Invalid changes format" });
    }

    const syncState = await SyncState.findOne({ userId: req.userId, deviceId });
    if (!syncState) {
      return res.status(404).json({ error: "Sync state not found" });
    }

    const conflicts = [];
    const results = [];

    for (const change of changes) {
      try {
        if (change.entityType === "note") {
          if (change.action === "create" || change.action === "update") {
            const existingNote = await Note.findById(change.entityId);

            if (existingNote) {
              // Conflict detection: so sánh updatedAt
              if (
                existingNote.updatedAt.getTime() >
                new Date(change.timestamp).getTime()
              ) {
                // Server version is newer
                conflicts.push({
                  entityId: change.entityId,
                  serverVersion: existingNote,
                  clientVersion: change.data,
                  resolution: "server_newer",
                });
                continue;
              }
            }

            // Apply change
            if (change.action === "create") {
              const note = new Note({
                ...change.data,
                userId: req.userId,
                _id: change.entityId,
              });
              await note.save();
              results.push({ entityId: change.entityId, status: "created" });
            } else {
              await Note.findByIdAndUpdate(change.entityId, {
                ...change.data,
                updatedAt: Date.now(),
              });
              results.push({ entityId: change.entityId, status: "updated" });
            }
          } else if (change.action === "delete") {
            const note = await Note.findById(change.entityId);
            if (note && note.userId.toString() === req.userId.toString()) {
              note.deletedAt = Date.now();
              await note.save();
              results.push({ entityId: change.entityId, status: "deleted" });
            }
          }
        }
      } catch (error) {
        conflicts.push({
          entityId: change.entityId,
          error: error.message,
        });
      }
    }

    // Update sync state
    syncState.lastSyncAt = new Date();
    syncState.lastSyncVersion = Date.now();
    await syncState.save();

    res.json({
      results,
      conflicts,
      syncVersion: syncState.lastSyncVersion,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resolve conflict - user chọn version
router.post("/resolve-conflict", async (req, res) => {
  try {
    const { entityId, resolution, data } = req.body;

    if (resolution === "server") {
      // Giữ nguyên server version
      res.json({ message: "Using server version" });
    } else if (resolution === "client") {
      // Áp dụng client version
      await Note.findByIdAndUpdate(entityId, {
        ...data,
        updatedAt: Date.now(),
      });
      res.json({ message: "Applied client version" });
    } else if (resolution === "merge") {
      // Merge cả hai (ưu tiên client cho các field cụ thể)
      const serverNote = await Note.findById(entityId);
      const merged = {
        ...serverNote.toObject(),
        ...data,
        updatedAt: Date.now(),
      };
      await Note.findByIdAndUpdate(entityId, merged);
      res.json({ message: "Merged versions" });
    } else {
      return res.status(400).json({ error: "Invalid resolution" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
