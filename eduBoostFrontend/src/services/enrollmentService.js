import axios from "axios";

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;
  return "http://localhost:8080/api";
};

export const enrollmentService = {
  /**
   * Fetch basic public info of a class for student enrollment (unauthenticated)
   * @param {string} classId
   */
  getClassPublicInfo: async (classId) => {
    const response = await axios.get(`${getBaseUrl()}/classes/${classId}/public-info`);
    return response.data;
  },

  /**
   * Enroll a student into a class using QR code / classId (unauthenticated)
   * @param {Object} data - { classId, email, fullName, phone }
   */
  enrollStudent: async (data) => {
    const response = await axios.post(`${getBaseUrl()}/enroll`, data);
    return response.data;
  },

  /**
   * Enroll a student into a class using Google OAuth ID Token (unauthenticated)
   * @param {Object} data - { idToken, classId }
   */
  enrollWithGoogle: async (data) => {
    const response = await axios.post(`${getBaseUrl()}/enroll/google`, data);
    return response.data;
  },

  /**
   * Helper to get full QR code image URL for a class
   * @param {string} classId
   */
  getQRCodeImageUrl: (classId) => {
    return `${getBaseUrl()}/classes/${classId}/qr-code`;
  },
};
