package com.fptu.eduBoostBackend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentTransactionResponse {
    private Long id;
    private String orderId;
    private String teacherName;
    private String teacherEmail;
    private String planCode;
    private String planName;
    private BigDecimal amount;
    private String currency;
    private String bankCode;
    private String accountNo;
    private String accountName;
    private String qrContent;
    private String qrImageUrl;
    private String paymentStatus;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    /** ID of activated subscription */
    private Long subscriptionId;
}
