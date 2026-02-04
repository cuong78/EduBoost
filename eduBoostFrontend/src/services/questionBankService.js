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
        if (filters.isVerified !== undefined) params.append('isVerified', filters.isVerified);
        if (filters.sourceType) params.append('sourceType', filters.sourceType);

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

    async verifyQuestion(id) {
        const response = await axios.put(`${API.QUESTION_BANK_ITEM(id)}/verify`, {}, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Import/Export
    async importFromExcel(file, lessonId) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('lessonId', lessonId);

        const token = localStorage.getItem('token');
        const response = await axios.post(API.QUESTION_BANK_IMPORT, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    async createQuestionsBatch(questions) {
        const response = await axios.post(`${API.QUESTION_BANK}/batch`, { questions }, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    async downloadTemplate() {
        const token = localStorage.getItem('token');
        const response = await axios.get(API.QUESTION_BANK_TEMPLATE, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'question-import-template.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
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

    // Image Upload
    async uploadImage(file) {
        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('token');
        const response = await axios.post(`${API.BASE}/images/upload`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
};
