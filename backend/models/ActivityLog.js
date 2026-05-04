const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      "note_created",
      "note_updated",
      "note_deleted",
      "note_deleted_permanently",
      "note_restored",
      "version_restored",
      "note_shared",
      "note_archived",
      "note_pinned",
      "category_created",
      "settings_updated",
    ],
  },
  entityType: {
    type: String,
    enum: ["note", "category", "settings"],
    default: "note",
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  deviceInfo: {
    userAgent: String,
    platform: String,
  },
  ipAddress: {
    type: String,
    default: null,
  },
  createdAt: { type: Date, default: Date.now, index: true },
});

activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
