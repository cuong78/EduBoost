import { apiClient } from './api';

const BASE = '/feedback';

export const feedbackService = {
    /* ─── Teacher ─── */
    create: (data) =>
        apiClient.post(BASE, data).then(r => r.data?.data ?? r.data),

    getMyFeedbacks: () =>
        apiClient.get(`${BASE}/my`).then(r => r.data?.data ?? r.data),

    getMyFeedbackById: (id) =>
        apiClient.get(`${BASE}/my/${id}`).then(r => r.data?.data ?? r.data),

    /* ─── Admin ─── */
    getAll: () =>
        apiClient.get(`${BASE}/admin/all`).then(r => r.data?.data ?? r.data),

    getStats: () =>
        apiClient.get(`${BASE}/admin/stats`).then(r => r.data?.data ?? r.data),

    getById: (id) =>
        apiClient.get(`${BASE}/admin/${id}`).then(r => r.data?.data ?? r.data),

    respond: (id, data) =>
        apiClient.put(`${BASE}/admin/${id}/respond`, data).then(r => r.data?.data ?? r.data),
};
