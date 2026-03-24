package com.fptu.eduBoostBackend.dto.request.exam;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AttemptSubmitRequest {

    @NotBlank
    private String activeTabToken;

    /**
     * Final answers snapshot sent by the client.
     * Used to persist answers before grading (avoid race with autosave / tab takeover).
     */
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

