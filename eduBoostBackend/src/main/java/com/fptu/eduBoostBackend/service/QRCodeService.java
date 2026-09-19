package com.fptu.eduBoostBackend.service;

public interface QRCodeService {
    byte[] generateQRCode(String content, int width, int height) throws Exception;
    byte[] generateClassQRCode(String classId) throws Exception;
}
