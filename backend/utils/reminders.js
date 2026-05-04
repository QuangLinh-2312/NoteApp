const Note = require("../models/Note");

// Kiểm tra và gửi reminders
const checkReminders = async () => {
  try {
    const now = new Date();
    const notes = await Note.find({
      reminder: { $lte: now },
      reminderSent: false,
      deletedAt: null,
    });

    // Trong thực tế, ở đây sẽ gửi notification (email, push notification, etc.)
    // Hiện tại chỉ đánh dấu đã gửi
    for (const note of notes) {
      note.reminderSent = true;
      await note.save();
      console.log(`Reminder cho note: ${note.title}`);
    }

    return notes;
  } catch (error) {
    console.error("Lỗi khi kiểm tra reminders:", error);
    return [];
  }
};

// Chạy kiểm tra reminders mỗi phút
if (require.main === module) {
  checkReminders();
  setInterval(checkReminders, 60 * 1000); // 1 phút
}

module.exports = { checkReminders };
