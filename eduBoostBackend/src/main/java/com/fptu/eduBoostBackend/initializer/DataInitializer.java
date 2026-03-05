package com.fptu.eduBoostBackend.initializer;

import com.fptu.eduBoostBackend.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleUserInitializer roleUserInitializer;
    private final SubjectExamInitializer subjectExamInitializer;
    private final MathGrade6Initializer mathGrade6Initializer;
    private final MathGrade10Initializer mathGrade10Initializer;
    private final MathGrade11Initializer mathGrade11Initializer;
    private final MathGrade12Initializer mathGrade12Initializer;
    private final PhysicsGrade10Initializer physicsGrade10Initializer;
    private final PhysicsGrade11Initializer physicsGrade11Initializer;
    private final PhysicsGrade12Initializer physicsGrade12Initializer;

    private final EnglishInitializer EnglishInitializer;
    private final ClassStudentInitializer classStudentInitializer;

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
        physicsGrade10Initializer.init();
        physicsGrade11Initializer.init();
        physicsGrade12Initializer.init();

        EnglishInitializer.init();
        classStudentInitializer.init();
    }
}
