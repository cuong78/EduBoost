const BASE_URL = import.meta.env.VITE_API_URL;

export const API = {
    BASE: BASE_URL,
    ADMIN: `${BASE_URL}/admin`,
    PUBLIC: `${BASE_URL}/public`,
    USER: `${BASE_URL}/user`,
    TEACHER: `${BASE_URL}/teacher`,

    // Teacher
    TEACHER_CLASSES: `${BASE_URL}/teacher/classes`,
    TEACHER_CLASS_STUDENTS: (classId) => `${BASE_URL}/teacher/classes/${classId}/students`,
    TEACHER_STUDENTS: `${BASE_URL}/teacher/students`,
    TEACHER_STUDENT: (studentId) => `${BASE_URL}/teacher/students/${studentId}`,
    TEACHER_STUDENT_INVITATIONS: (studentId) => `${BASE_URL}/teacher/students/${studentId}/invitations`,
    TEACHER_INVITATION_CREATE_AND_SEND: `${BASE_URL}/teacher/invitations/create-and-send`,
    TEACHER_INVITATION_SEND: `${BASE_URL}/teacher/invitations/send`,
    TEACHER_INVITATION_REVOKE: (invitationId) => `${BASE_URL}/teacher/invitations/${invitationId}/revoke`,
    TEACHER_INVITATION: (invitationId) => `${BASE_URL}/teacher/invitations/${invitationId}`,
    TEACHER_INVITATION_LOGS: (invitationId) => `${BASE_URL}/teacher/invitations/${invitationId}/logs`,
    // Parent (public validate uses BASE)
    PARENT_VALIDATE_INVITATION: `${BASE_URL}/parent/validate-invitation`,
    PARENT_LINK_STUDENT: `${BASE_URL}/parent/link-student`,
    PARENT_STUDENTS: `${BASE_URL}/parent/students`,
    PARENT_STUDENT: (studentId) => `${BASE_URL}/parent/students/${studentId}`,
    PARENT_STUDENT_UNLINK: (studentId) => `${BASE_URL}/parent/students/${studentId}/unlink`,
    // Admin
    ADMIN_INVITATIONS_STATS: `${BASE_URL}/admin/invitations/stats`,
    ADMIN_INVITATIONS_EXPIRING: `${BASE_URL}/admin/invitations/expiring`,
    ADMIN_INVITATIONS_CLEANUP: `${BASE_URL}/admin/invitations/cleanup`,

    // Knowledge Structure (Module 1)
    SUBJECTS: `${BASE_URL}/subjects`,
    SUBJECT: (id) => `${BASE_URL}/subjects/${id}`,
    SUBJECT_CHAPTERS: (subjectId) => `${BASE_URL}/subjects/${subjectId}/chapters`,
    CHAPTER: (id) => `${BASE_URL}/chapters/${id}`,
    CHAPTER_LESSONS: (chapterId) => `${BASE_URL}/chapters/${chapterId}/lessons`,
    LESSON: (id) => `${BASE_URL}/lessons/${id}`,
    LESSON_CREATE: `${BASE_URL}/lessons`,
    LESSON_RESOURCES: (lessonId) => `${BASE_URL}/lessons/${lessonId}/resources`,
    RESOURCE: (id) => `${BASE_URL}/resources/${id}`,
    RESOURCE_CREATE: `${BASE_URL}/resources`,
    RESOURCE_FILE_UPLOAD: `${BASE_URL}/resources/file`,
    RESOURCE_DOWNLOAD: (id) => `${BASE_URL}/resources/${id}/download`,

    // Question Bank (Module 2)
    COGNITIVE_LEVELS: `${BASE_URL}/cognitive-levels`,
    QUESTION_BANK: `${BASE_URL}/question-bank`,
    QUESTION_BANK_ITEM: (id) => `${BASE_URL}/question-bank/${id}`,
    QUESTION_BANK_IMPORT: `${BASE_URL}/question-bank/import`,
    QUESTION_BANK_TEMPLATE: `${BASE_URL}/question-bank/template`,
    QUESTION_BANK_EXPORT: `${BASE_URL}/question-bank/export`,
    QUESTION_BANK_STATS: `${BASE_URL}/question-bank/stats`,

    // AI Services (Module 3)
    AI_GENERATE_FROM_RESOURCE: `${BASE_URL}/ai/generate-from-resource`,
    AI_GENERATE_VARIATIONS: `${BASE_URL}/ai/generate-variations`,
    AI_GENERATE_FROM_URL: `${BASE_URL}/ai/generate-from-url`,
    AI_GENERATE_WRONG_ANSWERS: `${BASE_URL}/ai/generate-wrong-answers`,
    AI_EVALUATE_QUESTION: `${BASE_URL}/ai/evaluate-question`,

    // Exam Management (Module 6)
    EXAM_TYPES: `${BASE_URL}/exam-types`,
    EXAM_TYPE: (id) => `${BASE_URL}/exam-types/${id}`,
    MATRIX_TEMPLATES: `${BASE_URL}/matrix-templates`,
    MATRIX_TEMPLATE: (id) => `${BASE_URL}/matrix-templates/${id}`,
    
    // Exams
    EXAMS: `${BASE_URL}/exams`,
    EXAM: (id) => `${BASE_URL}/exams/${id}`,
    EXAM_AUTO_SELECT: (examId) => `${BASE_URL}/exams/${examId}/auto-select`,
    EXAM_AUTO_SELECT_WITH_CONFIG: (examId) => `${BASE_URL}/exams/${examId}/auto-select-with-config`,
    EXAM_QUESTIONS: (examId) => `${BASE_URL}/exams/${examId}/questions`,
    EXAM_QUESTION: (examId, questionId) => `${BASE_URL}/exams/${examId}/questions/${questionId}`,
    EXAM_AI_GENERATE: (examId) => `${BASE_URL}/exams/${examId}/questions/ai-generate`,
    EXAM_REGENERATE_WRONG_ANSWERS: (examId, questionId) => `${BASE_URL}/exams/${examId}/questions/${questionId}/regenerate-wrong-answers`,
    EXAM_REORDER_QUESTIONS: (examId) => `${BASE_URL}/exams/${examId}/questions/reorder`,
    EXAM_APPROVE: (examId) => `${BASE_URL}/exams/${examId}/approve`,
    EXAM_STATUS: (examId) => `${BASE_URL}/exams/${examId}/status`,
    EXAM_EXPORT: (id) => `${BASE_URL}/exams/${id}/export`,
    EXAM_EXPORT_ANSWER_KEY: (id) => `${BASE_URL}/exams/${id}/export-answer-key`,
    EXAM_CLONE: (id) => `${BASE_URL}/exams/${id}/clone`,
    EXAM_STATISTICS: (id) => `${BASE_URL}/exams/${id}/statistics`,
    MY_EXAMS: `${BASE_URL}/exams/my-exams`,
};