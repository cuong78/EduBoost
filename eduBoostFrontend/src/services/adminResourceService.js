import { apiClient } from "./api";

const RESOURCE_API = {
  GET_BY_LESSON: (lessonId) => `/lessons/${lessonId}/resources`,
  GET_BY_ID: (id) => `/resources/${id}`,
  UPLOAD_FILE: "/resources/file",
  CREATE: "/resources",
  DOWNLOAD: (id) => `/resources/${id}/download`,
  DELETE: (id) => `/resources/${id}`,
};

export const adminResourceService = {
  /**
   * Get resources by lesson ID
   */
  getResourcesByLesson: async (lessonId) => {
    const response = await apiClient.get(RESOURCE_API.GET_BY_LESSON(lessonId));
    return response.data;
  },

  /**
   * Get resource by ID
   */
  getResourceById: async (id) => {
    const response = await apiClient.get(RESOURCE_API.GET_BY_ID(id));
    return response.data;
  },

  /**
   * Upload file resource (PDF, DOCX, VIDEO, IMAGE)
   */
  uploadFileResource: async (lessonId, resourceType, file, resourceName) => {
    const formData = new FormData();
    formData.append("lessonId", lessonId);
    formData.append("resourceType", resourceType);
    formData.append("file", file);
    if (resourceName) {
      formData.append("resourceName", resourceName);
    }

    const response = await apiClient.post(RESOURCE_API.UPLOAD_FILE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Create URL or TEXT resource
   */
  createResource: async (data) => {
    const response = await apiClient.post(RESOURCE_API.CREATE, data);
    return response.data;
  },

  /**
   * Download resource file
   */
  downloadResource: async (id) => {
    const response = await apiClient.get(RESOURCE_API.DOWNLOAD(id), {
      responseType: "blob",
    });
    return response;
  },

  /**
   * Delete resource
   */
  deleteResource: async (id) => {
    const response = await apiClient.delete(RESOURCE_API.DELETE(id));
    return response.data;
  },
};
