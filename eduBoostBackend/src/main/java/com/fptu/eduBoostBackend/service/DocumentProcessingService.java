package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.dto.DocumentExtractionResult;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

public interface DocumentProcessingService {
    /**
     * Extract text and metadata from document using Apache Tika
     */
    DocumentExtractionResult extractContent(MultipartFile file) throws IOException;
    
    /**
     * Extract text from InputStream
     */
    DocumentExtractionResult extractContent(InputStream inputStream, String mimeType) throws IOException;
}
