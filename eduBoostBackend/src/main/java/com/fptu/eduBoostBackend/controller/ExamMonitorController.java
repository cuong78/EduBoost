package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.dto.request.ExamHeartbeatRequest;
import com.fptu.eduBoostBackend.entities.ExamViolationLog;
import com.fptu.eduBoostBackend.repositories.ExamViolationLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * WebSocket controller for real-time exam anti-cheat monitoring.
 *
 * Student sends heartbeat to: /app/exam/{assignmentId}/heartbeat
 * Teacher receives events on: /topic/exam/{assignmentId}
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class ExamMonitorController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ExamViolationLogRepository violationLogRepository;

    /**
     * Receive heartbeat from student every 5-10 seconds.
     * Broadcast violations to teacher's monitoring channel.
     */
    @MessageMapping("/exam/{assignmentId}/heartbeat")
    public void handleHeartbeat(
            @DestinationVariable Long assignmentId,
            @Header(value = "studentId", required = false) String studentId,
            @Header(value = "studentName", required = false) String studentName,
            @Payload ExamHeartbeatRequest heartbeat) {

        String now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"));

        // Build event payload for teacher
        Map<String, Object> event = new HashMap<>();
        event.put("type", "HEARTBEAT");
        event.put("studentId", studentId);
        event.put("studentName", studentName != null ? studentName : "Student");
        event.put("timestamp", now);
        event.put("tabActive", heartbeat.isTabActive());
        event.put("fullscreen", heartbeat.isFullscreen());
        event.put("idleSeconds", heartbeat.getIdleSeconds());
        event.put("copyPasteCount", heartbeat.getCopyPasteCount());
        event.put("networkOnline", heartbeat.isNetworkOnline());
        event.put("timeLeftSeconds", heartbeat.getTimeLeftSeconds());

        // Detect violations and enrich event
        boolean hasViolation = false;
        StringBuilder violations = new StringBuilder();

        if (!heartbeat.isTabActive()) {
            hasViolation = true;
            violations.append("TAB_SWITCH ");
        }
        if (!heartbeat.isFullscreen()) {
            hasViolation = true;
            violations.append("FULLSCREEN_EXIT ");
        }
        if (heartbeat.getIdleSeconds() != null && heartbeat.getIdleSeconds() > 120) {
            hasViolation = true;
            violations.append("LONG_IDLE ");
        }
        if (heartbeat.getCopyPasteCount() != null && heartbeat.getCopyPasteCount() > 0) {
            hasViolation = true;
            violations.append("COPY_PASTE ");
        }

        event.put("hasViolation", hasViolation);
        event.put("violations", violations.toString().trim());

        if (hasViolation) {
            event.put("type", "VIOLATION");
            log.warn("VIOLATION detected — Assignment: {}, Student: {}, Violations: {}",
                    assignmentId, studentName, violations);

            // Save violation to database
            saveViolationLog(assignmentId, studentId, studentName, violations.toString().trim());
        }

        // Broadcast to teacher monitoring channel
        String destination = "/topic/exam/" + assignmentId;
        messagingTemplate.convertAndSend(destination, (Object) event);
    }

    /**
     * Explicit violation alert (tab switch / fullscreen exit detected on client).
     */
    @MessageMapping("/exam/{assignmentId}/alert")
    public void handleAlert(
            @DestinationVariable Long assignmentId,
            @Header(value = "studentId", required = false) String studentId,
            @Header(value = "studentName", required = false) String studentName,
            @Payload Map<String, Object> alert) {

        String now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"));

        Map<String, Object> event = new HashMap<>(alert);
        event.put("type", "ALERT");
        event.put("studentId", studentId);
        event.put("studentName", studentName != null ? studentName : "Student");
        event.put("timestamp", now);
        event.put("hasViolation", true);

        String reason = alert.get("reason") != null ? alert.get("reason").toString() : "UNKNOWN";
        log.warn("ALERT from student {} in assignment {}: {}", studentName, assignmentId, reason);

        // Save alert to database
        saveViolationLog(assignmentId, studentId, studentName, reason);

        String dest = "/topic/exam/" + assignmentId;
        messagingTemplate.convertAndSend(dest, (Object) event);
    }

    /** Persist violation to database for historical review */
    private void saveViolationLog(Long assignmentId, String studentId, String studentName, String violationType) {
        try {
            violationLogRepository.save(ExamViolationLog.builder()
                    .assignmentId(assignmentId)
                    .studentId(studentId)
                    .studentName(studentName)
                    .violationType(violationType)
                    .timestamp(LocalDateTime.now())
                    .build());
        } catch (Exception e) {
            log.warn("Failed to save violation log: {}", e.getMessage());
        }
    }
}
