package com.fptu.eduBoostBackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentInvitationsResponse {
    private boolean success;
    private List<StudentInvitationDetailResponse> data;
    private PaginationResponse pagination;
}

