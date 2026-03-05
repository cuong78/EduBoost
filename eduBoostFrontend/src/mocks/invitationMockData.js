/**
 * Mock data for testing Teacher / Parent / Admin invitation screens.
 *
 * - When the backend is unavailable (404 / network error), GET and write calls fall back to this mock
 *   so you can test all screens without running the API.
 * - To always use mock and skip real API calls, set VITE_USE_MOCK=true in .env or .env.development.
 *
 * Parent validate-invitation: use codes ABC123XY, MOCK1234 or VALID for success; EXPIRED / USED for error messages.
 */

const now = new Date();
const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

export const mockClasses = [
    {
        classId: 'class-1',
        className: '10A1',
        classCode: '10A1',
        schoolYear: '2024-2025',
        description: 'Lớp 10A1',
        studentCount: 3,
        teacherName: 'Nguyễn Văn Giáo',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
    },
    {
        classId: 'class-2',
        className: '10A2',
        classCode: '10A2',
        schoolYear: '2024-2025',
        description: 'Lớp 10A2',
        studentCount: 2,
        teacherName: 'Trần Thị Lan',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
    },
];

export const mockStudentsByClass = {
    'class-1': [
        {
            studentId: 'student-1',
            studentCode: 'ST202401',
            fullName: 'Nguyễn Văn A',
            email: 'student1@school.edu.vn',
            phone: '0912345678',
            classId: 'class-1',
            dateOfBirth: '2010-05-15',
            gender: 'MALE',
            address: '123 Đường ABC, Q.1, TP.HCM',
        },
        {
            studentId: 'student-2',
            studentCode: 'ST202402',
            fullName: 'Trần Thị B',
            email: 'student2@school.edu.vn',
            phone: '0987654321',
            classId: 'class-1',
            dateOfBirth: '2010-08-20',
            gender: 'FEMALE',
            address: '456 Đường XYZ, Q.3, TP.HCM',
        },
        {
            studentId: 'student-3',
            studentCode: 'ST202403',
            fullName: 'Lê Văn C',
            email: 'student3@school.edu.vn',
            phone: '0901122334',
            classId: 'class-1',
            dateOfBirth: '2010-01-10',
            gender: 'MALE',
        },
    ],
    'class-2': [
        {
            studentId: 'student-4',
            studentCode: 'ST202404',
            fullName: 'Phạm Thị D',
            email: 'student4@school.edu.vn',
            phone: '0977888999',
            classId: 'class-2',
            dateOfBirth: '2010-11-25',
            gender: 'FEMALE',
        },
        {
            studentId: 'student-5',
            studentCode: 'ST202405',
            fullName: 'Hoàng Văn E',
            email: 'student5@school.edu.vn',
            phone: '0966555444',
            classId: 'class-2',
            dateOfBirth: '2010-03-08',
            gender: 'MALE',
        },
    ],
};

export const mockStudentDetail = (studentId) => {
    for (const list of Object.values(mockStudentsByClass)) {
        const s = list.find((x) => x.studentId === studentId);
        if (s) return { ...s, className: '10A1', classId: s.classId };
    }
    return null;
};

export const mockInvitations = [
    {
        invitationId: 'inv-1',
        invitationCode: 'ABC123XY',
        invitationType: 'email',
        recipientEmail: 'parent1@gmail.com',
        status: 'active',
        createdAt: now.toISOString(),
        expiresAt: in7Days.toISOString(),
        usedAt: null,
        usedBy: null,
        maxUses: 1,
        currentUses: 0,
    },
    {
        invitationId: 'inv-2',
        invitationCode: 'XYZ789AB',
        invitationType: 'manual',
        recipientEmail: null,
        status: 'used',
        createdAt: yesterday.toISOString(),
        expiresAt: in7Days.toISOString(),
        usedAt: now.toISOString(),
        usedBy: { parentId: 'parent-1', fullName: 'Nguyễn Thị Phụ Huynh', email: 'parent1@gmail.com' },
        maxUses: 1,
        currentUses: 1,
    },
    {
        invitationId: 'inv-3',
        invitationCode: 'DEF456GH',
        invitationType: 'manual',
        status: 'expired',
        createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: yesterday.toISOString(),
        usedAt: null,
        usedBy: null,
        maxUses: 1,
        currentUses: 0,
    },
];

export const mockInvitationLogs = [
    { action: 'created', createdAt: now.toISOString(), performedBy: null },
    { action: 'viewed', createdAt: now.toISOString(), performedBy: null },
    { action: 'sent', createdAt: now.toISOString(), performedBy: null },
];

export const mockValidateInvitationSuccess = {
    valid: true,
    studentInfo: {
        studentCode: 'ST202401',
        fullName: 'Nguyễn Văn A',
        className: '10A1',
        gradeLevel: '10',
    },
    invitation: {
        expiresAt: in7Days.toISOString(),
        remainingUses: 1,
    },
};

export const mockValidateInvitationInvalid = (code) => ({
    valid: false,
    error: code === 'EXPIRED' ? 'Mã đã hết hạn' : code === 'USED' ? 'Mã đã được sử dụng' : 'Mã không tồn tại',
    errorCode: code || 'INVITATION_NOT_FOUND',
});

export const mockParentStudents = [
    {
        linkId: 'link-1',
        student: {
            studentId: 'student-1',
            studentCode: 'ST202401',
            fullName: 'Nguyễn Văn A',
            email: 'student1@school.edu.vn',
            dateOfBirth: '2010-05-15',
            gender: 'MALE',
        },
        class: {
            classId: 'class-1',
            className: '10A1',
            gradeLevel: '10',
            teacher: {
                teacherId: 'teacher-1',
                fullName: 'Nguyễn Văn Giáo',
                email: 'teacher@school.edu.vn',
            },
        },
        relationship: 'mother',
        isPrimary: true,
        linkedAt: now.toISOString(),
    },
    {
        linkId: 'link-2',
        student: {
            studentId: 'student-2',
            studentCode: 'ST202402',
            fullName: 'Trần Thị B',
            email: 'student2@school.edu.vn',
            dateOfBirth: '2010-08-20',
            gender: 'FEMALE',
        },
        class: {
            classId: 'class-1',
            className: '10A1',
            gradeLevel: '10',
            teacher: {
                teacherId: 'teacher-1',
                fullName: 'Nguyễn Văn Giáo',
                email: 'teacher@school.edu.vn',
            },
        },
        relationship: 'father',
        isPrimary: false,
        linkedAt: yesterday.toISOString(),
    },
];

export const mockParentStudentDetail = (studentId) => {
    const item = mockParentStudents.find((x) => (x.student?.studentId ?? x.studentId) === studentId);
    if (!item) return null;
    return {
        student: item.student,
        class: item.class,
        ...item,
    };
};

export const mockParentStudentScores = (studentId) => {
    const baseScores = [
        {
            resultId: 1,
            examId: 101,
            examTitle: 'Giữa kỳ Toán 10',
            subjectName: 'Toán học',
            subjectCode: 'MATH10',
            chapterName: 'Hàm số bậc nhất',
            semester: 1,
            schoolYear: '2024-2025',
            takenAt: now.toISOString(),
            score: 8.5,
            maxScore: 10,
            percentage: 85,
            status: 'PASSED',
            sourceType: 'TEACHER_INPUT',
        },
        {
            resultId: 2,
            examId: 102,
            examTitle: 'Giữa kỳ Vật lý 10',
            subjectName: 'Vật lý',
            subjectCode: 'PHYS10',
            chapterName: 'Động học',
            semester: 1,
            schoolYear: '2024-2025',
            takenAt: yesterday.toISOString(),
            score: 7.2,
            maxScore: 10,
            percentage: 72,
            status: 'PASSED',
            sourceType: 'ONLINE_EXAM',
        },
    ];

    return {
        content: baseScores,
        totalElements: baseScores.length,
        totalPages: 1,
        number: 0,
        size: baseScores.length,
    };
};

export const mockParentStudentScoreDetail = (studentId, resultId) => {
    const list = mockParentStudentScores(studentId).content;
    const base = list.find((x) => x.resultId === resultId) ?? list[0];
    return {
        ...base,
        gradingCriteria: 'Điểm được tính theo thang 10, mỗi câu 0.25 điểm.',
        teacherComment: 'Học sinh làm bài tốt, cần luyện thêm các câu vận dụng cao.',
        questionBreakdowns: [
            {
                questionNumber: 1,
                questionText: 'Câu hỏi 1...',
                studentAnswer: 'A',
                correctAnswer: 'A',
                pointsAwarded: 0.25,
                pointsPossible: 0.25,
            },
            {
                questionNumber: 2,
                questionText: 'Câu hỏi 2...',
                studentAnswer: 'C',
                correctAnswer: 'B',
                pointsAwarded: 0,
                pointsPossible: 0.25,
            },
        ],
    };
};

export const mockAdminStats = {
    total: 150,
    totalInvitations: 150,
    active: 45,
    used: 80,
    expired: 20,
    revoked: 5,
};

export const mockAdminExpiring = [
    { invitationId: 'inv-1', invitationCode: 'ABC123XY', studentName: 'Nguyễn Văn A', expiresAt: in7Days.toISOString(), status: 'active' },
    { invitationId: 'inv-2', invitationCode: 'MNO111ST', studentName: 'Trần Thị B', expiresAt: in30Days.toISOString(), status: 'active' },
];

export const useMock = () => import.meta.env.VITE_USE_MOCK === 'true';
