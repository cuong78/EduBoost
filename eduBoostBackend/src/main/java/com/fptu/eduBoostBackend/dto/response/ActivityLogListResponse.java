package com.fptu.eduBoostBackend.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLogListResponse {
    private boolean success;
    private List<ActivityLogResponse> data;
    private PaginationResponse pagination;
}