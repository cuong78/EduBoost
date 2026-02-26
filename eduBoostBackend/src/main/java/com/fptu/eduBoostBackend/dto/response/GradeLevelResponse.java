package com.fptu.eduBoostBackend.dto.response;

import com.fptu.eduBoostBackend.entities.SchoolClass;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GradeLevelResponse {
    private Long gradeLevelId;
    private String gradeName;
    private List<SchoolClass> classes;
}
