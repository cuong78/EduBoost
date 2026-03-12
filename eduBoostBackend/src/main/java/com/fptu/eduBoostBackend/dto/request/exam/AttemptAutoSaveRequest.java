package com.fptu.eduBoostBackend.dto.request.exam;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AttemptAutoSaveRequest {

    @NotBlank
    private String activeTabToken;

    @NotNull
    private Integer currentQuestionIndex;

    /**
     * Client-side version used to detect concurrent updates (optional, mapped to lockVersion).
     */
    private Long clientVersion;

    @NotNull
    private List<AttemptAnswerPayload> answers;

    @Getter
    @Setter
    public static class AttemptAnswerPayload {
        @NotNull
        private Long examQuestionId;
        private String selectedOption;
        private String textAnswer;
        private Boolean flagged;
    }
}

