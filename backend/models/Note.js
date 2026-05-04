const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  title: { type: String, required: true },
  content: { type: String, default: "" },
  color: { type: String, default: "#FFE4B5" },
  tags: { type: [String], default: [] },
  isFavorite: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  category: { type: String, default: "personal" },
  checklist: [
    {
      text: String,
      checked: Boolean,
    },
  ],
  // Soft delete
  deletedAt: { type: Date, default: null },
  // Reminder
  reminder: { type: Date, default: null },
  reminderSent: { type: Boolean, default: false },
  // Markdown support
  isMarkdown: { type: Boolean, default: false },
  // Rich text content (HTML)
  richContent: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index để query nhanh hơn
noteSchema.index({ userId: 1, deletedAt: 1 });
noteSchema.index({ userId: 1, isArchived: 1 });
noteSchema.index({ userId: 1, reminder: 1 });

// Update updatedAt trước khi save
noteSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

module.exports = mongoose.model("Note", noteSchema);
