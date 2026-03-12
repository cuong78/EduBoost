package com.fptu.eduBoostBackend.dto.request;

import lombok.Data;

@Data
public class InitPaymentRequest {
    /** Plan ID to subscribe to */
    private Long planId;
}
