package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.dto.DocumentExtractionResult;
import com.fptu.eduBoostBackend.service.DocumentProcessingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.sax.BodyContentHandler;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentProcessingServiceImpl implements DocumentProcessingService {

    @Override
    public DocumentExtractionResult extractContent(MultipartFile file) throws IOException {
        log.info("Extracting content from file: {}", file.getOriginalFilename());
        return extractContent(file.getInputStream(), file.getContentType());
    }

    @Override
    public DocumentExtractionResult extractContent(InputStream inputStream, String mimeType) throws IOException {
        try {
            // Use Apache Tika for robust extraction
            BodyContentHandler handler = new BodyContentHandler(-1); // No limit
            Metadata metadata = new Metadata();
            if (mimeType != null) {
                metadata.set(Metadata.CONTENT_TYPE, mimeType);
            }
            ParseContext context = new ParseContext();
            AutoDetectParser parser = new AutoDetectParser();

            parser.parse(inputStream, handler, metadata, context);

            String extractedText = handler.toString();
            Map<String, String> metadataMap = new HashMap<>();
            
            for (String name : metadata.names()) {
                metadataMap.put(name, metadata.get(name));
            }

            // Calculate statistics
            int wordCount = extractedText.trim().isEmpty() ? 0 : extractedText.split("\\s+").length;
            int charCount = extractedText.length();
            int estimatedTokens = estimateTokenCount(extractedText);
            int pageCount = getPageCount(metadataMap);
            String language = detectLanguage(extractedText);

            log.info("Content extracted successfully. Words: {}, Pages: {}, Tokens: {}", 
                    wordCount, pageCount, estimatedTokens);

            return DocumentExtractionResult.builder()
                    .content(extractedText)
                    .metadata(metadataMap)
                    .wordCount(wordCount)
                    .charCount(charCount)
                    .estimatedTokens(estimatedTokens)
                    .pageCount(pageCount)
                    .language(language)
                    .build();

        } catch (Exception e) {
            log.error("Failed to extract content from document", e);
            throw new IOException("Failed to extract content", e);
        }
    }

    private int estimateTokenCount(String text) {
        // Simple estimation: ~3 characters per token (average for English/Vietnamese)
        return text.length() / 3;
    }

    private int getPageCount(Map<String, String> metadata) {
        String pages = metadata.get("xmpTPg:NPages");
        if (pages == null) {
            pages = metadata.get("Page-Count");
        }
        if (pages == null) {
            pages = metadata.get("meta:page-count");
        }
        try {
            return pages != null ? Integer.parseInt(pages) : 0;
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private String detectLanguage(String text) {
        // Simple Vietnamese detection
        if (text.matches(".*[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ].*")) {
            return "vi";
        }
        return "en";
    }
}
