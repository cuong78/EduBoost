import { apiClient } from './api';

const examAssignmentService = {
    /** Teacher: create assignment(s) */
    createAssignment: (data) =>
        apiClient.post('/exam-assignments', data).then(r => r.data),

    /** Teacher: list own assignments */
    getTeacherAssignments: () =>
        apiClient.get('/exam-assignments/teacher').then(r => r.data),

    /** Teacher: get classes they teach */
    getTeacherClasses: () =>
        apiClient.get('/exam-assignments/teacher/classes').then(r => r.data),

    /** Teacher: get submission results for an assignment */
    getAssignmentResults: (assignmentId) =>
        apiClient.get(`/exam-assignments/${assignmentId}/results`).then(r => r.data),

    /** Student: get exam questions for a validated assignment */
    getAssignmentQuestions: (assignmentId) =>
        apiClient.get(`/exam-assignments/${assignmentId}/questions`).then(r => r.data),

    /** Student: get all assignments */
    getStudentAssignments: () =>
        apiClient.get('/exam-assignments/student').then(r => r.data),

    /** Student: validate access code before entering exam */
    validateCode: (assignmentId, code) =>
        apiClient.post(`/exam-assignments/${assignmentId}/validate-code`, { code }).then(r => r.data),

    /** Student: submit answers */
    submitExam: (data) =>
        apiClient.post('/exam-assignments/submit', data).then(r => r.data),

    /** Student/Teacher: get result detail */
    getResult: (resultId) =>
        apiClient.get(`/exam-assignments/results/${resultId}`).then(r => r.data),

    /** Anti-cheat: report tab switch */
    reportFocusLoss: (assignmentId) =>
        apiClient.post(`/exam-assignments/${assignmentId}/report-focus-loss`).then(r => r.data),

    /** Teacher: get violation logs for an assignment */
    getViolationLogs: (assignmentId) =>
        apiClient.get(`/exam-assignments/${assignmentId}/violations`).then(r => r.data),

    /** Teacher: get class grades for grade management */
    getClassGrades: (classId) =>
        apiClient.get(`/exam-assignments/teacher/grades?classId=${classId}`).then(r => r.data),
};


export default examAssignmentService;

