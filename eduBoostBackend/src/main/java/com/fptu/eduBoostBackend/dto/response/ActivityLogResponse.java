package com.fptu.eduBoostBackend.dto.response;

import java.time.LocalDateTime;
import lombok.*;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLogResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String action;
    private LocalDateTime createdAt;
}