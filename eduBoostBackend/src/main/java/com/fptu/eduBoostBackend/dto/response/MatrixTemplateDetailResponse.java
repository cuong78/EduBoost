package com.fptu.eduBoostBackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatrixTemplateDetailResponse {
    private Long id;
    private Long cognitiveLevelId;
    private String cognitiveLevelName;
    private Integer numberOfQuestions;
    private BigDecimal pointsPerQuestion;
    private BigDecimal totalPoints;
}
