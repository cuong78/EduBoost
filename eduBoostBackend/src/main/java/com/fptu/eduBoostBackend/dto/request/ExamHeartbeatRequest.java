package com.fptu.eduBoostBackend.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExamHeartbeatRequest {
    private boolean tabActive;
    private boolean fullscreen;
    private Integer idleSeconds;
    private Integer copyPasteCount;
    private boolean networkOnline;
    private Integer timeLeftSeconds;
}
