package com.fptu.eduBoostBackend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
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
public class ReorderQuestionsRequest {
    
    @NotEmpty(message = "Question orders list is required")
    @Valid
    private List<QuestionOrderRequest> questionOrders;
}
