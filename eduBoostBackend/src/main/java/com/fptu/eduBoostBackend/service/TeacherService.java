package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.dto.request.CreateClassRequest;
import com.fptu.eduBoostBackend.dto.request.CreateStudentRequest;
import com.fptu.eduBoostBackend.dto.request.UpdateStudentRequest;
import com.fptu.eduBoostBackend.dto.response.ClassResponse;
import com.fptu.eduBoostBackend.dto.response.CreateStudentResponse;
import com.fptu.eduBoostBackend.dto.response.StudentResponse;

import java.util.List;

public interface TeacherService {
    List<ClassResponse> getMyClasses();
    ClassResponse createClass(CreateClassRequest request);
    List<StudentResponse> getStudentsByClass(String classId);
    CreateStudentResponse createStudent(CreateStudentRequest request);
    StudentResponse getStudentById(String studentId);
    StudentResponse updateStudent(String studentId, UpdateStudentRequest request);
    void deleteStudent(String studentId);
    void sendInvitation(String invitationId, String parentEmail);
}
