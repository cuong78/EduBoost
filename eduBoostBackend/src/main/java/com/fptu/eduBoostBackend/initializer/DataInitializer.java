package com.fptu.eduBoostBackend.initializer;

import com.fptu.eduBoostBackend.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
@Order(0)
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleUserInitializer roleUserInitializer;
    private final SubjectExamInitializer subjectExamInitializer;
    private final MathGrade6Initializer mathGrade6Initializer;
    private final MathGrade10Initializer mathGrade10Initializer;
    private final MathGrade11Initializer mathGrade11Initializer;
    private final MathGrade12Initializer mathGrade12Initializer;
    private final PhysicsEnglishInitializer physicsEnglishInitializer;
    private final ClassStudentInitializer classStudentInitializer;
    private final ParentStudentInitializer parentStudentInitializer;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return;
        }
        roleUserInitializer.init();
        subjectExamInitializer.init();
        mathGrade6Initializer.init();
        mathGrade10Initializer.init();
        mathGrade11Initializer.init();
        mathGrade12Initializer.init();
        physicsEnglishInitializer.init();
        classStudentInitializer.init();
        parentStudentInitializer.init();
    }
}
