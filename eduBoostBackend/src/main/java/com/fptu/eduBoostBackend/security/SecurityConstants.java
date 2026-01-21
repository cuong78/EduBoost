package com.fptu.eduBoostBackend.security;

import java.util.List;

public class SecurityConstants {

    public static final List<String> PUBLIC_ENDPOINTS = List.of(
            "/swagger-ui/**",
            "/v3/api-docs/**",
            "/swagger-resources/**",
            "/api/auth/**"


    );

    public static final String AUTHORIZATION_HEADER = "Authorization";
    public static final String BEARER_PREFIX = "Bearer ";
    public static final int BEARER_PREFIX_LENGTH = 7;

    private SecurityConstants() {
        // Private constructor to prevent instantiation
    }
}