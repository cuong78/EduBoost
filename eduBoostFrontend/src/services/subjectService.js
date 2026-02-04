import { apiClient } from './api';

// MOCK DATA
const MOCK_SUBJECTS = [
    { id: 1, name: 'Toán học', grade: 10, description: 'Chương trình Toán lớp 10' },
    { id: 2, name: 'Vật lý', grade: 11, description: 'Chương trình Vật lý lớp 11' },
    { id: 3, name: 'Hóa học', grade: 12, description: 'Chương trình Hóa học lớp 12' },
];

const MOCK_CHAPTERS = {
    1: [ // Maths
        { id: 101, name: 'Chương 1: Mệnh đề - Tập hợp', order: 1 },
        { id: 102, name: 'Chương 2: Bất phương trình', order: 2 },
    ]
};

const MOCK_LESSONS = {
    101: [ // Chapter 1 Math
        { id: 1001, name: 'Bài 1: Mệnh đề' },
        { id: 1002, name: 'Bài 2: Tập hợp' },
    ]
};

// Helper for Mock vs Real
const USE_MOCK = true; // Set to false when backend is ready
const mockDelay = (data) => new Promise(resolve => setTimeout(() => resolve(data), 500));

export const subjectService = {
    // SUBJECTS
    getSubjects: async () => {
        if (USE_MOCK) return mockDelay(MOCK_SUBJECTS);
        return apiClient.get('/subjects').then(res => res.data);
    },

    getSubjectById: async (id) => {
        if (USE_MOCK) return mockDelay(MOCK_SUBJECTS.find(s => s.id == id));
        return apiClient.get(`/subjects/${id}`).then(res => res.data);
    },

    createSubject: async (data) => {
        if (USE_MOCK) return mockDelay({ id: Date.now(), ...data });
        return apiClient.post('/subjects', data).then(res => res.data);
    },

    // CHAPTERS
    getChapters: async (subjectId) => {
        if (USE_MOCK) return mockDelay(MOCK_CHAPTERS[subjectId] || []);
        return apiClient.get(`/subjects/${subjectId}/chapters`).then(res => res.data);
    },

    createChapter: async (subjectId, data) => {
        if (USE_MOCK) return mockDelay({ id: Date.now(), subjectId, ...data });
        return apiClient.post(`/subjects/${subjectId}/chapters`, data).then(res => res.data);
    },

    // LESSONS
    getLessons: async (chapterId) => {
        if (USE_MOCK) return mockDelay(MOCK_LESSONS[chapterId] || []);
        return apiClient.get(`/chapters/${chapterId}/lessons`).then(res => res.data);
    },

    createLesson: async (chapterId, data) => {
        if (USE_MOCK) return mockDelay({ id: Date.now(), chapterId, ...data });
        return apiClient.post(`/chapters/${chapterId}/lessons`, data).then(res => res.data);
    },

    // RESOURCES
    getResources: async (lessonId) => {
        if (USE_MOCK) return mockDelay([
            { id: 1, name: 'Tài liệu SGK.pdf', type: 'PDF', size: '2.5MB' },
            { id: 2, name: 'Video bài giảng', type: 'URL', url: 'https://youtube.com/...' }
        ]);
        return apiClient.get(`/lessons/${lessonId}/resources`).then(res => res.data);
    },

    uploadResource: async (lessonId, formData) => {
        // Handle file upload
        if (USE_MOCK) return mockDelay({ id: Date.now(), name: 'Uploaded File.pdf', type: 'PDF' });
        return apiClient.post(`/lessons/${lessonId}/resources`, formData).then(res => res.data);
    },

    extractContent: async (resourceId) => {
        if (USE_MOCK) return mockDelay({ content: "Trích xuất nội dung từ file..." });
        return apiClient.post(`/resources/${resourceId}/extract`).then(res => res.data);
    }
};
