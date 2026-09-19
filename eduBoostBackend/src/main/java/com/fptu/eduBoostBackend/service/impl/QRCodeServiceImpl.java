package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.service.QRCodeService;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class QRCodeServiceImpl implements QRCodeService {

    @Value("${app.enrollment.frontend-url}")
    private String enrollmentFrontendUrl;

    @Override
    public byte[] generateQRCode(String text, int width, int height) throws Exception {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);

        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
        return pngOutputStream.toByteArray();
    }

    @Override
    public byte[] generateClassQRCode(String classId) throws Exception {
        String enrollmentUrl = enrollmentFrontendUrl + "?classId=" + classId;
        return generateQRCode(enrollmentUrl, 300, 300);
    }
}
