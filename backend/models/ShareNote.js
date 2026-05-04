const mongoose = require("mongoose");

const shareNoteSchema = new mongoose.Schema({
  noteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Note",
    required: true,
    index: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sharedWithId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  permission: {
    type: String,
    enum: ["read", "write"],
    default: "read",
  },
  sharedAt: { type: Date, default: Date.now },
});

shareNoteSchema.index({ noteId: 1, sharedWithId: 1 });
shareNoteSchema.index({ sharedWithId: 1 });

module.exports = mongoose.model("ShareNote", shareNoteSchema);
