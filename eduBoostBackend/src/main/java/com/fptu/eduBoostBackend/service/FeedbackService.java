package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.dto.request.CreateFeedbackRequest;
import com.fptu.eduBoostBackend.dto.request.RespondFeedbackRequest;
import com.fptu.eduBoostBackend.dto.response.FeedbackResponse;
import com.fptu.eduBoostBackend.dto.response.FeedbackStatsResponse;

import java.util.List;

public interface FeedbackService {

    /** Teacher — submit new feedback */
    FeedbackResponse createFeedback(CreateFeedbackRequest request);

    /** Teacher — list my feedbacks */
    List<FeedbackResponse> getMyFeedbacks();

    /** Teacher — get single feedback */
    FeedbackResponse getMyFeedbackById(Long id);

    /** Admin — list all feedbacks */
    List<FeedbackResponse> getAllFeedbacks();

    /** Admin — feedback statistics */
    FeedbackStatsResponse getStats();

    /** Admin — get feedback detail */
    FeedbackResponse getFeedbackById(Long id);

    /** Admin — respond to feedback */
    FeedbackResponse respondToFeedback(Long id, RespondFeedbackRequest request);
}
