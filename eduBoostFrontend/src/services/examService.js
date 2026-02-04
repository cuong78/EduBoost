import { apiClient } from './api';

const USE_MOCK = true;
const mockDelay = (data) => new Promise(resolve => setTimeout(() => resolve(data), 400));

export const examService = {
    // MATRIX
    getMatrixTemplates: async (subjectId) => {
        if (USE_MOCK) return mockDelay([
            { id: 1, name: 'Ma trận Toán 10 - 1 Tiết', totalQuestions: 20 },
            { id: 2, name: 'Ma trận Toán 10 - Học Kỳ', totalQuestions: 50 },
        ]);
        return apiClient.get(`/matrix-templates?subjectId=${subjectId}`).then(res => res.data);
    },

    createMatrixTemplate: async (data) => {
        if (USE_MOCK) return mockDelay({ id: Date.now(), ...data });
        return apiClient.post('/matrix-templates', data).then(res => res.data);
    },

    // EXAMS
    getExams: async (filters = {}) => {
        if (USE_MOCK) return mockDelay([
            { id: 1, title: 'Kiểm tra 15p - Chương 1', subject: 'Toán học', status: 'Draft' },
            { id: 2, title: 'Thi Học Kỳ 1', subject: 'Vật lý', status: 'Published' },
        ]);
        const params = new URLSearchParams(filters).toString();
        return apiClient.get(`/exams?${params}`).then(res => res.data);
    },

    getExamById: async (id) => {
        if (USE_MOCK) return mockDelay({
            id,
            title: 'Kiểm tra 15p',
            questions: [
                { id: 1, text: 'Câu 1...', type: 'MCQ' },
                { id: 2, text: 'Câu 2...', type: 'MCQ' }
            ]
        });
        return apiClient.get(`/exams/${id}`).then(res => res.data);
    },

    createExam: async (data) => {
        /*
        data = {
            examTitle, examTypeId, subjectId, gradeLevel,
            matrixTemplateId, durationMinutes, lessonIds,
            config: { totalQuestions, pointsPerQuestion, ... }
        }
        */
        if (USE_MOCK) return mockDelay({ id: Date.now(), ...data });
        return apiClient.post('/exams', data).then(res => res.data);
    },

    autoSelectQuestions: async (examId) => {
        // Trigger auto-selection logic based on exam config
        if (USE_MOCK) return mockDelay({
            totalAdded: 10,
            questions: [] // populated list
        });
        return apiClient.post(`/exams/${examId}/auto-select`).then(res => res.data);
    },

    updateExam: async (id, data) => {
        if (USE_MOCK) return mockDelay({ id, ...data });
        return apiClient.put(`/exams/${id}`, data).then(res => res.data);
    },

    deleteExam: async (id) => {
        if (USE_MOCK) return mockDelay({ success: true });
        return apiClient.delete(`/exams/${id}`).then(res => res.data);
    },

    approveExam: async (id) => {
        if (USE_MOCK) return mockDelay({ status: 'APPROVED' });
        return apiClient.post(`/exams/${id}/approve`).then(res => res.data);
    }
};
