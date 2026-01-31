package com.fptu.eduBoostBackend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SendInvitationRequest {

    @NotBlank
    private String invitationId;

    @NotBlank
    @Email
    private String parentEmail;
}
