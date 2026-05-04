const express = require("express");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

// Tóm tắt nội dung (mock - có thể tích hợp OpenAI API sau)
router.post("/summarize", async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Nội dung không được để trống" });
    }

    // Mock AI summary - trong thực tế sẽ gọi OpenAI API
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const summary = sentences.slice(0, Math.min(3, sentences.length)).join(". ") + ".";

    res.json({ summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Gợi ý tiêu đề
router.post("/suggest-title", async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Nội dung không được để trống" });
    }

    // Mock AI title suggestion
    const firstLine = content.split("\n")[0].trim();
    const suggestedTitle =
      firstLine.length > 50 ? firstLine.substring(0, 50) + "..." : firstLine;

    res.json({ title: suggestedTitle });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tạo checklist từ nội dung
router.post("/generate-checklist", async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Nội dung không được để trống" });
    }

    // Mock AI checklist generation
    const lines = content.split("\n").filter((line) => line.trim().length > 0);
    const checklist = lines
      .filter((line) => {
        const trimmed = line.trim();
        return (
          trimmed.startsWith("-") ||
          trimmed.startsWith("*") ||
          trimmed.startsWith("•") ||
          /^\d+\./.test(trimmed)
        );
      })
      .slice(0, 10)
      .map((line) => ({
        text: line.replace(/^[-*•]\s*|\d+\.\s*/, "").trim(),
        checked: false,
      }));

    res.json({ checklist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Gợi ý hành động thông minh
router.post("/suggest-actions", async (req, res) => {
  try {
    const { noteContent, noteTitle, tags, category } = req.body;
    const Note = require("../models/Note");

    const suggestions = [];

    // Gợi ý tags dựa trên nội dung
    if (noteContent) {
      const commonWords = noteContent
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 3)
        .filter((word, index, arr) => arr.indexOf(word) === index)
        .slice(0, 5);

      if (commonWords.length > 0) {
        suggestions.push({
          type: "suggest_tags",
          data: commonWords.slice(0, 3),
          message: "Gợi ý thẻ từ nội dung",
        });
      }
    }

    // Gợi ý category dựa trên từ khóa
    if (noteContent || noteTitle) {
      const text = `${noteTitle || ""} ${noteContent || ""}`.toLowerCase();
      const categoryKeywords = {
        work: ["công việc", "meeting", "deadline", "project", "task"],
        study: ["học", "bài tập", "exam", "study", "note"],
        ideas: ["ý tưởng", "idea", "brainstorm", "creative"],
      };

      for (const [cat, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some((keyword) => text.includes(keyword))) {
          if (category !== cat) {
            suggestions.push({
              type: "suggest_category",
              data: cat,
              message: `Có thể phù hợp với danh mục "${cat}"`,
            });
          }
          break;
        }
      }
    }

    // Gợi ý archive nếu note cũ
    const userNotes = await Note.find({ userId: req.userId }).limit(1);
    if (userNotes.length > 0) {
      const oldNotes = await Note.find({
        userId: req.userId,
        createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        isArchived: false,
      }).countDocuments();

      if (oldNotes > 5) {
        suggestions.push({
          type: "suggest_archive",
          data: oldNotes,
          message: `Có ${oldNotes} ghi chú cũ, có thể lưu trữ`,
        });
      }
    }

    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
