const express = require("express");
const ActivityLog = require("../models/ActivityLog");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

// Lấy activity log
router.get("/", async (req, res) => {
  try {
    const { limit = 50, offset = 0, action, entityType } = req.query;

    const query = { userId: req.userId };
    if (action) query.action = action;
    if (entityType) query.entityType = entityType;

    const activities = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await ActivityLog.countDocuments(query);

    res.json({
      activities,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lấy activity theo entity
router.get("/entity/:entityType/:entityId", async (req, res) => {
  try {
    const { entityType, entityId } = req.params;

    const activities = await ActivityLog.find({
      userId: req.userId,
      entityType,
      entityId,
    }).sort({ createdAt: -1 });

    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Xóa activity log cũ (giữ lại 30 ngày)
router.delete("/cleanup", async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await ActivityLog.deleteMany({
      userId: req.userId,
      createdAt: { $lt: thirtyDaysAgo },
    });

    res.json({ message: `Đã xóa ${result.deletedCount} bản ghi cũ` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Xóa TOÀN BỘ nhật ký (yêu cầu xác thực mật khẩu)
router.delete("/", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: "Vui lòng nhập mật khẩu để xác nhận." });
    }

    const User = require("../models/User");
    const user = await User.findById(req.userId).select("+password");
    if (!user) {
      return res.status(404).json({ error: "Người dùng không tồn tại." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Mật khẩu không đúng." });
    }

    const result = await ActivityLog.deleteMany({ userId: req.userId });
    res.json({ message: `Đã xóa toàn bộ ${result.deletedCount} bản ghi nhật ký.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
