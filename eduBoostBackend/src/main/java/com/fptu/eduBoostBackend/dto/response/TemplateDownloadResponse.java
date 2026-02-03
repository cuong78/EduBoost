package com.fptu.eduBoostBackend.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TemplateDownloadResponse {
    private String fileName;
    private String contentType;
    private byte[] content;
    private long size;
}