import { apiClient } from './api';

// MOCK DATA
const MOCK_QUESTIONS = [
    {
        id: 1,
        content: 'Tập hợp các số tự nhiên kí hiệu là gì?',
        type: 'MCQ',
        level: 'NB',
        lessonId: 1001,
        source: 'MANUAL',
        options: ['N', 'Z', 'Q', 'R'],
        correct: 'N'
    },
    {
        id: 2,
        content: 'Giải phương trình x + 1 = 0',
        type: 'MCQ',
        level: 'TH',
        lessonId: 1002,
        source: 'AI_GENERATED',
        options: ['x=1', 'x=-1', 'x=0', 'Vô nghiệm'],
        correct: 'x=-1'
    },
];

const USE_MOCK = true;
const mockDelay = (data) => new Promise(resolve => setTimeout(() => resolve(data), 600));

export const questionBankService = {
    getQuestions: async (filters = {}) => {
        // Handle filters: subjectId, chapterId, lessonId, level, etc.
        if (USE_MOCK) return mockDelay(MOCK_QUESTIONS);

        const params = new URLSearchParams(filters).toString();
        return apiClient.get(`/question-bank?${params}`).then(res => res.data);
    },

    createQuestion: async (data) => {
        if (USE_MOCK) return mockDelay({ id: Date.now(), ...data });
        return apiClient.post('/question-bank', data).then(res => res.data);
    },

    updateQuestion: async (id, data) => {
        if (USE_MOCK) return mockDelay({ id, ...data });
        return apiClient.put(`/question-bank/${id}`, data).then(res => res.data);
    },

    deleteQuestion: async (id) => {
        if (USE_MOCK) return mockDelay({ success: true });
        return apiClient.delete(`/question-bank/${id}`).then(res => res.data);
    },

    getTemplate: async () => {
        // Return URL or Blob for Excel template
        if (USE_MOCK) return mockDelay('http://example.com/template.xlsx');
        return apiClient.get('/question-bank/template').then(res => res.data);
    },

    importQuestions: async (data) => {
        if (USE_MOCK) return mockDelay({ imported: 15, failed: 0 });
        return apiClient.post('/question-bank/import', data).then(res => res.data);
    },

    // AI Features
    generateFromResource: async (resourceId, config) => {
        // config: { numberOfQuestions, levelDistribution, ... }
        if (USE_MOCK) return mockDelay([
            { id: 99, content: 'AI Generated Question 1', level: 'NB', options: ['A', 'B', 'C', 'D'] },
            { id: 100, content: 'AI Generated Question 2', level: 'TH', options: ['A', 'B', 'C', 'D'] },
        ]);
        return apiClient.post('/ai/generate-from-resource', { resourceId, ...config }).then(res => res.data);
    },

    generateWrongAnswers: async (questionText, correctAnswer) => {
        if (USE_MOCK) return mockDelay(['Sai 1', 'Sai 2', 'Sai 3']);
        return apiClient.post('/ai/generate-wrong-answers', { questionText, correctAnswer }).then(res => res.data);
    }
};
