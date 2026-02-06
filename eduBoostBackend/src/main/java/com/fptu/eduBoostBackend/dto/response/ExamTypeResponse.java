package com.fptu.eduBoostBackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamTypeResponse {
    private Long id;
    private String typeCode;
    private String typeName;
    private Boolean requiresMatrix;
    private String description;
    private Integer displayOrder;
}
