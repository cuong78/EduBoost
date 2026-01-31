import { apiClient } from './api';
import { API } from '../constants/api';
import {
    useMock,
    mockClasses,
    mockStudentsByClass,
    mockStudentDetail,
    mockInvitations,
    mockInvitationLogs,
} from '../mocks/invitationMockData';

const mockResolve = (data) => Promise.resolve(data);
const mockReject = (err) => Promise.reject(err);
const useMockOrFail = (err) => useMock() || err?.response?.status === 404 || err?.code === 'ERR_NETWORK';

const withMockFallback = (apiCall, getMock) =>
    apiCall().catch((err) => {
        if (useMockOrFail(err)) return mockResolve(getMock());
        return mockReject(err);
    });

export const teacherService = {
    getClasses: () =>
        withMockFallback(
            () => apiClient.get(API.TEACHER_CLASSES).then((res) => res.data?.data ?? res.data),
            () => mockClasses
        ),

    createClass: (body) =>
        useMock()
            ? mockResolve({ classId: 'class-new', ...body, studentCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
            : apiClient.post(API.TEACHER_CLASSES, body).then((res) => res.data?.data ?? res.data).catch((err) => useMockOrFail(err) ? mockResolve({ classId: 'class-new', ...body, studentCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }) : Promise.reject(err)),

    getStudentsByClass: (classId) =>
        withMockFallback(
            () => apiClient.get(API.TEACHER_CLASS_STUDENTS(classId)).then((res) => res.data?.data ?? res.data),
            () => mockStudentsByClass[classId] ?? []
        ),

    createStudent: (body) => {
        const mockPayload = {
            student: {
                studentId: 'student-new',
                studentCode: 'ST202499',
                fullName: body.fullName,
                email: body.email,
                classId: body.classId,
            },
            invitation: body.autoCreateInvitation
                ? { invitationCode: 'MOCK1234', expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }
                : null,
            credentials: { email: body.email, temporaryPassword: 'Welcome123!' },
        };
        return useMock()
            ? mockResolve(mockPayload)
            : apiClient.post(API.TEACHER_STUDENTS, body).then((res) => res.data?.data ?? res.data).catch((err) => useMockOrFail(err) ? mockResolve(mockPayload) : Promise.reject(err));
    },

    getStudentById: (studentId) =>
        withMockFallback(
            () => apiClient.get(API.TEACHER_STUDENT(studentId)).then((res) => res.data?.data ?? res.data),
            () => mockStudentDetail(studentId)
        ),

    updateStudent: (studentId, body) =>
        useMock()
            ? mockResolve({ studentId, ...body })
            : apiClient.put(API.TEACHER_STUDENT(studentId), body).then((res) => res.data?.data ?? res.data).catch((err) => useMockOrFail(err) ? mockResolve({ studentId, ...body }) : Promise.reject(err)),

    deleteStudent: (studentId) =>
        useMock() ? mockResolve({}) : apiClient.delete(API.TEACHER_STUDENT(studentId)).then((res) => res.data).catch((err) => useMockOrFail(err) ? mockResolve({}) : Promise.reject(err)),

    getInvitationsByStudent: (studentId, params) =>
        withMockFallback(
            () =>
                apiClient
                    .get(API.TEACHER_STUDENT_INVITATIONS(studentId), { params })
                    .then((res) => res.data?.data ?? res.data),
            () => mockInvitations
        ),

    createInvitation: (studentId, body) => {
        const mockInv = {
            invitationId: 'inv-new',
            invitationCode: 'NEWCODE99',
            studentCode: 'ST202401',
            studentName: 'Học sinh',
            expiresAt: new Date(Date.now() + (body.expiresInDays || 7) * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            sentAt: body.autoSend ? new Date().toISOString() : null,
        };
        return useMock()
            ? mockResolve(mockInv)
            : apiClient.post(API.TEACHER_STUDENT_INVITATIONS(studentId), body).then((res) => res.data?.data ?? res.data).catch((err) => useMockOrFail(err) ? mockResolve(mockInv) : Promise.reject(err));
    },

    sendInvitation: (invitationId, parentEmail) => {
        const body = { invitationId, parentEmail };
        const mockSent = { sentTo: parentEmail, sentAt: new Date().toISOString(), invitationCode: 'ABC123XY' };
        return useMock()
            ? mockResolve(mockSent)
            : apiClient.post(API.TEACHER_INVITATION_SEND, body).then((res) => res.data?.data ?? res.data).catch((err) => useMockOrFail(err) ? mockResolve(mockSent) : Promise.reject(err));
    },

    revokeInvitation: (invitationId) =>
        useMock()
            ? mockResolve({})
            : apiClient.put(API.TEACHER_INVITATION_REVOKE(invitationId)).then((res) => res.data?.data ?? res.data).catch((err) => useMockOrFail(err) ? mockResolve({}) : Promise.reject(err)),

    deleteInvitation: (invitationId) =>
        useMock() ? mockResolve({}) : apiClient.delete(API.TEACHER_INVITATION(invitationId)).then((res) => res.data).catch((err) => useMockOrFail(err) ? mockResolve({}) : Promise.reject(err)),

    getInvitationLogs: (invitationId) =>
        withMockFallback(
            () =>
                apiClient
                    .get(API.TEACHER_INVITATION_LOGS(invitationId))
                    .then((res) => res.data?.data ?? res.data),
            () => mockInvitationLogs
        ),
};
