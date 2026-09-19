package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.dto.request.EnrollmentRequest;
import com.fptu.eduBoostBackend.dto.response.EnrollmentResponse;
import com.fptu.eduBoostBackend.service.EnrollmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fptu.eduBoostBackend.dto.request.GoogleEnrollmentRequest;

@RestController
@RequestMapping("/api/enroll")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping
    public ResponseEntity<EnrollmentResponse> enroll(@Valid @RequestBody EnrollmentRequest request) {
        EnrollmentResponse response = enrollmentService.enrollStudent(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/google")
    public ResponseEntity<EnrollmentResponse> enrollWithGoogle(@Valid @RequestBody GoogleEnrollmentRequest request) {
        EnrollmentResponse response = enrollmentService.enrollWithGoogle(request);
        return ResponseEntity.ok(response);
    }
}
