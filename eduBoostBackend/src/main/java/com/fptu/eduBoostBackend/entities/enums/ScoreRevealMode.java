package com.fptu.eduBoostBackend.entities.enums;

/**
 * When students see numeric scores after an online exam for this schedule.
 */
public enum ScoreRevealMode {
    /** Show score on submit screen immediately. */
    IMMEDIATE,
    /** Hide score until teacher announces results for this schedule. */
    AFTER_ANNOUNCE
}
