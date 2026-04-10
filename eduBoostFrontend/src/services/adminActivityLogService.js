import { apiClient } from "./api";

const ACTIVITY_LOG_API = {
  GET_ALL: "/activity-logs",
};

export const adminActivityLogService = {
  getActivityLogs: async ({ keyword = "", page = 1, size = 10 } = {}) => {
    const response = await apiClient.get(ACTIVITY_LOG_API.GET_ALL, {
      params: {
        keyword: keyword?.trim() || undefined,
        page,
        size,
      },
    });

    const payload = response?.data?.data || {};
    return {
      success: payload?.success ?? true,
      data: payload?.data || [],
      pagination: payload?.pagination || {
        total: 0,
        page,
        limit: size,
      },
      message: response?.data?.message || "",
    };
  },
};
