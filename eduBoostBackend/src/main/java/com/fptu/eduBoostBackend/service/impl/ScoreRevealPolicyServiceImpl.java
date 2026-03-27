package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.entities.ExamSchedule;
import com.fptu.eduBoostBackend.entities.enums.ScoreRevealMode;
import com.fptu.eduBoostBackend.service.ScoreRevealPolicyService;
import org.springframework.stereotype.Service;

@Service
public class ScoreRevealPolicyServiceImpl implements ScoreRevealPolicyService {
    @Override
    public boolean areScoresVisible(ExamSchedule schedule) {
        return schedule == null
                || schedule.getScoreRevealMode() != ScoreRevealMode.AFTER_ANNOUNCE
                || schedule.getResultsAnnouncedAt() != null;
    }
}
