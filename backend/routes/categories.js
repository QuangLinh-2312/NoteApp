const express = require("express");
const CustomCategory = require("../models/CustomCategory");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

// Lấy tất cả custom categories
router.get("/", async (req, res) => {
  try {
    const categories = await CustomCategory.find({ userId: req.userId }).sort({
      order: 1,
      createdAt: 1,
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tạo category mới
router.post("/", async (req, res) => {
  try {
    const { name, icon, color, order } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Tên danh mục không được để trống" });
    }

    const category = new CustomCategory({
      userId: req.userId,
      name: name.trim(),
      icon: icon || "folder",
      color: color || "#3b82f6",
      order: order || 0,
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Danh mục này đã tồn tại" });
    }
    res.status(400).json({ error: error.message });
  }
});

// Cập nhật category
router.put("/:id", async (req, res) => {
  try {
    const category = await CustomCategory.findById(req.params.id);

    if (!category || category.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: "Không có quyền" });
    }

    Object.assign(category, req.body);
    if (req.body.name) {
      category.name = req.body.name.trim();
    }
    await category.save();

    res.json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Xóa category
router.delete("/:id", async (req, res) => {
  try {
    const category = await CustomCategory.findById(req.params.id);

    if (!category || category.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: "Không có quyền" });
    }

    await CustomCategory.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa danh mục" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Sắp xếp lại thứ tự
router.post("/reorder", async (req, res) => {
  try {
    const { categoryIds } = req.body;

    if (!Array.isArray(categoryIds)) {
      return res.status(400).json({ error: "Danh sách không hợp lệ" });
    }

    const updatePromises = categoryIds.map((id, index) =>
      CustomCategory.findOneAndUpdate(
        { _id: id, userId: req.userId },
        { order: index },
        { new: true }
      )
    );

    await Promise.all(updatePromises);
    res.json({ message: "Đã sắp xếp lại" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
