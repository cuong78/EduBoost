import { apiClient } from "./api";

const CLASS_API = {
  BASE: "/classes",
  GET_ALL: "/classes",
  GET_BY_ID: (classId) => `/classes/${classId}`,
  GET_BY_GRADE: (gradeLevelId) => `/classes/grade/${gradeLevelId}`,
  CREATE: "/classes",
  UPDATE: (classId) => `/classes/${classId}`,
  DELETE: (classId) => `/classes/${classId}`,
  GET_TEACHERS: "/classes/teachers",
};

export const classService = {
  /**
   * Get all classes
   */
  getAllClasses: async () => {
    const response = await apiClient.get(CLASS_API.GET_ALL);
    return response.data;
  },

  /**
   * Get class by ID
   */
  getClassById: async (classId) => {
    const response = await apiClient.get(CLASS_API.GET_BY_ID(classId));
    return response.data;
  },

  /**
   * Get classes by grade level ID
   */
  getClassesByGradeId: async (gradeLevelId) => {
    const response = await apiClient.get(CLASS_API.GET_BY_GRADE(gradeLevelId));
    return response.data;
  },

  /**
   * Create new class
   */
  createClass: async (data) => {
    const response = await apiClient.post(CLASS_API.CREATE, data);
    return response.data;
  },

  /**
   * Update class information
   */
  updateClass: async (classId, data) => {
    const response = await apiClient.put(CLASS_API.UPDATE(classId), data);
    return response.data;
  },

  /**
   * Delete class
   */
  deleteClass: async (classId) => {
    const response = await apiClient.delete(CLASS_API.DELETE(classId));
    return response.data;
  },

  /**
   * Get all available teachers for class assignment
   */
  getAllAvailableTeachers: async () => {
    const response = await apiClient.get(CLASS_API.GET_TEACHERS);
    return response.data;
  },
};
