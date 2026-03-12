package com.fptu.eduBoostBackend.security;

import java.util.List;

public class SecurityConstants {

    public static final List<String> PUBLIC_ENDPOINTS = List.of(
            "/swagger-ui/**",
            "/v3/api-docs/**",
            "/swagger-resources/**",
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/refresh-token",
            "/api/auth/forgot-password",
            "/api/auth/reset-password",
            "/api/auth/verify",
            "/api/auth/google-login",
            "/api/auth/auto-login",
            "/api/parent/validate-invitation",
            "/api/subscriptions/plans",   // Public pricing page — no auth needed
            "/api/token_generate",        // VietQR callback: get token
            "/bank/api/transaction-sync", // VietQR callback: payment notification
            "/api/admin/**"  // TODO: Remove after fixing role check
    );

    public static final String AUTHORIZATION_HEADER = "Authorization";
    public static final String BEARER_PREFIX = "Bearer ";
    public static final int BEARER_PREFIX_LENGTH = 7;

    private SecurityConstants() {
    }
}