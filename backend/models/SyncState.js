const mongoose = require("mongoose");

const syncStateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  deviceId: {
    type: String,
    required: true,
    index: true,
  },
  deviceName: {
    type: String,
    default: "Unknown Device",
  },
  lastSyncAt: {
    type: Date,
    default: Date.now,
  },
  lastSyncVersion: {
    type: Number,
    default: 0,
  },
  pendingChanges: [
    {
      entityType: String,
      entityId: mongoose.Schema.Types.ObjectId,
      action: String,
      data: mongoose.Schema.Types.Mixed,
      timestamp: Date,
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

syncStateSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

module.exports = mongoose.model("SyncState", syncStateSchema);
