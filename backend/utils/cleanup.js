const Note = require("../models/Note");
const NoteVersion = require("../models/NoteVersion");
const ShareNote = require("../models/ShareNote");

// Xóa vĩnh viễn các note đã xóa hơn 30 ngày
const cleanupDeletedNotes = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const notesToDelete = await Note.find({
      deletedAt: { $ne: null, $lt: thirtyDaysAgo },
    });

    for (const note of notesToDelete) {
      // Xóa versions
      await NoteVersion.deleteMany({ noteId: note._id });
      // Xóa shares
      await ShareNote.deleteMany({ noteId: note._id });
      // Xóa note
      await Note.findByIdAndDelete(note._id);
    }

    console.log(`Đã xóa vĩnh viễn ${notesToDelete.length} ghi chú`);
  } catch (error) {
    console.error("Lỗi khi cleanup:", error);
  }
};

// Chạy cleanup mỗi ngày
if (require.main === module) {
  cleanupDeletedNotes();
  setInterval(cleanupDeletedNotes, 24 * 60 * 60 * 1000); // 24 giờ
}

module.exports = { cleanupDeletedNotes };
