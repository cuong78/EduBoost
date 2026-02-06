import { apiClient } from "./api";

const LESSON_API = {
  GET_BY_CHAPTER: (chapterId) => `/chapters/${chapterId}/lessons`,
  GET_BY_ID: (id) => `/lessons/${id}`,
  CREATE: "/lessons",
  UPDATE: (id) => `/lessons/${id}`,
  DELETE: (id) => `/lessons/${id}`,
};

export const adminLessonService = {
  /**
   * Get lessons by chapter
   */
  getLessonsByChapter: async (chapterId) => {
    const response = await apiClient.get(LESSON_API.GET_BY_CHAPTER(chapterId));
    return response.data;
  },

  /**
   * Get lesson by ID
   */
  getLessonById: async (id) => {
    const response = await apiClient.get(LESSON_API.GET_BY_ID(id));
    return response.data;
  },

  /**
   * Create new lesson
   */
  createLesson: async (data) => {
    const response = await apiClient.post(LESSON_API.CREATE, data);
    return response.data;
  },

  /**
   * Update lesson
   */
  updateLesson: async (id, data) => {
    const response = await apiClient.put(LESSON_API.UPDATE(id), data);
    return response.data;
  },

  /**
   * Delete lesson
   */
  deleteLesson: async (id) => {
    const response = await apiClient.delete(LESSON_API.DELETE(id));
    return response.data;
  },
};
