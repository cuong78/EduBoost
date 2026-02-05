import { apiClient } from "./api";

const SUBJECT_API = {
  BASE: "/subjects",
  GET_ALL: "/subjects",
  GET_BY_ID: (id) => `/subjects/${id}`,
  CREATE: "/subjects",
  UPDATE: (id) => `/subjects/${id}`,
  DELETE: (id) => `/subjects/${id}`,
};

export const adminSubjectService = {
  /**
   * Get all subjects
   */
  getAllSubjects: async () => {
    const response = await apiClient.get(SUBJECT_API.GET_ALL);
    return response.data;
  },

  /**
   * Get subject by ID
   */
  getSubjectById: async (id) => {
    const response = await apiClient.get(SUBJECT_API.GET_BY_ID(id));
    return response.data;
  },

  /**
   * Create new subject
   */
  createSubject: async (data) => {
    const response = await apiClient.post(SUBJECT_API.CREATE, data);
    return response.data;
  },

  /**
   * Update subject
   */
  updateSubject: async (id, data) => {
    const response = await apiClient.put(SUBJECT_API.UPDATE(id), data);
    return response.data;
  },

  /**
   * Delete subject
   */
  deleteSubject: async (id) => {
    const response = await apiClient.delete(SUBJECT_API.DELETE(id));
    return response.data;
  },
};
