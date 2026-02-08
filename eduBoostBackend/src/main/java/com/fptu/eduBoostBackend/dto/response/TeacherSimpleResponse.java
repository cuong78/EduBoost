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
public class TeacherSimpleResponse {
    private String teacherId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String currentClassId;
    private String currentClassName;
}
