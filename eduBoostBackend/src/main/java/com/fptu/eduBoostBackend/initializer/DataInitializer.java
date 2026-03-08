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
    private final ScienceGrade6Initializer scienceGrade6Initializer;
    private final ScienceGrade7Initializer scienceGrade7Initializer;
    private final ScienceGrade8Initializer scienceGrade8Initializer;
    private final ScienceGrade9Initializer scienceGrade9Initializer;
    private final MathGrade7Initializer mathGrade7Initializer;
    private final MathGrade8Initializer mathGrade8Initializer;
    private final MathGrade9Initializer mathGrade9Initializer;
    private final MathGrade10Initializer mathGrade10Initializer;
    private final MathGrade11Initializer mathGrade11Initializer;
    private final MathGrade12Initializer mathGrade12Initializer;
    private final PhysicsGrade10Initializer physicsGrade10Initializer;
    private final PhysicsGrade11Initializer physicsGrade11Initializer;
    private final PhysicsGrade12Initializer physicsGrade12Initializer;
    private final ChemistryGrade10Initializer chemistryGrade10Initializer;
    private final ChemistryGrade11Initializer chemistryGrade11Initializer;
    private final ChemistryGrade12Initializer chemistryGrade12Initializer;

    // EnglishInitializer removed as subject no longer initialized
    private final ClassStudentInitializer classStudentInitializer;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return;
        }
        roleUserInitializer.init();
        subjectExamInitializer.init();
        mathGrade6Initializer.init();
        scienceGrade6Initializer.init();
        scienceGrade7Initializer.init();
        scienceGrade8Initializer.init();
        scienceGrade9Initializer.init();
        mathGrade7Initializer.init();
        mathGrade8Initializer.init();
        mathGrade9Initializer.init();
        mathGrade10Initializer.init();
        mathGrade11Initializer.init();
        mathGrade12Initializer.init();
        physicsGrade10Initializer.init();
        physicsGrade11Initializer.init();
        physicsGrade12Initializer.init();
        chemistryGrade10Initializer.init();
        chemistryGrade11Initializer.init();
        chemistryGrade12Initializer.init();
        // English initialization removed
        classStudentInitializer.init();
    }
}
