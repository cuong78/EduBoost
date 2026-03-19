package com.fptu.eduBoostBackend.dto.request;

import com.fptu.eduBoostBackend.entities.enums.FeedbackStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RespondFeedbackRequest {
    private String adminResponse;

    @NotNull(message = "Status is required")
    private FeedbackStatus status;
}
