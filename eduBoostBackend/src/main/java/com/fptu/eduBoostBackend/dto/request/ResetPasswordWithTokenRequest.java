package com.fptu.eduBoostBackend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordWithTokenRequest {
    private String token;
    private String newPassword;
}