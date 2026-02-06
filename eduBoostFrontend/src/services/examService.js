import { API } from '../constants/api';
import { apiClient } from './api';

const useMock = () => import.meta.env.VITE_USE_MOCK === 'true';

const mockResolve = (data, delay = 500) =>
    new Promise((resolve) => setTimeout(() => resolve(data), delay));

// Mock data
const mockExamTypes = [
    { id: 1, typeCode: '15MIN', typeName: 'Kiểm tra 15 phút', requiresMatrix: false, description: 'Bài kiểm tra ngắn 15 phút', displayOrder: 1 },
    { id: 2, typeCode: '45MIN', typeName: 'Kiểm tra 1 tiết', requiresMatrix: true, description: 'Bài kiểm tra 1 tiết (45 phút)', displayOrder: 2 },
    { id: 3, typeCode: 'MIDTERM', typeName: 'Kiểm tra giữa kỳ', requiresMatrix: true, description: 'Bài kiểm tra giữa học kỳ', displayOrder: 3 },
    { id: 4, typeCode: 'FINAL', typeName: 'Kiểm tra cuối kỳ', requiresMatrix: true, description: 'Bài kiểm tra cuối học kỳ', displayOrder: 4 },
];

const mockMatrixTemplates = [
    {
        id: 1,
        templateName: 'Ma trận Toán 10 - 1 tiết',
        examTypeId: 2,
        examTypeName: 'Kiểm tra 1 tiết',
        subjectId: 1,
        subjectCode: 'MATH',
        subjectName: 'Toán học',
        gradeLevel: 10,
        totalQuestions: 20,
        totalPoints: 10.0,
        description: 'Ma trận đề thi 1 tiết môn Toán lớp 10',
        isDefault: true,
        createdByName: 'Nguyễn Văn A',
        createdAt: '2024-01-15T10:30:00',
        details: [
            { id: 1, cognitiveLevelId: 1, cognitiveLevelName: 'Nhận biết', numberOfQuestions: 8, pointsPerQuestion: 0.25, totalPoints: 2.0 },
            { id: 2, cognitiveLevelId: 2, cognitiveLevelName: 'Thông hiểu', numberOfQuestions: 6, pointsPerQuestion: 0.5, totalPoints: 3.0 },
            { id: 3, cognitiveLevelId: 3, cognitiveLevelName: 'Vận dụng', numberOfQuestions: 4, pointsPerQuestion: 0.75, totalPoints: 3.0 },
            { id: 4, cognitiveLevelId: 4, cognitiveLevelName: 'Vận dụng cao', numberOfQuestions: 2, pointsPerQuestion: 1.0, totalPoints: 2.0 },
        ]
    },
];

const mockExams = [
    {
        id: 1,
        examCode: 'MATH10-20240115',
        examTitle: 'Kiểm tra 15 phút - Hệ phương trình',
        examTypeId: 1,
        examTypeName: 'Kiểm tra 15 phút',
        subjectId: 1,
        subjectCode: 'MATH',
        subjectName: 'Toán học',
        gradeLevel: 10,
        duration: 15,
        totalQuestions: 10,
        status: 'DRAFT',
        description: 'Kiểm tra 15 phút về hệ phương trình bậc nhất 2 ẩn',
        createdByName: 'Nguyễn Văn A',
        createdAt: '2024-01-15T10:30:00',
        questions: []
    }
];

export const examService = {
    // ==================== Exam Types ====================
    
    getExamTypes: () =>
        useMock()
            ? mockResolve(mockExamTypes)
            : apiClient.get(API.EXAM_TYPES).then((res) => res.data),

    getExamTypeById: (id) =>
        useMock()
            ? mockResolve(mockExamTypes.find(t => t.id === id))
            : apiClient.get(API.EXAM_TYPE(id)).then((res) => res.data),

    // ==================== Matrix Templates ====================
    
    getMatrixTemplates: (params = {}) => {
        if (useMock()) {
            let result = [...mockMatrixTemplates];
            if (params.examTypeId) result = result.filter(t => t.examTypeId === params.examTypeId);
            if (params.subjectId) result = result.filter(t => t.subjectId === params.subjectId);
            if (params.gradeLevel) result = result.filter(t => t.gradeLevel === params.gradeLevel);
            return mockResolve(result);
        }
        return apiClient.get(API.MATRIX_TEMPLATES, { params }).then((res) => res.data);
    },

    getMatrixTemplateById: (id) =>
        useMock()
            ? mockResolve(mockMatrixTemplates.find(t => t.id === id))
            : apiClient.get(API.MATRIX_TEMPLATE(id)).then((res) => res.data),

    createMatrixTemplate: (data) =>
        useMock()
            ? mockResolve({ ...data, id: Date.now(), createdAt: new Date().toISOString() })
            : apiClient.post(API.MATRIX_TEMPLATES, data).then((res) => res.data),

    updateMatrixTemplate: (id, data) =>
        useMock()
            ? mockResolve({ ...data, id })
            : apiClient.put(API.MATRIX_TEMPLATE(id), data).then((res) => res.data),

    deleteMatrixTemplate: (id) =>
        useMock()
            ? mockResolve({})
            : apiClient.delete(API.MATRIX_TEMPLATE(id)).then((res) => res.data),
    
    // ==================== Exams CRUD ====================
    
    /**
     * Get exams with filters
     * @param {Object} params - { subjectId, gradeLevel, examTypeId, status, createdById, page, size, sort }
     */
    getExams: (params = {}) => {
        if (useMock()) {
            let result = [...mockExams];
            if (params.subjectId) result = result.filter(e => e.subjectId === params.subjectId);
            if (params.gradeLevel) result = result.filter(e => e.gradeLevel === params.gradeLevel);
            if (params.examTypeId) result = result.filter(e => e.examTypeId === params.examTypeId);
            if (params.status) result = result.filter(e => e.status === params.status);
            return mockResolve({ content: result, totalElements: result.length, totalPages: 1 });
        }
        return apiClient.get(API.EXAMS, { params }).then((res) => res.data);
    },
    
    getExamById: (id) =>
        useMock()
            ? mockResolve(mockExams.find(e => e.id === parseInt(id)) || mockExams[0])
            : apiClient.get(API.EXAM(id)).then((res) => res.data),
    
    /**
     * Create a new exam
     * @param {Object} data - {
     *   examTitle, examTypeId, subjectId, gradeLevel, durationMinutes, 
     *   chapterId (optional), lessonIds (optional), semester, schoolYear,
     *   config (for 15-minute exam), requirements (for matrix-based exam), matrixTemplateId
     * }
     */
    createExam: (data) =>
        useMock()
            ? mockResolve({ 
                ...data, 
                id: Date.now(), 
                examCode: `EXAM-${Date.now()}`,
                status: 'DRAFT',
                createdAt: new Date().toISOString(),
                questions: []
            })
            : apiClient.post(API.EXAMS, data).then((res) => res.data),
    
    updateExam: (id, data) =>
        useMock()
            ? mockResolve({ ...data, id })
            : apiClient.put(API.EXAM(id), data).then((res) => res.data),
    
    deleteExam: (id) =>
        useMock()
            ? mockResolve({})
            : apiClient.delete(API.EXAM(id)).then((res) => res.data),
    
    // ==================== Question Management ====================
    
    /**
     * Auto-select questions for exam based on configuration or matrix template
     */
    autoSelectQuestions: (examId) =>
        useMock()
            ? mockResolve({
                examId,
                totalQuestionsAdded: 10,
                fromExistingBank: 8,
                aiGenerated: 2,
                questions: []
            })
            : apiClient.post(API.EXAM_AUTO_SELECT(examId)).then((res) => res.data),
    
    /**
     * Auto-select questions with cognitive level distribution
     * @param {Object} config - { lessonDistribution: [{lessonId, numberOfQuestions}], cognitiveLevelDistribution: {levelId: count}, useAiGeneration: boolean }
     */
    autoSelectQuestionsWithConfig: (examId, config) =>
        useMock()
            ? mockResolve({
                examId,
                totalQuestionsAdded: 10,
                fromExistingBank: 6,
                aiGenerated: 4,
                questions: []
            })
            : apiClient.post(API.EXAM_AUTO_SELECT_WITH_CONFIG(examId), config, { timeout: 120000 }).then((res) => res.data),
    
    /**
     * Add a question to exam
     * @param {Object} data - { questionId, orderNumber (optional), points }
     */
    addQuestionToExam: (examId, data) =>
        useMock()
            ? mockResolve({
                id: Date.now(),
                examId,
                orderNumber: data.orderNumber ?? 1,
                points: data.points ?? 1,
                sourceFlag: 'EXISTING_BANK',
                questionId: data.questionId,
                questionText: 'Mock question text',
                correctAnswer: 'Mock correct answer',
                wrongAnswer1: 'Mock wrong answer 1',
                wrongAnswer2: 'Mock wrong answer 2',
                wrongAnswer3: 'Mock wrong answer 3'
            })
            : apiClient.post(API.EXAM_QUESTIONS(examId), data).then((res) => res.data),
    
    /**
     * AI generate questions for exam
     * @param {Object} data - { lessonId, cognitiveLevelId, numberOfQuestions, pointsPerQuestion (optional) }
     */
    aiGenerateQuestionsForExam: (examId, data) =>
        useMock()
            ? mockResolve(Array.from({ length: data.numberOfQuestions || 5 }, (_, i) => ({
                id: Date.now() + i,
                examId,
                orderNumber: i + 1,
                sourceFlag: 'AI_GENERATED',
                questionText: `AI Generated Question ${i + 1}`,
                correctAnswer: 'Option A',
                wrongAnswers: ['Option B', 'Option C', 'Option D']
            })))
            : apiClient.post(API.EXAM_AI_GENERATE(examId), data).then((res) => res.data),
    
    /**
     * Edit a question in exam
     * @param {Object} data - { modifiedQuestionText, modifiedCorrectAnswer, modifiedExplanation (optional), wrongAnswer1 (optional), wrongAnswer2 (optional), wrongAnswer3 (optional) }
     */
    editExamQuestion: (examId, examQuestionId, data) =>
        useMock()
            ? mockResolve({ id: examQuestionId, examId, sourceFlag: 'TEACHER_EDITED', ...data })
            : apiClient.put(API.EXAM_QUESTION(examId, examQuestionId), data).then((res) => res.data),
    
    /**
     * Regenerate wrong answers using AI
     */
    regenerateWrongAnswers: (examId, examQuestionId) =>
        useMock()
            ? mockResolve({
                id: examQuestionId,
                examId,
                wrongAnswer1: 'New Option B',
                wrongAnswer2: 'New Option C',
                wrongAnswer3: 'New Option D'
            })
            : apiClient.post(API.EXAM_REGENERATE_WRONG_ANSWERS(examId, examQuestionId)).then((res) => res.data),
    
    /**
     * Delete a question from exam
     */
    deleteExamQuestion: (examId, examQuestionId) =>
        useMock()
            ? mockResolve({})
            : apiClient.delete(API.EXAM_QUESTION(examId, examQuestionId)).then((res) => res.data),
    
    /**
     * Reorder questions in exam
     * @param {Object} data - { questionOrders: [{ examQuestionId, newOrderNumber }] }
     */
    reorderQuestions: (examId, data) =>
        useMock()
            ? mockResolve({})
            : apiClient.put(API.EXAM_REORDER_QUESTIONS(examId), data).then((res) => res.data),
    
    // ==================== Status Management ====================
    
    /**
     * Approve exam and save new questions to question bank
     */
    approveExam: (examId) =>
        useMock()
            ? mockResolve({
                examId,
                previousStatus: 'DRAFT',
                newStatus: 'APPROVED',
                totalQuestions: 10,
                savedToBank: 2,
                aiGeneratedSaved: 1,
                teacherEditedSaved: 1,
                approvedAt: new Date().toISOString()
            })
            : apiClient.post(API.EXAM_APPROVE(examId)).then((res) => res.data),
    
    /**
     * Change exam status
     * @param {Object} data - { newStatus: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED', note (optional) }
     */
    changeExamStatus: (examId, data) =>
        useMock()
            ? mockResolve({ id: examId, status: data.newStatus })
            : apiClient.put(API.EXAM_STATUS(examId), data).then((res) => res.data),
    
    // ==================== Export ====================
    
    /**
     * Export exam to PDF or DOCX
     * @param {string} format - 'pdf' or 'docx'
     */
    exportExam: (id, format = 'pdf') =>
        useMock()
            ? mockResolve(new Blob(['Mock exam content'], { type: 'application/pdf' }))
            : apiClient.get(API.EXAM_EXPORT(id), {
                params: { format },
                responseType: 'blob'
            }).then((res) => res.data),
    
    /**
     * Export answer key to PDF or DOCX
     * @param {string} format - 'pdf' or 'docx'
     */
    exportAnswerKey: (id, format = 'pdf') =>
        useMock()
            ? mockResolve(new Blob(['Mock answer key content'], { type: 'application/pdf' }))
            : apiClient.get(API.EXAM_EXPORT_ANSWER_KEY(id), {
                params: { format },
                responseType: 'blob'
            }).then((res) => res.data),
    
    // ==================== Clone ====================
    
    /**
     * Clone an exam with all questions
     */
    cloneExam: (id) =>
        useMock()
            ? mockResolve({ 
                id: Date.now(), 
                examCode: `EXAM-CLONE-${Date.now()}`,
                examTitle: 'Bản sao - ' + mockExams[0]?.examTitle,
                status: 'DRAFT',
                createdAt: new Date().toISOString()
            })
            : apiClient.post(API.EXAM_CLONE(id)).then((res) => res.data),
    
    // ==================== Statistics ====================
    
    /**
     * Get exam statistics
     */
    getExamStatistics: (id) =>
        useMock()
            ? mockResolve({
                examId: parseInt(id),
                totalQuestions: 10,
                fromQuestionBank: 6,
                aiGenerated: 2,
                teacherEdited: 2,
                byCognitiveLevel: [
                    { cognitiveLevelName: 'Nhận biết', count: 4 },
                    { cognitiveLevelName: 'Thông hiểu', count: 3 },
                    { cognitiveLevelName: 'Vận dụng', count: 2 },
                    { cognitiveLevelName: 'Vận dụng cao', count: 1 }
                ],
                byLesson: [
                    { lessonName: 'Bài 1', count: 5 },
                    { lessonName: 'Bài 2', count: 5 }
                ]
            })
            : apiClient.get(API.EXAM_STATISTICS(id)).then((res) => res.data),
    
    // ==================== My Exams ====================
    
    /**
     * Get exams created by current user
     */
    getMyExams: () =>
        useMock()
            ? mockResolve(mockExams)
            : apiClient.get(API.MY_EXAMS).then((res) => res.data),
};
