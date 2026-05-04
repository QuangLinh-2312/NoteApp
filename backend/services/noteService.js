const noteRepository = require('../repositories/noteRepository');
const ActivityLog = require('../models/ActivityLog');
const ValidationError = require('../utils/errors/ValidationError');
const UnauthorizedError = require('../utils/errors/UnauthorizedError');

class NoteService {
  async getAllNotes(userId, filters = {}) {
    const notes = await noteRepository.findAllOwned(userId, filters);
    const shared = await noteRepository.findSharedWithUser(userId);

    return { notes, shared };
  }

  async getNoteById(noteId, userId) {
    const access = await noteRepository.findAccessibleById(noteId, userId);
    return access.note;
  }

  async createNote(noteData, userId) {
    if (!noteData.title || !noteData.title.trim()) {
      throw new ValidationError('Title is required');
    }

    const note = await noteRepository.create({
      ...noteData,
      userId,
    });

    await noteRepository.createVersion(note._id, userId, note);

    await this.logActivity(userId, 'note_created', 'note', note._id, {
      title: note.title,
    });

    return note;
  }

  async updateNote(noteId, noteData, userId) {
    const access = await noteRepository.findWritableById(noteId, userId);
    const note = access.note;

    if (noteData.title && !noteData.title.trim()) {
      throw new ValidationError('Title cannot be empty');
    }

    await noteRepository.createVersion(noteId, userId, note);

    const updatedNote = await noteRepository.update(noteId, noteData);

    await this.logActivity(userId, 'note_updated', 'note', noteId, {
      title: updatedNote.title,
    });

    return updatedNote;
  }

  async deleteNote(noteId, userId) {
    const note = await noteRepository.findById(noteId);

    if (note.userId.toString() !== userId.toString()) {
      throw new UnauthorizedError('You do not have access to this note');
    }

    await noteRepository.softDelete(noteId);

    await this.logActivity(userId, 'note_deleted', 'note', noteId, {
      title: note.title,
    });

    return { message: 'Đã xóa ghi chú', noteId };
  }

  async restoreNote(noteId, userId) {
    const note = await noteRepository.findById(noteId);

    if (note.userId.toString() !== userId.toString()) {
      throw new UnauthorizedError('You do not have access to this note');
    }

    const restoredNote = await noteRepository.restore(noteId);

    await this.logActivity(userId, 'note_restored', 'note', noteId, {
      title: restoredNote.title,
    });

    return restoredNote;
  }

  async permanentlyDeleteNote(noteId, userId) {
    const note = await noteRepository.findById(noteId);

    if (note.userId.toString() !== userId.toString()) {
      throw new UnauthorizedError('You do not have access to this note');
    }

    await noteRepository.permanentDelete(noteId);

    await this.logActivity(userId, 'note_deleted_permanently', 'note', noteId, {
      title: note.title,
    });

    return { message: 'Đã xóa vĩnh viễn' };
  }

  async getDeletedNotes(userId) {
    return await noteRepository.findDeleted(userId);
  }

  async getNoteVersions(noteId, userId) {
    await this.getNoteById(noteId, userId);
    return await noteRepository.getVersions(noteId);
  }

  async restoreVersion(noteId, versionId, userId) {
    const access = await noteRepository.findWritableById(noteId, userId);
    const version = await noteRepository.getVersion(versionId);

    if (version.noteId.toString() !== noteId.toString()) {
      throw new ValidationError('Version does not belong to this note');
    }

    await noteRepository.createVersion(noteId, userId, access.note);

    const updatedNote = await noteRepository.update(noteId, {
      title: version.title,
      content: version.content,
      richContent: version.richContent,
      color: version.color,
      tags: version.tags,
      category: version.category,
      checklist: version.checklist,
    });

    await this.logActivity(userId, 'version_restored', 'note', noteId, {
      versionId,
      title: updatedNote.title,
    });

    return updatedNote;
  }

  async logActivity(userId, action, entityType, entityId, details) {
    try {
      await ActivityLog.create({
        userId,
        action,
        entityType,
        entityId,
        details,
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }
}

module.exports = new NoteService();
