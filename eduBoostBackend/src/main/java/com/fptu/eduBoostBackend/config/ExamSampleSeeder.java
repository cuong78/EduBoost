package com.fptu.eduBoostBackend.config;

import com.fptu.eduBoostBackend.entities.Exam;
import com.fptu.eduBoostBackend.entities.ExamType;
import com.fptu.eduBoostBackend.entities.Subject;
import com.fptu.eduBoostBackend.entities.Teacher;
import com.fptu.eduBoostBackend.entities.User;
import com.fptu.eduBoostBackend.entities.enums.ExamStatus;
import com.fptu.eduBoostBackend.repositories.ExamRepository;
import com.fptu.eduBoostBackend.repositories.ExamTypeRepository;
import com.fptu.eduBoostBackend.repositories.SubjectRepository;
import com.fptu.eduBoostBackend.repositories.TeacherRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class ExamSampleSeeder {

    private final ExamRepository examRepository;
    private final SubjectRepository subjectRepository;
    private final ExamTypeRepository examTypeRepository;
    private final TeacherRepository teacherRepository;

    @Bean
    @Order(100)
    public CommandLineRunner seedSampleExams() {
        return args -> {
            if (examRepository.count() > 0) {
                return;
            }

            List<Subject> subjects = subjectRepository.findAll();
            List<ExamType> examTypes = examTypeRepository.findAll();
            List<Teacher> teachers = teacherRepository.findAll();

            if (subjects.isEmpty() || examTypes.isEmpty() || teachers.isEmpty()) {
                log.info("ExamSampleSeeder: missing subjects, exam types or teachers - skipping exam seeding.");
                return;
            }

            Subject math = subjects.stream()
                    .filter(s -> "TOAN".equalsIgnoreCase(s.getSubjectCode()))
                    .findFirst()
                    .orElse(subjects.get(0));

            Subject physics = subjects.stream()
                    .filter(s -> "LY".equalsIgnoreCase(s.getSubjectCode()))
                    .findFirst()
                    .orElse(subjects.size() > 1 ? subjects.get(1) : subjects.get(0));

            ExamType midterm = examTypes.stream()
                    .filter(t -> "MIDTERM".equalsIgnoreCase(t.getTypeCode()))
                    .findFirst()
                    .orElse(examTypes.get(0));

            ExamType finalExam = examTypes.stream()
                    .filter(t -> "FINAL".equalsIgnoreCase(t.getTypeCode()))
                    .findFirst()
                    .orElse(examTypes.size() > 1 ? examTypes.get(1) : examTypes.get(0));

            Teacher teacher = teachers.get(0);
            User createdBy = teacher.getUser();

            Exam mathExam = Exam.builder()
                    .examCode("TOAN10-MIDTERM-001")
                    .examTitle("Giữa kỳ Toán 10")
                    .examType(midterm)
                    .subject(math)
                    .gradeLevel(10)
                    .chapter(null)
                    .semester(1)
                    .schoolYear("2024-2025")
                    .matrixTemplate(null)
                    .totalQuestions(20)
                    .totalPoints(BigDecimal.valueOf(10.0))
                    .createdBy(createdBy)
                    .status(ExamStatus.APPROVED)
                    .approvedBy(createdBy)
                    .approvedAt(LocalDateTime.now())
                    .build();

            Exam physicsExam = Exam.builder()
                    .examCode("LY10-FINAL-001")
                    .examTitle("Cuối kỳ Vật lý 10")
                    .examType(finalExam)
                    .subject(physics)
                    .gradeLevel(10)
                    .chapter(null)
                    .semester(1)
                    .schoolYear("2024-2025")
                    .matrixTemplate(null)
                    .totalQuestions(25)
                    .totalPoints(BigDecimal.valueOf(10.0))
                    .createdBy(createdBy)
                    .status(ExamStatus.APPROVED)
                    .approvedBy(createdBy)
                    .approvedAt(LocalDateTime.now())
                    .build();

            examRepository.save(mathExam);
            examRepository.save(physicsExam);

            log.info("ExamSampleSeeder: seeded {} sample exams.", 2);
        };
    }
}

