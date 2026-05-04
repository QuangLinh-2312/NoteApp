const express = require("express");
const ShareNote = require("../models/ShareNote");
const Note = require("../models/Note");
const User = require("../models/User");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

// Lấy notes được share với mình - PHẢI ĐẶT TRƯỚC route /:shareId
router.get("/shared-with-me", async (req, res) => {
  try {
    const shares = await ShareNote.find({ sharedWithId: req.userId })
      .populate("noteId")
      .populate("ownerId", "username email");

    const notes = shares
      .map((s) => s.noteId)
      .filter((n) => n && !n.deletedAt)
      .map((note) => {
        const shareObj = shares.find((s) => s.noteId._id.toString() === note._id.toString());
        return {
          ...note.toObject(),
          shareId: shareObj?._id,
          sharePermission: shareObj?.permission,
          sharedBy: shareObj?.ownerId,
        };
      });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Chia sẻ note với user khác
router.post("/", async (req, res) => {
  try {
    const { noteId, email, permission } = req.body;

    const note = await Note.findById(noteId);
    if (!note || note.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: "Không có quyền chia sẻ ghi chú này" });
    }

    const sharedWithUser = await User.findOne({ email });
    if (!sharedWithUser) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }

    if (sharedWithUser._id.toString() === req.userId.toString()) {
      return res.status(400).json({ error: "Không thể chia sẻ với chính mình" });
    }

    // Kiểm tra đã share chưa
    const existingShare = await ShareNote.findOne({
      noteId,
      sharedWithId: sharedWithUser._id,
    });

    if (existingShare) {
      existingShare.permission = permission || "read";
      await existingShare.save();
      return res.json(existingShare);
    }

    const share = new ShareNote({
      noteId,
      ownerId: req.userId,
      sharedWithId: sharedWithUser._id,
      permission: permission || "read",
    });
    await share.save();

    res.status(201).json(share);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Lấy danh sách người đã share note - PHẢI ĐẶT TRƯỚC route /:shareId
router.get("/note/:noteId", async (req, res) => {
  try {
    const note = await Note.findById(req.params.noteId);
    if (!note || note.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: "Không có quyền" });
    }

    const shares = await ShareNote.find({ noteId: note._id }).populate(
      "sharedWithId",
      "username email"
    );

    res.json(shares);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Hủy chia sẻ
router.delete("/:shareId", async (req, res) => {
  try {
    const share = await ShareNote.findById(req.params.shareId).populate("noteId");
    
    if (!share) {
      return res.status(404).json({ error: "Không tìm thấy" });
    }
    
    if (share.ownerId.toString() !== req.userId.toString() && share.sharedWithId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: "Không có quyền" });
    }

    await ShareNote.findByIdAndDelete(req.params.shareId);
    res.json({ message: "Đã hủy chia sẻ" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Cập nhật quyền chia sẻ
router.put("/:shareId", async (req, res) => {
  try {
    const { permission } = req.body;
    if (!["read", "write"].includes(permission)) {
      return res.status(400).json({ error: "Quyền không hợp lệ" });
    }

    const share = await ShareNote.findById(req.params.shareId);
    if (!share) {
      return res.status(404).json({ error: "Không tìm thấy" });
    }

    if (share.ownerId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: "Không có quyền" });
    }

    share.permission = permission;
    await share.save();
    
    res.json(share);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
