import { apiClient } from './api';

const examAssignmentService = {
    /** Teacher: create assignment(s) */
    createAssignment: (data) =>
        apiClient.post('/api/exam-assignments', data).then(r => r.data),

    /** Teacher: list own assignments */
    getTeacherAssignments: () =>
        apiClient.get('/api/exam-assignments/teacher').then(r => r.data),

    /** Teacher: get classes they teach */
    getTeacherClasses: () =>
        apiClient.get('/api/exam-assignments/teacher/classes').then(r => r.data),

    /** Teacher: get submission results for an assignment */
    getAssignmentResults: (assignmentId) =>
        apiClient.get(`/api/exam-assignments/${assignmentId}/results`).then(r => r.data),

    /** Student: get all assignments */
    getStudentAssignments: () =>
        apiClient.get('/api/exam-assignments/student').then(r => r.data),

    /** Student: validate access code before entering exam */
    validateCode: (assignmentId, code) =>
        apiClient.post(`/api/exam-assignments/${assignmentId}/validate-code`, { code }).then(r => r.data),

    /** Student: submit answers */
    submitExam: (data) =>
        apiClient.post('/api/exam-assignments/submit', data).then(r => r.data),

    /** Student/Teacher: get result detail */
    getResult: (resultId) =>
        apiClient.get(`/api/exam-assignments/results/${resultId}`).then(r => r.data),

    /** Anti-cheat: report tab switch */
    reportFocusLoss: (assignmentId) =>
        apiClient.post(`/api/exam-assignments/${assignmentId}/report-focus-loss`).then(r => r.data),
};

export default examAssignmentService;

