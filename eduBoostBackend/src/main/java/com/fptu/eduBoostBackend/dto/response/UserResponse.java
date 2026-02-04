package com.fptu.eduBoostBackend.dto.response;

import lombok.*;

import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserResponse {
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private Set<String> roles;
    private String token;
    private String refreshToken;
    private String tokenType;
}
