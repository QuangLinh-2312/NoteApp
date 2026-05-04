const mongoose = require("mongoose");

const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  theme: {
    type: String,
    enum: ["light", "dark", "auto"],
    default: "light",
  },
  defaultView: {
    type: String,
    enum: ["grid", "list"],
    default: "grid",
  },
  defaultColor: {
    type: String,
    default: "#FFE4B5",
  },
  autoBackup: {
    type: Boolean,
    default: false,
  },
  backupFrequency: {
    type: String,
    enum: ["daily", "weekly", "monthly"],
    default: "weekly",
  },
  lastBackup: {
    type: Date,
    default: null,
  },
  notifications: {
    reminders: { type: Boolean, default: true },
    shares: { type: Boolean, default: true },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSettingsSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

module.exports = mongoose.model("UserSettings", userSettingsSchema);
