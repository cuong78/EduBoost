package com.fptu.eduBoostBackend.service;

public interface EmailService {
    void sendEmail(String to, String subject, String text);
    void sendHtmlEmail(String to, String subject, String htmlContent);

}