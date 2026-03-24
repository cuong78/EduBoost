package com.fptu.eduBoostBackend.initializer;

import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.entities.enums.DifficultyLevel;
import com.fptu.eduBoostBackend.entities.enums.QuestionSourceType;
import com.fptu.eduBoostBackend.entities.enums.QuestionType;
import com.fptu.eduBoostBackend.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Seeds minimal demo data for Question Bank + Matrix Templates so UI is not empty.
 * Intended for local/dev only; runs only on first boot (DataInitializer guarded by user count).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class QuestionBankAndMatrixSeedInitializer {

    private final QuestionBankRepository questionBankRepository;
    private final LessonRepository lessonRepository;
    private final CognitiveLevelRepository cognitiveLevelRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final ExamTypeRepository examTypeRepository;
    private final ExamMatrixTemplateRepository examMatrixTemplateRepository;
    private final ExamMatrixTemplateDetailRepository examMatrixTemplateDetailRepository;
    private final ExamMatrixLessonDetailRepository examMatrixLessonDetailRepository;

    public void init() {
        seedQuestionBankIfEmpty();
        seedMatrixTemplateIfEmpty();
    }

    private void seedQuestionBankIfEmpty() {
        if (questionBankRepository.count() > 0) return;

        User createdBy = userRepository.findByUsername("teacher1")
                .orElseGet(() -> userRepository.findAll().stream().findFirst().orElse(null));
        if (createdBy == null) {
            log.warn("QuestionBankAndMatrixSeedInitializer: no user found; skipping QuestionBank seed");
            return;
        }

        List<Lesson> lessons = lessonRepository.findAll();
        if (lessons.isEmpty()) {
            log.warn("QuestionBankAndMatrixSeedInitializer: no lessons found; skipping QuestionBank seed");
            return;
        }
        Lesson lesson = lessons.get(0);

        List<CognitiveLevel> levels = cognitiveLevelRepository.findAllByOrderByDisplayOrderAsc();
        if (levels.isEmpty()) {
            log.warn("QuestionBankAndMatrixSeedInitializer: no cognitive levels found; skipping QuestionBank seed");
            return;
        }

        CognitiveLevel nb = levels.get(0);
        CognitiveLevel th = levels.size() > 1 ? levels.get(1) : nb;

        List<QuestionBank> demo = List.of(
                QuestionBank.builder()
                        .lesson(lesson)
                        .questionText("Demo: Giá trị của 2² + 3² bằng bao nhiêu?")
                        .correctAnswer("13")
                        .explanation("2² + 3² = 4 + 9 = 13")
                        .questionType(QuestionType.MULTIPLE_CHOICE)
                        .difficultyLevel(DifficultyLevel.EASY)
                        .cognitiveLevel(nb)
                        .sourceType(QuestionSourceType.MANUAL)
                        .sourceReference("Seed data")
                        .createdBy(createdBy)
                        .build(),
                QuestionBank.builder()
                        .lesson(lesson)
                        .questionText("Demo: Căn bậc hai của 144 là bao nhiêu?")
                        .correctAnswer("12")
                        .explanation("12 × 12 = 144")
                        .questionType(QuestionType.MULTIPLE_CHOICE)
                        .difficultyLevel(DifficultyLevel.EASY)
                        .cognitiveLevel(nb)
                        .sourceType(QuestionSourceType.MANUAL)
                        .sourceReference("Seed data")
                        .createdBy(createdBy)
                        .build(),
                QuestionBank.builder()
                        .lesson(lesson)
                        .questionText("Demo: Tổng 3 góc trong tam giác bằng bao nhiêu độ?")
                        .correctAnswer("180")
                        .explanation("Tổng ba góc trong một tam giác luôn bằng 180°.")
                        .questionType(QuestionType.MULTIPLE_CHOICE)
                        .difficultyLevel(DifficultyLevel.MEDIUM)
                        .cognitiveLevel(th)
                        .sourceType(QuestionSourceType.MANUAL)
                        .sourceReference("Seed data")
                        .createdBy(createdBy)
                        .build()
        );

        questionBankRepository.saveAll(demo);
        log.info("QuestionBankAndMatrixSeedInitializer: seeded {} QuestionBank questions (lessonId={})",
                demo.size(), lesson.getId());
    }

    private void seedMatrixTemplateIfEmpty() {
        if (examMatrixTemplateRepository.count() > 0) return;

        User createdBy = userRepository.findByUsername("teacher1")
                .orElseGet(() -> userRepository.findAll().stream().findFirst().orElse(null));
        Subject subject = subjectRepository.findBySubjectCode("TOAN").orElse(null);
        ExamType examType = examTypeRepository.findByTypeCode("45MIN").orElse(null);
        if (subject == null || examType == null) {
            log.warn("QuestionBankAndMatrixSeedInitializer: required Subject/ExamType not found; skipping Matrix seed");
            return;
        }

        List<CognitiveLevel> levels = cognitiveLevelRepository.findAllByOrderByDisplayOrderAsc();
        if (levels.isEmpty()) {
            log.warn("QuestionBankAndMatrixSeedInitializer: no cognitive levels found; skipping Matrix seed");
            return;
        }

        ExamMatrixTemplate template = examMatrixTemplateRepository.save(ExamMatrixTemplate.builder()
                .templateName("Demo Ma trận - " + subject.getSubjectName() + " - 45 phút")
                .examType(examType)
                .subject(subject)
                .gradeLevel(10)
                .totalQuestions(10)
                .description("Ma trận demo được khởi tạo tự động để test hệ thống")
                .isDefault(Boolean.TRUE)
                .createdBy(createdBy)
                .build());

        // Distribution by cognitive level
        List<ExamMatrixTemplateDetail> details = new ArrayList<>();
        // Prefer 4 levels, fallback to whatever exists
        int[] qCounts = new int[]{4, 3, 2, 1};
        BigDecimal[] pts = new BigDecimal[]{BigDecimal.valueOf(0.5), BigDecimal.valueOf(0.75), BigDecimal.valueOf(1.0), BigDecimal.valueOf(1.5)};

        int usedLevels = Math.min(levels.size(), 4);
        int totalQuestions = 0;
        for (int i = 0; i < usedLevels; i++) {
            int nq = qCounts[i];
            BigDecimal ppq = pts[i];
            details.add(ExamMatrixTemplateDetail.builder()
                    .template(template)
                    .cognitiveLevel(levels.get(i))
                    .numberOfQuestions(nq)
                    .pointsPerQuestion(ppq)
                    .totalPoints(ppq.multiply(BigDecimal.valueOf(nq)))
                    .build());
            totalQuestions += nq;
        }
        examMatrixTemplateDetailRepository.saveAll(details);

        // Optional lesson-level cells: map all questions to the first 1-2 lessons if available
        List<Lesson> lessons = lessonRepository.findAll();
        if (!lessons.isEmpty()) {
            Lesson l1 = lessons.get(0);
            Lesson l2 = lessons.size() > 1 ? lessons.get(1) : null;
            List<ExamMatrixLessonDetail> lessonDetails = new ArrayList<>();
            // Put some NB questions on l1, some TH on l2 (if present)
            lessonDetails.add(ExamMatrixLessonDetail.builder()
                    .template(template)
                    .lesson(l1)
                    .cognitiveLevel(levels.get(0))
                    .numberOfQuestions(Math.max(1, qCounts[0] / 2))
                    .build());
            if (l2 != null && usedLevels > 1) {
                lessonDetails.add(ExamMatrixLessonDetail.builder()
                        .template(template)
                        .lesson(l2)
                        .cognitiveLevel(levels.get(1))
                        .numberOfQuestions(Math.max(1, qCounts[1] / 2))
                        .build());
            }
            examMatrixLessonDetailRepository.saveAll(lessonDetails);
        }

        // Keep template totalQuestions in sync with details
        template.setTotalQuestions(totalQuestions);
        examMatrixTemplateRepository.save(template);

        log.info("QuestionBankAndMatrixSeedInitializer: seeded 1 MatrixTemplate (id={}) with {} details",
                template.getId(), details.size());
    }
}

