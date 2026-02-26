package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.dto.response.ClassResponse;
import com.fptu.eduBoostBackend.dto.response.TeacherSimpleResponse;
import com.fptu.eduBoostBackend.dto.request.CreateClassRequest;
import com.fptu.eduBoostBackend.dto.request.UpdateClassRequest;

import java.util.List;

public interface ClassService {
    List<ClassResponse> getAllClasses();
    ClassResponse getClassById(String classId);
    List<ClassResponse> getClassesByGradeId(Long gradeLevelId);
    ClassResponse createClass(CreateClassRequest request);
    ClassResponse updateClass(String classId, UpdateClassRequest request);
    void deleteClass(String classId);
    List<TeacherSimpleResponse> getAllAvailableTeachers();
}
