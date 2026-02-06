package com.fptu.eduBoostBackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AutoSelectQuestionsResponse {
    private int totalQuestionsAdded;
    private int fromExistingBank;
    private int aiGenerated;
    private List<ExamQuestionResponse> questions;
}
