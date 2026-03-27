package com.fptu.eduBoostBackend.dto.response;

import com.fptu.eduBoostBackend.entities.enums.FeedbackCategory;
import com.fptu.eduBoostBackend.entities.enums.FeedbackStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackResponse {
    private Long id;
    private FeedbackCategory category;
    private String title;
    private String content;
    private Integer rating;
    private FeedbackStatus status;
    private String adminResponse;
    private LocalDateTime respondedAt;
    private LocalDateTime createdAt;

    // Teacher info (for admin view)
    private String teacherName;
    private String teacherEmail;
}
