const noteService = require('../services/noteService');

class NoteController {
  async getAllNotes(req, res, next) {
    try {
      const { isArchived, isFavorite, category } = req.query;
      const filters = {};
      
      if (isArchived !== undefined) filters.isArchived = isArchived === 'true';
      if (isFavorite) filters.isFavorite = true;
      if (category) filters.category = category;

      const result = await noteService.getAllNotes(req.userId, filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getNoteById(req, res, next) {
    try {
      const note = await noteService.getNoteById(req.params.id, req.userId);
      res.json(note);
    } catch (error) {
      next(error);
    }
  }

  async createNote(req, res, next) {
    try {
      const note = await noteService.createNote(req.body, req.userId);
      res.status(201).json(note);
    } catch (error) {
      next(error);
    }
  }

  async updateNote(req, res, next) {
    try {
      const note = await noteService.updateNote(req.params.id, req.body, req.userId);
      res.json(note);
    } catch (error) {
      next(error);
    }
  }

  async deleteNote(req, res, next) {
    try {
      const note = await noteService.deleteNote(req.params.id, req.userId);
      res.json(note);
    } catch (error) {
      next(error);
    }
  }

  async restoreNote(req, res, next) {
    try {
      const note = await noteService.restoreNote(req.params.id, req.userId);
      res.json(note);
    } catch (error) {
      next(error);
    }
  }

  async permanentlyDeleteNote(req, res, next) {
    try {
      const result = await noteService.permanentlyDeleteNote(req.params.id, req.userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getDeletedNotes(req, res, next) {
    try {
      const notes = await noteService.getDeletedNotes(req.userId);
      res.json(notes);
    } catch (error) {
      next(error);
    }
  }

  async getNoteVersions(req, res, next) {
    try {
      const versions = await noteService.getNoteVersions(req.params.id, req.userId);
      res.json(versions);
    } catch (error) {
      next(error);
    }
  }

  async restoreVersion(req, res, next) {
    try {
      const note = await noteService.restoreVersion(
        req.params.id,
        req.params.versionId,
        req.userId
      );
      res.json(note);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NoteController();
