const mongoose = require("mongoose");

const customCategorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  icon: {
    type: String,
    default: "folder",
  },
  color: {
    type: String,
    default: "#3b82f6",
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: { type: Date, default: Date.now },
});

customCategorySchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("CustomCategory", customCategorySchema);
