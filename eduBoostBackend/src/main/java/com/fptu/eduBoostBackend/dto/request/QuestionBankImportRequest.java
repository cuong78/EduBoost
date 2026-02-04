package com.fptu.eduBoostBackend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuestionBankImportRequest {
    
    @NotEmpty(message = "Questions list cannot be empty")
    @Valid
    private List<QuestionBankRequest> questions;
}
