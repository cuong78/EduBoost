package com.fptu.eduBoostBackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateStudentResponse {
    private StudentResponse student;
    private InvitationResponse invitation;
    private CredentialsResponse credentials;
    /** true when email already existed — teacher should confirm adding existing student */
    private Boolean existingStudent;
    /** userId of existing student (for addExistingStudentToClass call) */
    private Long existingUserId;
}
