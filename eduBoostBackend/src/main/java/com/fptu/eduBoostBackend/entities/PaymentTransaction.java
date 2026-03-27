package com.fptu.eduBoostBackend.entities;

import com.fptu.eduBoostBackend.entities.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Internal order ID (unique, used as VietQR transfer note) */
    @Column(name = "order_id", nullable = false, unique = true, length = 50)
    private String orderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private SubscriptionPlan plan;

    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal amount;

    /** VND always */
    @Column(length = 10)
    @Builder.Default
    private String currency = "VND";

    /** Bank account to receive payment (from system config) */
    @Column(name = "bank_code", length = 20)
    private String bankCode;       // e.g. "VCB", "BIDV"

    @Column(name = "account_no", length = 30)
    private String accountNo;

    @Column(name = "account_name", length = 100)
    private String accountName;

    /** VietQR deep-link / QR content */
    @Column(name = "qr_content", length = 1000)
    private String qrContent;

    /** QR image URL if using api.vietqr.io to generate image */
    @Column(name = "qr_image_url", length = 500)
    private String qrImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    /** Admin userId who confirmed the payment */
    @Column(name = "confirmed_by_user_id")
    private Long confirmedByUserId;

    @Column(name = "note", length = 500)
    private String note;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    /** Points to the resulting subscription once activated */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id")
    private TeacherSubscription subscription;
}
