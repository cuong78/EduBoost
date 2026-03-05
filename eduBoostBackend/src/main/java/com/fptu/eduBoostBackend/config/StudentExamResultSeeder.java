package com.fptu.eduBoostBackend.config;

import com.fptu.eduBoostBackend.entities.Exam;
import com.fptu.eduBoostBackend.entities.Parent;
import com.fptu.eduBoostBackend.entities.ParentStudent;
import com.fptu.eduBoostBackend.entities.Student;
import com.fptu.eduBoostBackend.entities.StudentExamResult;
import com.fptu.eduBoostBackend.repositories.ExamRepository;
import com.fptu.eduBoostBackend.repositories.ParentRepository;
import com.fptu.eduBoostBackend.repositories.ParentStudentRepository;
import com.fptu.eduBoostBackend.repositories.StudentExamResultRepository;
import com.fptu.eduBoostBackend.repositories.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class StudentExamResultSeeder {

    private final ParentStudentRepository parentStudentRepository;
    private final ExamRepository examRepository;
    private final StudentExamResultRepository studentExamResultRepository;
    private final ParentRepository parentRepository;
    private final StudentRepository studentRepository;

    @Bean
    @Order(200)
    public CommandLineRunner seedStudentExamResults() {
        return args -> {
            long existingCount = studentExamResultRepository.count();
            if (existingCount > 0) {
                log.info("StudentExamResultSeeder: existing results found ({}), skipping seeding.", existingCount);
                return;
            }

            List<ParentStudent> links = parentStudentRepository.findAll();
            // Dev convenience: if chưa có liên kết phụ huynh - học sinh,
            // tự tạo một vài liên kết dựa trên parent & student có sẵn.
            if (links.isEmpty()) {
                List<Parent> parents = parentRepository.findAll();
                List<Student> students = studentRepository.findAll();
                if (parents.isEmpty() || students.isEmpty()) {
                    log.info("StudentExamResultSeeder: no parents or students found, skipping seeding.");
                    return;
                }

                Parent firstParent = parents.get(0);
                int maxLinks = Math.min(5, students.size());
                for (int i = 0; i < maxLinks; i++) {
                    Student student = students.get(i);
                    ParentStudent link = ParentStudent.builder()
                            .parent(firstParent)
                            .student(student)
                            // relationship sẽ được set mặc định ở chỗ khác nếu cần,
                            // ở đây chỉ tạo dữ liệu dev nên dùng tạm "OTHER"
                            .relationship(com.fptu.eduBoostBackend.entities.enums.Relationship.OTHER)
                            .build();
                    parentStudentRepository.save(link);
                }
                links = parentStudentRepository.findAll();
                log.info("StudentExamResultSeeder: created {} parent-student links for seeding.", links.size());
            }

            List<Exam> exams = examRepository.findAll();
            if (exams.isEmpty()) {
                log.info("StudentExamResultSeeder: no exams found, skipping result seeding (parent-student links may still have been created).");
                return;
            }

            Random random = new Random();
            int created = 0;

            for (ParentStudent link : links) {
                // pick up to 3 random exams per linked student
                for (int i = 0; i < Math.min(3, exams.size()); i++) {
                    Exam exam = exams.get(random.nextInt(exams.size()));

                    BigDecimal maxScore = exam.getTotalPoints();
                    if (maxScore == null || maxScore.compareTo(BigDecimal.ZERO) <= 0) {
                        maxScore = BigDecimal.TEN;
                    }

                    BigDecimal score = maxScore
                            .multiply(BigDecimal.valueOf(0.5 + random.nextDouble() * 0.5))
                            .setScale(1, RoundingMode.HALF_UP);

                    StudentExamResult result = StudentExamResult.builder()
                            .student(link.getStudent())
                            .exam(exam)
                            .score(score)
                            .maxScore(maxScore)
                            .takenAt(LocalDateTime.now().minusDays(random.nextInt(30)))
                            .status("COMPLETED")
                            .sourceType(random.nextBoolean() ? "TEACHER_INPUT" : "ONLINE_EXAM")
                            .attemptNumber(1)
                            .build();

                    studentExamResultRepository.save(result);
                    created++;
                }
            }

            log.info("StudentExamResultSeeder: seeded {} student exam results for {} parent-student links.", created, links.size());
        };
    }
}

