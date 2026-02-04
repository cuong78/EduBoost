import { apiClient } from './api';
import { API } from '../constants/api';
import { useMock } from '../mocks/invitationMockData';

const mockResolve = (data) => Promise.resolve(data);
const mockReject = (err) => Promise.reject(err);
const useMockOrFail = (err) => useMock() || err?.response?.status === 404 || err?.code === 'ERR_NETWORK';

const withMockFallback = (apiCall, getMock) =>
  apiCall().catch((err) => {
    if (useMockOrFail(err)) return mockResolve(getMock());
    return mockReject(err);
  });

// Minimal mocks to keep UI usable when backend isn't ready / local dev without seeding
const mockSubjects = [
  { id: 1, subjectCode: 'TOAN', description: 'Toán' },
  { id: 2, subjectCode: 'LY', description: 'Vật lý' },
];

const mockChapters = [
  { id: 1, subjectId: 1, gradeLevel: 10, chapterNumber: 1, chapterName: 'Chương 1', description: '' },
  { id: 2, subjectId: 1, gradeLevel: 10, chapterNumber: 2, chapterName: 'Chương 2', description: '' },
];

const mockLessons = [
  { id: 1, chapterId: 1, lessonNumber: 1, lessonName: 'Bài 1', description: '' },
  { id: 2, chapterId: 1, lessonNumber: 2, lessonName: 'Bài 2', description: '' },
];

const mockResources = [
  { id: 1, lessonId: 1, resourceName: 'Tài liệu', resourceType: 'PDF', fileUrl: null, downloadUrl: null, uploadedByName: 'Teacher' },
];

export const knowledgeService = {
  // Subjects
  getSubjects: () =>
    withMockFallback(
      () => apiClient.get(API.SUBJECTS).then((res) => res.data?.data ?? res.data),
      () => mockSubjects
    ),

  createSubject: (body) =>
    useMock()
      ? mockResolve({ id: Date.now(), ...body })
      : apiClient.post(API.SUBJECTS, body).then((res) => res.data?.data ?? res.data),

  updateSubject: (id, body) =>
    useMock()
      ? mockResolve({ id, ...body })
      : apiClient.put(API.SUBJECT(id), body).then((res) => res.data?.data ?? res.data),

  deleteSubject: (id) => (useMock() ? mockResolve({}) : apiClient.delete(API.SUBJECT(id)).then((res) => res.data)),

  // Chapters
  getChaptersBySubject: (subjectId, gradeLevel) =>
    withMockFallback(
      () => apiClient.get(API.SUBJECT_CHAPTERS(subjectId), { params: gradeLevel ? { gradeLevel } : {} }).then((res) => res.data?.data ?? res.data),
      () => mockChapters.filter((c) => String(c.subjectId) === String(subjectId) && (!gradeLevel || Number(c.gradeLevel) === Number(gradeLevel)))
    ),

  createChapter: (subjectId, body) =>
    useMock()
      ? mockResolve({ id: Date.now(), subjectId, ...body })
      : apiClient.post(API.SUBJECT_CHAPTERS(subjectId), body).then((res) => res.data?.data ?? res.data),

  updateChapter: (id, body) =>
    useMock() ? mockResolve({ id, ...body }) : apiClient.put(API.CHAPTER(id), body).then((res) => res.data?.data ?? res.data),

  deleteChapter: (id) => (useMock() ? mockResolve({}) : apiClient.delete(API.CHAPTER(id)).then((res) => res.data)),

  // Lessons
  getLessonsByChapter: (chapterId) =>
    withMockFallback(
      () => apiClient.get(API.CHAPTER_LESSONS(chapterId)).then((res) => res.data?.data ?? res.data),
      () => mockLessons.filter((l) => String(l.chapterId) === String(chapterId))
    ),

  createLesson: (body) =>
    useMock()
      ? mockResolve({ id: Date.now(), ...body })
      : apiClient.post(API.LESSON_CREATE, body).then((res) => res.data?.data ?? res.data),

  updateLesson: (id, body) =>
    useMock() ? mockResolve({ id, ...body }) : apiClient.put(API.LESSON(id), body).then((res) => res.data?.data ?? res.data),

  deleteLesson: (id) => (useMock() ? mockResolve({}) : apiClient.delete(API.LESSON(id)).then((res) => res.data)),

  // Resources
  getResourcesByLesson: (lessonId) =>
    withMockFallback(
      () => apiClient.get(API.LESSON_RESOURCES(lessonId)).then((res) => res.data?.data ?? res.data),
      () => mockResources.filter((r) => String(r.lessonId) === String(lessonId))
    ),

  createResource: (body) =>
    useMock()
      ? mockResolve({ id: Date.now(), ...body })
      : apiClient.post(API.RESOURCE_CREATE, body).then((res) => res.data?.data ?? res.data),

  uploadResourceFile: ({ lessonId, resourceType, resourceName, file }) => {
    const formData = new FormData();
    formData.append('lessonId', String(lessonId));
    formData.append('resourceType', String(resourceType));
    if (resourceName) formData.append('resourceName', resourceName);
    formData.append('file', file);

    return useMock()
      ? mockResolve({ id: Date.now(), lessonId, resourceType, resourceName, fileUrl: null, downloadUrl: null })
      : apiClient
          .post(API.RESOURCE_FILE_UPLOAD, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
          .then((res) => res.data?.data ?? res.data);
  },

  deleteResource: (id) => (useMock() ? mockResolve({}) : apiClient.delete(API.RESOURCE(id)).then((res) => res.data)),
};

