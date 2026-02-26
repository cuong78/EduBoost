package com.fptu.eduBoostBackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GradeLevelDetailResponse {
    private Long gradeLevelId;
    private String gradeName;
    private String description;
    private Integer classCount;
    private Integer studentCount;
}
