package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.constant.ResponseObject;
import com.fptu.eduBoostBackend.dto.response.ActivityLogListResponse;
import com.fptu.eduBoostBackend.dto.response.ActivityLogResponse;
import com.fptu.eduBoostBackend.service.ActivityLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/activity-logs")
@RequiredArgsConstructor
@Slf4j
@SecurityRequirement(name = "api")
@Tag(name = "Activity Log Management", description = "APIs for viewing activity logs")
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get activity logs",
            description = "Returns paginated activity logs and supports keyword search")
    public ResponseEntity<ResponseObject> getActivityLogs(
            @Parameter(description = "Search keyword for actor name or action")
            @RequestParam(required = false) String keyword,

            @Parameter(description = "Page number (default 1)")
            @RequestParam(defaultValue = "1") int page,

            @Parameter(description = "Page size (default 10)")
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(
                Math.max(page - 1, 0), // PageRequest 0-based
                Math.max(size, 1),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        ActivityLogListResponse logs = activityLogService.getActivityLogs(keyword, pageable);

        return ResponseEntity.ok(
                new ResponseObject(
                        200,
                        "Lấy danh sách hoạt động thành công",
                        logs
                )
        );
    }
}
