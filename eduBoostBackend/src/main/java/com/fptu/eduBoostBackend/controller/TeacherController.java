package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.constant.ResponseObject;
import com.fptu.eduBoostBackend.dto.request.CreateClassRequest;
import com.fptu.eduBoostBackend.dto.request.CreateStudentRequest;
import com.fptu.eduBoostBackend.dto.request.SendInvitationRequest;
import com.fptu.eduBoostBackend.dto.request.UpdateStudentRequest;
import com.fptu.eduBoostBackend.dto.response.ClassResponse;
import com.fptu.eduBoostBackend.dto.response.CreateStudentResponse;
import com.fptu.eduBoostBackend.dto.response.StudentResponse;
import com.fptu.eduBoostBackend.service.TeacherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
@SecurityRequirement(name = "api")
@Tag(name = "Teacher", description = "Teacher management APIs - Quản lý lớp học và học sinh")
public class TeacherController {

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
    @PostMapping("/invitations/send")
    @Operation(
            summary = "Send invitation email",
            description = "Send student invitation code to parent email"
    )
    public ResponseEntity<ResponseObject> sendInvitation(
            @Valid @RequestBody SendInvitationRequest request) {

        teacherService.sendInvitation(
                request.getInvitationId(),
                request.getParentEmail()
        );

        return ResponseEntity.ok(
                new ResponseObject(
                        HttpStatus.OK.value(),
                        "Invite code sent successfully",
                        null
                )
        );
    }

}
