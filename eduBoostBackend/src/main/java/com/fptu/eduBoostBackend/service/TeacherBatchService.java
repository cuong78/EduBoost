package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.dto.request.BatchImportStudentRequest;
import com.fptu.eduBoostBackend.dto.response.BatchImportStudentResponse;
import com.fptu.eduBoostBackend.dto.response.TemplateDownloadResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface TeacherBatchService {


    TemplateDownloadResponse downloadTemplate() throws IOException;


    BatchImportStudentResponse importStudents(MultipartFile file, BatchImportStudentRequest request) throws IOException;


    void validateImportFile(MultipartFile file);
}