package com.fptu.eduBoostBackend.initializer;

import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.entities.enums.ExamQuestionSourceFlag;
import com.fptu.eduBoostBackend.entities.enums.ExamStatus;
import com.fptu.eduBoostBackend.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Seeds one PUBLISHED Math exam with questions and an active ExamSchedule for class 10A1.
 * Runs only once during first boot (DataInitializer checks userRepository.count() > 0).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ExamScheduleSeedInitializer {

    private final ExamRepository examRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final ExamScheduleRepository examScheduleRepository;
    private final ExamTypeRepository examTypeRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final ClassRepository classRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;

    private static final String DEFAULT_SETTINGS =
            "{\"maxTabSwitches\":3,\"requireFullscreen\":false,\"autoSubmitOnViolation\":false}";

    public void init() {
        // Find teacher1 and class 10A1
        User teacher1User = userRepository.findByUsername("teacher1").orElse(null);
        if (teacher1User == null) {
            log.warn("ExamScheduleSeedInitializer: teacher1 not found, skipping seed");
            return;
        }
        Teacher teacher = teacherRepository.findByUser(teacher1User).orElse(null);
        if (teacher == null) {
            log.warn("ExamScheduleSeedInitializer: Teacher entity not found for teacher1, skipping seed");
            return;
        }

        // Find student1 and use their class (so student1 always sees the seed exam)
        User student1User = userRepository.findByUsername("student1").orElse(null);
        Student student1 = student1User != null ? studentRepository.findByUser(student1User).orElse(null) : null;
        SchoolClass targetClass = student1 != null ? student1.getSchoolClass() : null;

        if (targetClass == null) {
            // Fallback: try 10A1-2024
            targetClass = classRepository.findByClassCode("10A1-2024").orElse(null);
        }
        if (targetClass == null) {
            log.warn("ExamScheduleSeedInitializer: no target class found, skipping seed");
            return;
        }

        // Use the class's homeroom teacher so ownership check passes
        Teacher classTeacher = targetClass.getTeacher();
        if (classTeacher == null) classTeacher = teacher;
        Subject mathSubject = subjectRepository.findBySubjectCode("TOAN").orElse(null);
        ExamType examType45 = examTypeRepository.findByTypeCode("15MIN").orElse(null);

        if (mathSubject == null || examType45 == null) {
            log.warn("ExamScheduleSeedInitializer: required subject/examType not found, skipping seed");
            return;
        }

        // Build the seed exam
        Exam seedExam = examRepository.save(Exam.builder()
                .examCode("SEED-MATH10-2026")
                .examTitle("Kiểm tra 15 phút - Toán 10 (Demo)")
                .examType(examType45)
                .subject(mathSubject)
                .gradeLevel(10)
                .totalQuestions(5)
                .totalPoints(BigDecimal.valueOf(10))
                .createdBy(teacher1User)
                .status(ExamStatus.PUBLISHED)
                .publishedAt(LocalDateTime.now())
                .build());

        // Create 5 sample MC questions
        List<String[]> qData = List.of(
                new String[]{"Giá trị của 2² + 3² bằng:", "13", "11", "12", "14"},
                new String[]{"Căn bậc hai của 144 là:", "12", "11", "13", "14"},
                new String[]{"Tổng các góc trong tam giác là:", "180°", "90°", "270°", "360°"},
                new String[]{"log₁₀(1000) bằng:", "3", "2", "4", "10"},
                new String[]{"Đạo hàm của x² là:", "2x", "x", "2", "x²"}
        );

        for (int i = 0; i < qData.size(); i++) {
            String[] d = qData.get(i);
            examQuestionRepository.save(ExamQuestion.builder()
                    .exam(seedExam)
                    .orderNumber(i + 1)
                    .points(BigDecimal.valueOf(2))
                    .sourceFlag(ExamQuestionSourceFlag.EXISTING_BANK)
                    .questionText(d[0])
                    .correctAnswer(d[1])
                    .wrongAnswer1(d[2])
                    .wrongAnswer2(d[3])
                    .wrongAnswer3(d[4])
                    .build());
        }

        // Create an active schedule: started 30 min ago, ends 90 min from now
        LocalDateTime now = LocalDateTime.now();
        ExamSchedule schedule = examScheduleRepository.save(ExamSchedule.builder()
                .exam(seedExam)
                .schoolClass(targetClass)
                .teacher(classTeacher)
                .title("Kiểm tra Demo - Toán 10")
                .description("Bài kiểm tra demo được khởi tạo tự động để test hệ thống")
                .startTime(now.minusMinutes(5)) // Start closer to current time
                .endTime(now.plusMinutes(120))
                .durationMinutes(15)
                .allowLateMinutes(120) // Give plenty of time to explore the demo
                .maxAttempts(2)
                .status("SCHEDULED")
                .settings(DEFAULT_SETTINGS)
                .build());

        log.info("ExamScheduleSeedInitializer: created seed exam '{}' (id={}) and schedule (id={}) for class {}",
                seedExam.getExamTitle(), seedExam.getId(), schedule.getId(), targetClass.getClassName());
    }
}
