import axios from 'axios';
import { apiClient } from './api';
import { API } from '../constants/api';
import {
    useMock,
    mockValidateInvitationSuccess,
    mockValidateInvitationInvalid,
    mockParentStudents,
    mockParentStudentDetail,
  mockParentStudentScores,
  mockParentStudentScoreDetail,
} from '../mocks/invitationMockData';

const mockResolve = (data) => Promise.resolve(data);

/** Public endpoint - no auth; returns mock when API fails or VITE_USE_MOCK */
export const validateInvitation = (body) => {
    const code = (body?.invitationCode ?? '').trim().toUpperCase();
    if (useMock()) {
        if (code === 'ABC123XY' || code === 'MOCK1234' || code === 'VALID') {
            return mockResolve(mockValidateInvitationSuccess);
        }
        if (code === 'EXPIRED') return mockResolve(mockValidateInvitationInvalid('EXPIRED'));
        if (code === 'USED') return mockResolve(mockValidateInvitationInvalid('USED'));
        return mockResolve(mockValidateInvitationInvalid('INVITATION_NOT_FOUND'));
    }
    return axios
        .post(API.PARENT_VALIDATE_INVITATION, body, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000,
        })
        .then((res) => res.data?.data ?? res.data)
        .catch((err) => {
            if (err?.response?.status === 404 || err?.code === 'ERR_NETWORK') {
                return mockResolve(code ? mockValidateInvitationSuccess : mockValidateInvitationInvalid());
            }
            return Promise.reject(err);
        });
};

const withMockFallback = (apiCall, getMock) =>
    apiCall().catch((err) => {
        if (useMock() || err?.response?.status === 404 || err?.code === 'ERR_NETWORK') {
            return mockResolve(getMock());
        }
        return Promise.reject(err);
    });

export const parentService = {
    validateInvitation,

    linkStudent: (body) => {
        const mockLink = {
            linkId: 'link-new',
            student: {
                studentId: 'student-1',
                studentCode: 'ST202401',
                fullName: 'Nguyễn Văn A',
                className: '10A1',
                avatar: null,
            },
            relationship: body.relationship,
            linkedAt: new Date().toISOString(),
        };
        return useMock()
            ? mockResolve(mockLink)
            : apiClient.post(API.PARENT_LINK_STUDENT, body).then((res) => res.data?.data ?? res.data).catch((err) => (useMock() || err?.response?.status === 404 || err?.code === 'ERR_NETWORK' ? mockResolve(mockLink) : Promise.reject(err)));
    },

    getMyStudents: (params) =>
        withMockFallback(
            () => apiClient.get(API.PARENT_STUDENTS, { params }).then((res) => res.data?.data ?? res.data),
            () => mockParentStudents
        ),

    getStudentById: (studentId) =>
        withMockFallback(
            () => apiClient.get(API.PARENT_STUDENT(studentId)).then((res) => res.data?.data ?? res.data),
            () => mockParentStudentDetail(studentId)
        ),

    unlinkStudent: (studentId) =>
        useMock()
            ? mockResolve({})
            : apiClient
                  .delete(API.PARENT_STUDENT_UNLINK(studentId))
                  .then((res) => res.data?.data ?? res.data)
                  .catch((err) => (useMock() || err?.response?.status === 404 || err?.code === 'ERR_NETWORK' ? mockResolve({}) : Promise.reject(err))),

  getStudentScores: (studentId, params) =>
    withMockFallback(
      () =>
        apiClient
          .get(API.PARENT_STUDENT_SCORES(studentId), { params })
          .then((res) => res.data?.data ?? res.data),
      () => mockParentStudentScores(studentId)
    ),

  getStudentScoreDetail: (studentId, resultId) =>
    withMockFallback(
      () =>
        apiClient
          .get(API.PARENT_STUDENT_SCORE_DETAIL(studentId, resultId))
          .then((res) => res.data?.data ?? res.data),
      () => mockParentStudentScoreDetail(studentId, resultId)
    ),
};
