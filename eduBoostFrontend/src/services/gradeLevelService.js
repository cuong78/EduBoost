import { apiClient } from "./api";

const GRADE_LEVEL_API = {
  BASE: "/grade-levels",
  GET_ALL: "/grade-levels",
  GET_BY_ID: (gradeLevelId) => `/grade-levels/${gradeLevelId}`,
  GET_CLASSES: (gradeLevelId) => `/grade-levels/${gradeLevelId}/classes`,
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
   * Get grade level by ID
   */
  getGradeLevelById: async (gradeLevelId) => {
    const response = await apiClient.get(GRADE_LEVEL_API.GET_BY_ID(gradeLevelId));
    return response.data;
  },

  /**
   * Get classes by grade level ID
   */
  getClassesByGradeId: async (gradeLevelId) => {
    const response = await apiClient.get(GRADE_LEVEL_API.GET_CLASSES(gradeLevelId));
    return response.data;
  },
};
