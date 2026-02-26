import { apiClient } from "./api";

const GRADE_LEVEL_API = {
  BASE: "/grade-levels",
  GET_ALL: "/grade-levels",
  GET_ALL_WITH_STATS: "/grade-levels/with-stats",
  GET_BY_ID: (gradeLevelId) => `/grade-levels/${gradeLevelId}`,
  GET_DETAIL: (gradeLevelId) => `/grade-levels/${gradeLevelId}/detail`,
  GET_CLASSES: (gradeLevelId) => `/grade-levels/${gradeLevelId}/classes`,
  CREATE: "/grade-levels",
  UPDATE: (gradeLevelId) => `/grade-levels/${gradeLevelId}`,
  DELETE: (gradeLevelId) => `/grade-levels/${gradeLevelId}`,
};

export const gradeLevelService = {
  /**
   * Get all grade levels
   */
  getAllGradeLevels: async () => {
    const response = await apiClient.get(GRADE_LEVEL_API.GET_ALL);
    return response.data;
  },

  /**
   * Get all grade levels with statistics (class count and student count)
   */
  getAllGradeLevelsWithStats: async () => {
    const response = await apiClient.get(GRADE_LEVEL_API.GET_ALL_WITH_STATS);
    return response.data;
  },

  /**
   * Get grade level by ID
   */
  getGradeLevelById: async (gradeLevelId) => {
    const response = await apiClient.get(GRADE_LEVEL_API.GET_BY_ID(gradeLevelId));
    return response.data;
  },

  /**
   * Get grade level detail with statistics
   */
  getGradeLevelDetailById: async (gradeLevelId) => {
    const response = await apiClient.get(GRADE_LEVEL_API.GET_DETAIL(gradeLevelId));
    return response.data;
  },

  /**
   * Get classes by grade level ID
   */
  getClassesByGradeId: async (gradeLevelId) => {
    const response = await apiClient.get(GRADE_LEVEL_API.GET_CLASSES(gradeLevelId));
    return response.data;
  },

  /**
   * Create new grade level
   */
  createGradeLevel: async (data) => {
    const response = await apiClient.post(GRADE_LEVEL_API.CREATE, data);
    return response.data;
  },

  /**
   * Update grade level
   */
  updateGradeLevel: async (gradeLevelId, data) => {
    const response = await apiClient.put(GRADE_LEVEL_API.UPDATE(gradeLevelId), data);
    return response.data;
  },

  /**
   * Delete grade level
   */
  deleteGradeLevel: async (gradeLevelId) => {
    const response = await apiClient.delete(GRADE_LEVEL_API.DELETE(gradeLevelId));
    return response.data;
  },
};
