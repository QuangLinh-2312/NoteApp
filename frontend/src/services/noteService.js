import api from './api';

class NoteService {
  async getAllNotes(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/notes?${params}`);
    return response.data;
  }

  async getNoteById(id) {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  }

  async createNote(noteData) {
    const response = await api.post('/notes', noteData);
    return response.data;
  }

  async updateNote(id, noteData) {
    const response = await api.put(`/notes/${id}`, noteData);
    return response.data;
  }

  async deleteNote(id) {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  }

  async restoreNote(id) {
    const response = await api.post(`/notes/${id}/restore`);
    return response.data;
  }

  async permanentlyDeleteNote(id) {
    const response = await api.delete(`/notes/${id}/permanent`);
    return response.data;
  }

  async getDeletedNotes() {
    const response = await api.get('/notes/trash/all');
    return response.data;
  }

  async getNoteVersions(id) {
    const response = await api.get(`/notes/${id}/versions`);
    return response.data;
  }

  async restoreVersion(noteId, versionId) {
    const response = await api.post(`/notes/${noteId}/versions/${versionId}/restore`);
    return response.data;
  }
}

export default new NoteService();
