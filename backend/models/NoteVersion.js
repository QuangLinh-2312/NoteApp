const mongoose = require("mongoose");

const noteVersionSchema = new mongoose.Schema({
  noteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Note",
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: String,
  content: String,
  richContent: String,
  color: String,
  tags: [String],
  checklist: [
    {
      text: String,
      checked: Boolean,
    },
  ],
  category: String,
  versionNumber: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

noteVersionSchema.index({ noteId: 1, createdAt: -1 });

module.exports = mongoose.model("NoteVersion", noteVersionSchema);
