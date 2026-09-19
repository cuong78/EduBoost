package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.dto.request.EnrollmentRequest;
import com.fptu.eduBoostBackend.dto.request.GoogleEnrollmentRequest;
import com.fptu.eduBoostBackend.dto.response.EnrollmentResponse;

public interface EnrollmentService {
    EnrollmentResponse enrollStudent(EnrollmentRequest request);
    EnrollmentResponse enrollWithGoogle(GoogleEnrollmentRequest request);
}
