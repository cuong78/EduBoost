package com.fptu.eduBoostBackend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ShuffleExamRequest {
    private Integer numberOfVariants = 1;
    private Boolean shuffleQuestions = true;
    private Boolean shuffleAnswers = true;
}
