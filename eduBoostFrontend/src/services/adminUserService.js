import { apiClient } from "./api";

const ADMIN_USER_API = {
  BASE: "/admin/users",
  GET_ALL: "/admin/users",
  GET_BY_ID: (userId) => `/admin/users/${userId}`,
  UPDATE: (userId) => `/admin/users/${userId}`,
  UPDATE_STATUS: (userId) => `/admin/users/${userId}/status`,
};

export const adminUserService = {
  /**
   * Get all users
   */
  getAllUsers: async () => {
    const response = await apiClient.get(ADMIN_USER_API.GET_ALL);
    return response.data;
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId) => {
    const response = await apiClient.get(ADMIN_USER_API.GET_BY_ID(userId));
    return response.data;
  },

  /**
   * Update user information
   */
  updateUser: async (userId, data) => {
    const response = await apiClient.put(ADMIN_USER_API.UPDATE(userId), data);
    return response.data;
  },

  /**
   * Update user status
   */
  updateUserStatus: async (userId, status) => {
    const response = await apiClient.put(ADMIN_USER_API.UPDATE_STATUS(userId), {
      status,
    });
    return response.data;
  },
};
