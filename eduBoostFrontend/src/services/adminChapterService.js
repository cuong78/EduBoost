import { apiClient } from "./api";

const CHAPTER_API = {
  GET_BY_SUBJECT: (subjectId, gradeLevel) =>
    gradeLevel
      ? `/subjects/${subjectId}/chapters?gradeLevel=${gradeLevel}`
      : `/subjects/${subjectId}/chapters`,
  GET_BY_ID: (id) => `/chapters/${id}`,
  CREATE: (subjectId) => `/subjects/${subjectId}/chapters`,
  UPDATE: (id) => `/chapters/${id}`,
  DELETE: (id) => `/chapters/${id}`,
};

export const adminChapterService = {
  /**
   * Get chapters by subject
   */
  getChaptersBySubject: async (subjectId, gradeLevel = null) => {
    const response = await apiClient.get(
      CHAPTER_API.GET_BY_SUBJECT(subjectId, gradeLevel),
    );
    return response.data;
  },

  /**
   * Get chapter by ID
   */
  getChapterById: async (id) => {
    const response = await apiClient.get(CHAPTER_API.GET_BY_ID(id));
    return response.data;
  },

  /**
   * Create new chapter
   */
  createChapter: async (subjectId, data) => {
    const response = await apiClient.post(CHAPTER_API.CREATE(subjectId), data);
    return response.data;
  },

  /**
   * Update chapter
   */
  updateChapter: async (id, data) => {
    const response = await apiClient.put(CHAPTER_API.UPDATE(id), data);
    return response.data;
  },

  /**
   * Delete chapter
   */
  deleteChapter: async (id) => {
    const response = await apiClient.delete(CHAPTER_API.DELETE(id));
    return response.data;
  },
};
