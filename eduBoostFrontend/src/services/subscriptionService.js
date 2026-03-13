import { apiClient } from './api';

const BASE = '/subscriptions';

export const subscriptionService = {
    /** Public — get all active plans for Pricing page */
    getPlans: () => apiClient.get(`${BASE}/plans`).then(r => r.data?.data ?? r.data),

    /** Teacher — get current subscription */
    getMySubscription: () => apiClient.get(`${BASE}/my`).then(r => r.data?.data ?? r.data),

    /** Teacher — initiate payment → get VietQR info */
    initiatePayment: (planId) =>
        apiClient.post(`${BASE}/initiate`, { planId }).then(r => r.data?.data ?? r.data),

    /** Teacher — payment transaction history */
    getMyTransactions: () => apiClient.get(`${BASE}/transactions`).then(r => r.data?.data ?? r.data),

    /** Admin — pending transactions */
    getPendingTransactions: () => apiClient.get(`${BASE}/admin/pending`).then(r => r.data?.data ?? r.data),

    /** Admin — confirm a payment */
    confirmPayment: (id, note = '') =>
        apiClient.post(`${BASE}/admin/confirm/${id}`, { note }).then(r => r.data?.data ?? r.data),

    /** Admin — cancel a pending transaction */
    cancelTransaction: (id, reason = '') =>
        apiClient.post(`${BASE}/admin/cancel/${id}`, { reason }).then(r => r.data?.data ?? r.data),

    /** Poll transaction status by ID (used by payment modal to detect confirmation) */
    getTransactionStatus: (id) =>
        apiClient.get(`${BASE}/transactions/${id}`).then(r => r.data?.data ?? r.data),
};
