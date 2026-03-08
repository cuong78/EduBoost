package com.fptu.eduBoostBackend.initializer;

import com.fptu.eduBoostBackend.entities.Parent;
import com.fptu.eduBoostBackend.entities.ParentStudent;
import com.fptu.eduBoostBackend.entities.Student;
import com.fptu.eduBoostBackend.entities.enums.Relationship;
import com.fptu.eduBoostBackend.repositories.ParentRepository;
import com.fptu.eduBoostBackend.repositories.ParentStudentRepository;
import com.fptu.eduBoostBackend.repositories.StudentRepository;
import com.fptu.eduBoostBackend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ParentStudentInitializer {

    private final UserRepository userRepository;
    private final ParentRepository parentRepository;
    private final StudentRepository studentRepository;
    private final ParentStudentRepository parentStudentRepository;

    public void init() {
        if (parentStudentRepository.count() > 0) {
            return;
        }

        // Lấy parent1 nếu tồn tại
        var parentUserOpt = userRepository.findByUsername("parent1");
        if (parentUserOpt.isEmpty()) {
            log.info("ParentStudentInitializer: user 'parent1' not found, skipping parent-student seeding.");
            return;
        }

        var parentOpt = parentRepository.findByUser(parentUserOpt.get());
        if (parentOpt.isEmpty()) {
            log.info("ParentStudentInitializer: Parent entity for 'parent1' not found, skipping.");
            return;
        }

        Parent parent1 = parentOpt.get();
        List<Student> students = studentRepository.findAll();
        if (students.isEmpty()) {
            log.info("ParentStudentInitializer: no students found, skipping.");
            return;
        }

        int maxLinks = Math.min(5, students.size());
        for (int i = 0; i < maxLinks; i++) {
            Student student = students.get(i);
            if (parentStudentRepository.existsByParentAndStudent(parent1, student)) {
                continue;
            }
            ParentStudent link = ParentStudent.builder()
                    .parent(parent1)
                    .student(student)
                    .relationship(Relationship.MOTHER)
                    .build();
            parentStudentRepository.save(link);
        }

        log.info("ParentStudentInitializer: seeded parent1 with {} linked students.", maxLinks);
    }
}

