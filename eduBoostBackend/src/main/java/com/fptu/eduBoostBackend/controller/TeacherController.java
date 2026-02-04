package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.constant.ResponseObject;
import com.fptu.eduBoostBackend.dto.request.*;
import com.fptu.eduBoostBackend.dto.response.*;

import com.fptu.eduBoostBackend.exception.exceptions.BadRequestException;
import com.fptu.eduBoostBackend.exception.exceptions.ForbiddenException;
import com.fptu.eduBoostBackend.service.TeacherBatchService;
import com.fptu.eduBoostBackend.service.TeacherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.util.List;
@Slf4j
@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
@SecurityRequirement(name = "api")
@Tag(name = "Teacher", description = "Teacher management APIs - Quản lý lớp học và học sinh")
public class TeacherController {


    private final TeacherBatchService teacherBatchService;
    private final TeacherService teacherService;

    @GetMapping("/classes")
    @Operation(summary = "Get my classes", description = "Lấy danh sách tất cả lớp học của giáo viên hiện tại")
    public ResponseEntity<ResponseObject> getMyClasses() {
        List<ClassResponse> classes = teacherService.getMyClasses();
        return ResponseEntity.ok()
                .body(new ResponseObject(
                        HttpStatus.OK.value(),
                        "Lấy danh sách lớp học thành công",
                        classes));
    }

    @PostMapping("/classes")
    @Operation(summary = "Create new class", description = "Tạo lớp học mới")
    public ResponseEntity<ResponseObject> createClass(@Valid @RequestBody CreateClassRequest request) {
        ClassResponse classResponse = teacherService.createClass(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ResponseObject(
                        HttpStatus.CREATED.value(),
                        "Tạo lớp học thành công",
                        classResponse));
    }

    @GetMapping("/classes/{classId}/students")
    @Operation(summary = "Get students by class", description = "Lấy danh sách học sinh trong lớp")
    public ResponseEntity<ResponseObject> getStudentsByClass(@PathVariable String classId) {
        List<StudentResponse> students = teacherService.getStudentsByClass(classId);
        return ResponseEntity.ok()
                .body(new ResponseObject(
                        HttpStatus.OK.value(),
                        "Lấy danh sách học sinh thành công",
                        students));
    }

    @PostMapping("/students")
    @Operation(summary = "Create new student", description = "Tạo học sinh mới với tự động tạo mã mời (nếu cần)")
    public ResponseEntity<ResponseObject> createStudent(@Valid @RequestBody CreateStudentRequest request) {
        CreateStudentResponse response = teacherService.createStudent(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ResponseObject(
                        HttpStatus.CREATED.value(),
                        "Học sinh đã được tạo thành công",
                        response));
    }

    @GetMapping("/students/{studentId}")
    @Operation(summary = "Get student details", description = "Lấy chi tiết thông tin học sinh")
    public ResponseEntity<ResponseObject> getStudentById(@PathVariable String studentId) {
        StudentResponse student = teacherService.getStudentById(studentId);
        return ResponseEntity.ok()
                .body(new ResponseObject(
                        HttpStatus.OK.value(),
                        "Lấy thông tin học sinh thành công",
                        student));
    }

    @PutMapping("/students/{studentId}")
    @Operation(summary = "Update student", description = "Cập nhật thông tin học sinh")
    public ResponseEntity<ResponseObject> updateStudent(
            @PathVariable String studentId,
            @Valid @RequestBody UpdateStudentRequest request) {
        StudentResponse student = teacherService.updateStudent(studentId, request);
        return ResponseEntity.ok()
                .body(new ResponseObject(
                        HttpStatus.OK.value(),
                        "Cập nhật thông tin học sinh thành công",
                        student));
    }

    @DeleteMapping("/students/{studentId}")
    @Operation(summary = "Delete student", description = "Xóa học sinh")
    public ResponseEntity<ResponseObject> deleteStudent(@PathVariable String studentId) {
        teacherService.deleteStudent(studentId);
        return ResponseEntity.ok()
                .body(new ResponseObject(
                        HttpStatus.OK.value(),
                        "Xóa học sinh thành công",
                        null));
    }


    @PostMapping("/invitations/create-and-send")
    @Operation(
            summary = "Create and send invitation",
            description = "Tạo mã mời mới cho học sinh và gửi email cho phụ huynh ngay lập tức"
    )
    public ResponseEntity<ResponseObject> createAndSendInvitation(
            @Valid @RequestBody CreateAndSendInvitationRequest request) {

        InvitationResponse invitation = teacherService.createAndSendInvitation(
                request.getStudentId(),
                request.getParentEmail()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ResponseObject(
                        HttpStatus.CREATED.value(),
                        "Tạo và gửi mã mời thành công",
                        invitation));
    }

    @GetMapping("/students/{studentId}/invitations")
    @Operation(
            summary = "Get student invitations",
            description = "Lấy danh sách tất cả mã mời của học sinh với phân trang"
    )
    public ResponseEntity<ResponseObject> getStudentInvitations(
            @PathVariable String studentId,
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size) {

        StudentInvitationsResponse response = teacherService.getStudentInvitations(studentId, page, size);

        return ResponseEntity.ok()
                .body(new ResponseObject(
                        HttpStatus.OK.value(),
                        "Lấy danh sách mã mời thành công",
                        response));
    }
    @GetMapping("/students/template/download")
    @Operation(
            summary = "Download student import template",
            description = "Tải xuống template Excel để nhập danh sách học sinh"
    )
    public ResponseEntity<byte[]> downloadStudentImportTemplate() {
        try {
            TemplateDownloadResponse response = teacherBatchService.downloadTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(response.getContentType()));
            headers.setContentDisposition(ContentDisposition.attachment()
                    .filename(response.getFileName())
                    .build());
            headers.setContentLength(response.getSize());

            return new ResponseEntity<>(response.getContent(), headers, HttpStatus.OK);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate template", e);
        }
    }

    @PostMapping(value = "/students/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Import students from Excel",
            description = "Nhập danh sách học sinh từ file Excel. File phải theo đúng template."
    )
    public ResponseEntity<ResponseObject> importStudents(
            @RequestParam("file") MultipartFile file,
            @RequestParam("classId") @NotBlank String classId) {

        try {
            // Validate file BEFORE calling service (outside transaction)
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ResponseObject(
                                HttpStatus.BAD_REQUEST.value(),
                                "File không được để trống",
                                null));
            }

            String fileName = file.getOriginalFilename();
            if (fileName == null || !fileName.toLowerCase().endsWith(".xlsx")) {
                return ResponseEntity.badRequest()
                        .body(new ResponseObject(
                                HttpStatus.BAD_REQUEST.value(),
                                "Chỉ hỗ trợ file .xlsx",
                                null));
            }

            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                        .body(new ResponseObject(
                                HttpStatus.BAD_REQUEST.value(),
                                "Kích thước file phải nhỏ hơn 10MB",
                                null));
            }

            // Create request object
            BatchImportStudentRequest request = BatchImportStudentRequest.builder()
                    .classId(classId)
                    .build();

            // Call service
            BatchImportStudentResponse response = teacherBatchService.importStudents(file, request);

            String message = String.format("Nhập danh sách học sinh thành công: %d thành công, %d thất bại",
                    response.getSuccessfulImports(), response.getFailedImports());

            return ResponseEntity.ok()
                    .body(new ResponseObject(
                            HttpStatus.OK.value(),
                            message,
                            response));
        } catch (BadRequestException e) {
            // Handle validation errors
            return ResponseEntity.badRequest()
                    .body(new ResponseObject(
                            HttpStatus.BAD_REQUEST.value(),
                            e.getMessage(),
                            null));
        } catch (ForbiddenException e) {
            // Handle access denied
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ResponseObject(
                            HttpStatus.FORBIDDEN.value(),
                            e.getMessage(),
                            null));
        } catch (Exception e) {
                log.error("Lỗi khi nhập danh sách học sinh: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Lỗi hệ thống: " + e.getMessage(),
                            null));
        }
    }
}