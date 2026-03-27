package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.entities.ExamSchedule;

public interface ScoreRevealPolicyService {
    boolean areScoresVisible(ExamSchedule schedule);
}
