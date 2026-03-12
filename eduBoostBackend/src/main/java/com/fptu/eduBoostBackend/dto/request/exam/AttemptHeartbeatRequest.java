package com.fptu.eduBoostBackend.dto.request.exam;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AttemptHeartbeatRequest {

    @NotBlank
    private String activeTabToken;
}

