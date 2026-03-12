package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.dto.request.InitPaymentRequest;
import com.fptu.eduBoostBackend.dto.response.PaymentTransactionResponse;
import com.fptu.eduBoostBackend.dto.response.SubscriptionPlanResponse;
import com.fptu.eduBoostBackend.dto.response.TeacherSubscriptionResponse;

import java.util.List;

public interface SubscriptionService {

    /** Public — get all active plans */
    List<SubscriptionPlanResponse> getActivePlans();

    /** Teacher — get current active subscription */
    TeacherSubscriptionResponse getMySubscription();

    /** Teacher — initiate payment, returns VietQR info */
    PaymentTransactionResponse initiatePayment(InitPaymentRequest request);

    /** Teacher — transaction history */
    List<PaymentTransactionResponse> getMyTransactions();

    /** Admin — all pending transactions */
    List<PaymentTransactionResponse> getPendingTransactions();

    /** Admin — confirm a payment and activate subscription */
    TeacherSubscriptionResponse confirmPayment(Long transactionId, String note);

    /** Admin — cancel a pending transaction */
    PaymentTransactionResponse cancelTransaction(Long transactionId, String reason);

    /** Scheduled — expire subscriptions past endDate */
    void expireSubscriptions();
}
