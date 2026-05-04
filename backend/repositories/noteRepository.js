const Note = require('../models/Note');
const NoteVersion = require('../models/NoteVersion');
const ShareNote = require('../models/ShareNote');
const NotFoundError = require('../utils/errors/NotFoundError');
const UnauthorizedError = require('../utils/errors/UnauthorizedError');

class NoteRepository {
  async findAllOwned(userId, options = {}) {
    const query = { userId, deletedAt: null };

    if (options.isArchived !== undefined) {
      query.isArchived = options.isArchived;
    }

    if (options.isFavorite) {
      query.isFavorite = true;
    }

    if (options.category) {
      query.category = options.category;
    }

    return await Note.find(query).sort({ createdAt: -1 });
  }

  async findSharedWithUser(userId) {
    const shares = await ShareNote.find({ sharedWithId: userId }).populate('noteId');

    return shares
      .map((share) => share.noteId)
      .filter((note) => note && !note.deletedAt);
  }

  async findById(id) {
    const note = await Note.findById(id);
    if (!note) {
      throw new NotFoundError('Note not found');
    }
    return note;
  }

  async findAccessibleById(id, userId) {
    const note = await this.findById(id);
    const isOwner = note.userId.toString() === userId.toString();

    if (isOwner) {
      return { note, isOwner: true, permission: 'owner' };
    }

    const share = await ShareNote.findOne({
      noteId: note._id,
      sharedWithId: userId,
    });

    if (!share) {
      throw new UnauthorizedError('You do not have access to this note');
    }

    return { note, isOwner: false, permission: share.permission };
  }

  async findWritableById(id, userId) {
    const access = await this.findAccessibleById(id, userId);

    if (access.isOwner || access.permission === 'write') {
      return access;
    }

    throw new UnauthorizedError('You do not have permission to edit this note');
  }

  async create(noteData) {
    const note = new Note(noteData);
    return await note.save();
  }

  async update(id, noteData) {
    const note = await Note.findByIdAndUpdate(id, noteData, {
      new: true,
      runValidators: true,
    });

    if (!note) {
      throw new NotFoundError('Note not found');
    }

    return note;
  }

  async softDelete(id) {
    const note = await Note.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { new: true }
    );

    if (!note) {
      throw new NotFoundError('Note not found');
    }

    return note;
  }

  async permanentDelete(id) {
    await NoteVersion.deleteMany({ noteId: id });
    await ShareNote.deleteMany({ noteId: id });

    const note = await Note.findByIdAndDelete(id);
    if (!note) {
      throw new NotFoundError('Note not found');
    }

    return note;
  }

  async restore(id) {
    const note = await Note.findByIdAndUpdate(
      id,
      { deletedAt: null },
      { new: true }
    );

    if (!note) {
      throw new NotFoundError('Note not found');
    }

    return note;
  }

  async findDeleted(userId) {
    return await Note.find({
      userId,
      deletedAt: { $ne: null },
    }).sort({ deletedAt: -1 });
  }

  async createVersion(noteId, userId, noteData) {
    const versionNumber = (await NoteVersion.countDocuments({ noteId })) + 1;
    const version = new NoteVersion({
      noteId,
      userId,
      title: noteData.title,
      content: noteData.content,
      richContent: noteData.richContent,
      color: noteData.color,
      tags: noteData.tags,
      category: noteData.category,
      checklist: noteData.checklist,
      versionNumber,
    });

    return await version.save();
  }

  async getVersions(noteId) {
    return await NoteVersion.find({ noteId }).sort({ createdAt: -1 });
  }

  async getVersion(versionId) {
    const version = await NoteVersion.findById(versionId);
    if (!version) {
      throw new NotFoundError('Version not found');
    }

    return version;
  }
}

module.exports = new NoteRepository();
