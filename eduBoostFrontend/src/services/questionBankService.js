import axios from 'axios';
import { API } from '../constants/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

export const questionBankService = {
    // Cognitive Levels
    async getCognitiveLevels() {
        const response = await axios.get(API.COGNITIVE_LEVELS || `${API.BASE}/cognitive-levels`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Questions
    async getQuestions(filters = {}) {
        const params = new URLSearchParams();
        if (filters.lessonId) params.append('lessonId', filters.lessonId);
        if (filters.cognitiveLevelId) params.append('cognitiveLevelId', filters.cognitiveLevelId);
        if (filters.sourceType) params.append('sourceType', filters.sourceType);
        if (filters.chapterId) params.append('chapterId', filters.chapterId);
        if (filters.createdById) params.append('createdById', filters.createdById);
        params.append('page', filters.page != null ? filters.page : 0);
        params.append('size', filters.size != null ? filters.size : 20);

        const response = await axios.get(`${API.QUESTION_BANK}?${params.toString()}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    async getQuestionById(id) {
        const response = await axios.get(API.QUESTION_BANK_ITEM(id), {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    async createQuestion(data) {
        const response = await axios.post(API.QUESTION_BANK, data, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    async updateQuestion(id, data) {
        const response = await axios.put(API.QUESTION_BANK_ITEM(id), data, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    async deleteQuestion(id) {
        await axios.delete(API.QUESTION_BANK_ITEM(id), {
            headers: getAuthHeaders()
        });
    },

    // Import from Word (.docx)
    async importFromWord(file, lessonId, useAiClassification = true) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('lessonId', lessonId);
        formData.append('useAiClassification', useAiClassification);

        const token = localStorage.getItem('token');
        const response = await axios.post(`${API.QUESTION_BANK}/import-word`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            },
            timeout: 300000 // 5 minutes
        });
        return response.data;
    },

    // Bulk Import from ZIP
    async bulkImport(zipFile, useAiClassification = true) {
        const formData = new FormData();
        formData.append('file', zipFile);
        formData.append('useAiClassification', useAiClassification);

        const token = localStorage.getItem('token');
        const response = await axios.post(`${API.QUESTION_BANK}/bulk-import`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            },
            timeout: 900000 // 15 minutes - AI classification can take time
        });
        return response.data;
    },

    async createQuestionsBatch(questions) {
        const response = await axios.post(`${API.QUESTION_BANK}/batch`, { questions }, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Word Template Download — creates a sample .docx template content
    downloadWordTemplate() {
        const templateContent = `HƯỚNG DẪN SOẠN ĐỀ IMPORT VÀO EDUBOOST
============================================

Định dạng mỗi câu hỏi trắc nghiệm:

Câu 1: [Nội dung câu hỏi]
A. [Đáp án A]
B. [Đáp án B]
C. [Đáp án C]
D. [Đáp án D]
Đáp án: [A/B/C/D]
Lời giải: [Giải thích cho đáp án đúng]

Câu 2: [Nội dung câu hỏi tiếp theo]
A. [Đáp án A]
B. [Đáp án B]
C. [Đáp án C]
D. [Đáp án D]
Đáp án: [A/B/C/D]
Lời giải: [Giải thích]

============================================
LƯU Ý:
- Lưu file dạng .docx (Word)
- Mỗi câu bắt đầu bằng "Câu N:" (N là số thứ tự)
- Đáp án dùng chữ cái: A, B, C, D
- Có thể chèn hình ảnh trực tiếp vào file Word
- Hỗ trợ công thức toán học (Equation Editor)
- Lời giải là tùy chọn, có thể bỏ qua
`;
        const blob = new Blob([templateContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'EduBoost_Template_Import.txt';
        a.click();
        URL.revokeObjectURL(url);
    },

    // Statistics
    async getStats(subjectId, gradeLevel) {
        const params = new URLSearchParams();
        if (subjectId) params.append('subjectId', subjectId);
        if (gradeLevel) params.append('gradeLevel', gradeLevel);

        const response = await axios.get(`${API.QUESTION_BANK_STATS}?${params.toString()}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Image Upload for questions
    async uploadImage(file) {
        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('token');
        const response = await axios.post(`${API.QUESTION_BANK}/upload-image`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // AI Generate Questions from Resource
    async generateFromResource(params) {
        const response = await axios.post(`${API.BASE}/ai/generate-from-resource`, params, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // AI Generate Variations
    async generateVariations(params) {
        const response = await axios.post(`${API.BASE}/ai/generate-variations`, params, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // AI Generate from URL
    async generateFromUrl(params) {
        const response = await axios.post(`${API.BASE}/ai/generate-from-url`, params, {
            headers: getAuthHeaders()
        });
        return response.data;
    }
};
