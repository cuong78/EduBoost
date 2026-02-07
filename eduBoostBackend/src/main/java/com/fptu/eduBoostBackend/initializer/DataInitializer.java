package com.fptu.eduBoostBackend.initializer;


import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import static com.fptu.eduBoostBackend.constant.PredefinedRole.ADMIN_ROLE;
import static com.fptu.eduBoostBackend.constant.PredefinedRole.STUDENT_ROLE;
import static com.fptu.eduBoostBackend.constant.PredefinedRole.TEACH_ROLE;
import com.fptu.eduBoostBackend.entities.Chapter;
import com.fptu.eduBoostBackend.entities.Lesson;
import com.fptu.eduBoostBackend.entities.LessonResource;
import com.fptu.eduBoostBackend.entities.Parent;
import com.fptu.eduBoostBackend.entities.Role;
import com.fptu.eduBoostBackend.entities.Student;
import com.fptu.eduBoostBackend.entities.SchoolClass;
import com.fptu.eduBoostBackend.entities.Subject;
import com.fptu.eduBoostBackend.entities.Teacher;
import com.fptu.eduBoostBackend.entities.User;
import com.fptu.eduBoostBackend.entities.enums.Gender;
import com.fptu.eduBoostBackend.entities.enums.LessonResourceType;
import com.fptu.eduBoostBackend.entities.enums.StudentStatus;
import com.fptu.eduBoostBackend.entities.GradeLevel;
import com.fptu.eduBoostBackend.entities.CognitiveLevel;
import com.fptu.eduBoostBackend.repositories.ChapterRepository;
import com.fptu.eduBoostBackend.repositories.ClassRepository;
import com.fptu.eduBoostBackend.repositories.GradeLevelRepository;
import com.fptu.eduBoostBackend.repositories.CognitiveLevelRepository;
import com.fptu.eduBoostBackend.repositories.LessonRepository;
import com.fptu.eduBoostBackend.repositories.LessonResourceRepository;
import com.fptu.eduBoostBackend.repositories.ParentRepository;
import com.fptu.eduBoostBackend.repositories.RoleRepository;
import com.fptu.eduBoostBackend.repositories.StudentRepository;
import com.fptu.eduBoostBackend.repositories.SubjectRepository;
import com.fptu.eduBoostBackend.repositories.TeacherRepository;
import com.fptu.eduBoostBackend.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final TeacherRepository teacherRepository;
    private final ParentRepository parentRepository;
    private final StudentRepository studentRepository;
    private final GradeLevelRepository gradeLevelRepository;
    private final ClassRepository classRepository;
    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;
    private final LessonResourceRepository lessonResourceRepository;
    private final CognitiveLevelRepository cognitiveLevelRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return;
        }
        initializeRoles();
        initializeUsers();
        initializeSubjects();
        initializeCognitiveLevels();
        initializeChaptersAndLessons();
        initializeClasses();
    }

    /**
     * Khởi tạo các mức độ nhận thức theo chuẩn giáo dục Việt Nam
     * 4 mức độ: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao
     */
    private void initializeCognitiveLevels() {
        // Mức 1: Nhận biết
        CognitiveLevel level1 = CognitiveLevel.builder()
                .level("Nhận biết")
                .description("Học sinh nhận ra, nhớ lại các khái niệm, định nghĩa, công thức, định lý đã học. Yêu cầu tái hiện kiến thức.")
                .displayOrder(1)
                .build();
        cognitiveLevelRepository.save(level1);

        // Mức 2: Thông hiểu
        CognitiveLevel level2 = CognitiveLevel.builder()
                .level("Thông hiểu")
                .description("Học sinh hiểu được ý nghĩa, giải thích, diễn đạt lại kiến thức bằng ngôn ngữ của mình. Có thể suy luận đơn giản.")
                .displayOrder(2)
                .build();
        cognitiveLevelRepository.save(level2);

        // Mức 3: Vận dụng
        CognitiveLevel level3 = CognitiveLevel.builder()
                .level("Vận dụng")
                .description("Học sinh áp dụng kiến thức để giải quyết các bài tập, tình huống quen thuộc hoặc tương tự.")
                .displayOrder(3)
                .build();
        cognitiveLevelRepository.save(level3);

        // Mức 4: Vận dụng cao
        CognitiveLevel level4 = CognitiveLevel.builder()
                .level("Vận dụng cao")
                .description("Học sinh vận dụng kiến thức để giải quyết vấn đề mới, tình huống phức tạp, có tính sáng tạo và tổng hợp.")
                .displayOrder(4)
                .build();
        cognitiveLevelRepository.save(level4);
    }


    private void initializeSubjects() {
        // Create common subjects for testing
        Subject math = Subject.builder()
                .subjectCode("TOAN")
                .description("Toán học")
                .build();
        subjectRepository.save(math);

        Subject physics = Subject.builder()
                .subjectCode("LY")
                .description("Vật lý")
                .build();
        subjectRepository.save(physics);

        Subject chemistry = Subject.builder()
                .subjectCode("HOA")
                .description("Hóa học")
                .build();
        subjectRepository.save(chemistry);

        Subject english = Subject.builder()
                .subjectCode("ANH")
                .description("Tiếng Anh")
                .build();
        subjectRepository.save(english);

        Subject literature = Subject.builder()
                .subjectCode("VAN")
                .description("Ngữ văn")
                .build();
        subjectRepository.save(literature);

        Subject biology = Subject.builder()
                .subjectCode("SINH")
                .description("Sinh học")
                .build();
        subjectRepository.save(biology);

        Subject history = Subject.builder()
                .subjectCode("SU")
                .description("Lịch sử")
                .build();
        subjectRepository.save(history);

        Subject geography = Subject.builder()
                .subjectCode("DIA")
                .description("Địa lý")
                .build();
        subjectRepository.save(geography);
    }

    private void initializeChaptersAndLessons() {
        // Get subjects
        Subject math = subjectRepository.findBySubjectCode("TOAN").orElse(null);
        Subject physics = subjectRepository.findBySubjectCode("LY").orElse(null);
        Subject english = subjectRepository.findBySubjectCode("ANH").orElse(null);

        if (math != null) {
            // Toán 10 - Chương 1
            Chapter mathChap1 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(10)
                    .chapterNumber(1)
                    .chapterName("Mệnh đề - Tập hợp")
                    .description("Chương 1: Mệnh đề và Tập hợp")
                    .build();
            chapterRepository.save(mathChap1);

            Lesson mathC1L1 = Lesson.builder()
                    .chapter(mathChap1)
                    .lessonNumber(1)
                    .lessonName("Mệnh đề")
                    .description("Khái niệm mệnh đề, mệnh đề phủ định, mệnh đề kéo theo")
                    .build();
            lessonRepository.save(mathC1L1);

            LessonResource mathC1L1R1 = LessonResource.builder()
                    .lesson(mathC1L1)
                    .resourceName("Bài giảng Mệnh đề")
                    .resourceType(LessonResourceType.PDF)
                    .fileUrl("https://example.com/menh-de.pdf")
                    .extractedContent("Mệnh đề là một câu khẳng định đúng hoặc sai...")
                    .build();
            lessonResourceRepository.save(mathC1L1R1);

            Lesson mathC1L2 = Lesson.builder()
                    .chapter(mathChap1)
                    .lessonNumber(2)
                    .lessonName("Tập hợp")
                    .description("Khái niệm tập hợp, các phép toán tập hợp")
                    .build();
            lessonRepository.save(mathC1L2);

            LessonResource mathC1L2R1 = LessonResource.builder()
                    .lesson(mathC1L2)
                    .resourceName("Lý thuyết Tập hợp")
                    .resourceType(LessonResourceType.DOCX)
                    .fileUrl("https://example.com/tap-hop.docx")
                    .extractedContent("Tập hợp là một khái niệm cơ bản trong toán học...")
                    .build();
            lessonResourceRepository.save(mathC1L2R1);

            Lesson mathC1L3 = Lesson.builder()
                    .chapter(mathChap1)
                    .lessonNumber(3)
                    .lessonName("Các phép toán trên tập hợp")
                    .description("Hợp, giao, hiệu, phần bù của tập hợp")
                    .build();
            lessonRepository.save(mathC1L3);

            // Toán 10 - Chương 2
            Chapter mathChap2 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(10)
                    .chapterNumber(2)
                    .chapterName("Hàm số bậc nhất và bậc hai")
                    .description("Chương 2: Hàm số bậc nhất và bậc hai")
                    .build();
            chapterRepository.save(mathChap2);

            Lesson mathC2L1 = Lesson.builder()
                    .chapter(mathChap2)
                    .lessonNumber(1)
                    .lessonName("Hàm số và đồ thị")
                    .description("Khái niệm hàm số, đồ thị hàm số")
                    .build();
            lessonRepository.save(mathC2L1);

            Lesson mathC2L2 = Lesson.builder()
                    .chapter(mathChap2)
                    .lessonNumber(2)
                    .lessonName("Hàm số bậc nhất")
                    .description("Hàm số bậc nhất y = ax + b")
                    .build();
            lessonRepository.save(mathC2L2);

            LessonResource mathC2L2R1 = LessonResource.builder()
                    .lesson(mathC2L2)
                    .resourceName("Video bài giảng Hàm bậc nhất")
                    .resourceType(LessonResourceType.URL)
                    .fileUrl("https://youtube.com/watch?v=example")
                    .extractedContent("Hàm số bậc nhất có dạng y = ax + b với a khác 0...")
                    .build();
            lessonResourceRepository.save(mathC2L2R1);
        }

        if (physics != null) {
            // Vật lý 10 - Chương 1
            Chapter physicsChap1 = Chapter.builder()
                    .subject(physics)
                    .gradeLevel(10)
                    .chapterNumber(1)
                    .chapterName("Động học chất điểm")
                    .description("Chương 1: Động học chất điểm")
                    .build();
            chapterRepository.save(physicsChap1);

            Lesson physicsC1L1 = Lesson.builder()
                    .chapter(physicsChap1)
                    .lessonNumber(1)
                    .lessonName("Chuyển động cơ")
                    .description("Chất điểm, hệ quy chiếu, quỹ đạo")
                    .build();
            lessonRepository.save(physicsC1L1);

            LessonResource physicsC1L1R1 = LessonResource.builder()
                    .lesson(physicsC1L1)
                    .resourceName("Bài giảng Chuyển động cơ")
                    .resourceType(LessonResourceType.PDF)
                    .fileUrl("https://example.com/chuyen-dong-co.pdf")
                    .extractedContent("Chuyển động cơ là sự thay đổi vị trí của vật...")
                    .build();
            lessonResourceRepository.save(physicsC1L1R1);

            Lesson physicsC1L2 = Lesson.builder()
                    .chapter(physicsChap1)
                    .lessonNumber(2)
                    .lessonName("Chuyển động thẳng đều")
                    .description("Vận tốc, phương trình chuyển động thẳng đều")
                    .build();
            lessonRepository.save(physicsC1L2);

            Lesson physicsC1L3 = Lesson.builder()
                    .chapter(physicsChap1)
                    .lessonNumber(3)
                    .lessonName("Chuyển động thẳng biến đổi đều")
                    .description("Gia tốc, phương trình chuyển động")
                    .build();
            lessonRepository.save(physicsC1L3);
        }

        if (english != null) {
            // Tiếng Anh 10 - Unit 1
            Chapter englishUnit1 = Chapter.builder()
                    .subject(english)
                    .gradeLevel(10)
                    .chapterNumber(1)
                    .chapterName("Family Life")
                    .description("Unit 1: Family Life - Đời sống gia đình")
                    .build();
            chapterRepository.save(englishUnit1);

            Lesson englishU1L1 = Lesson.builder()
                    .chapter(englishUnit1)
                    .lessonNumber(1)
                    .lessonName("Getting Started")
                    .description("Introduction to family life topic")
                    .build();
            lessonRepository.save(englishU1L1);

            LessonResource englishU1L1R1 = LessonResource.builder()
                    .lesson(englishU1L1)
                    .resourceName("Vocabulary - Family Life")
                    .resourceType(LessonResourceType.TEXT)
                    .extractedContent("Family members: father, mother, brother, sister... Household chores: cook, clean, wash...")
                    .build();
            lessonResourceRepository.save(englishU1L1R1);

            Lesson englishU1L2 = Lesson.builder()
                    .chapter(englishUnit1)
                    .lessonNumber(2)
                    .lessonName("Language - Grammar")
                    .description("Present Simple vs Present Continuous")
                    .build();
            lessonRepository.save(englishU1L2);
        }
    }

    private void initializeRoles() {

        Role adminRole = Role.builder()
                .name(ADMIN_ROLE)
                .description("System Administrator with full access")
                .build();
        if (!roleRepository.existsByName("ADMIN")) {
            roleRepository.save(adminRole);
        }

        Role teachRole = Role.builder()
                .name(TEACH_ROLE)
                .description("Teacher")
                .build();
        if (!roleRepository.existsByName("TEACHER")) {
            roleRepository.save(teachRole);
        }

        Role studentRole = Role.builder()
                .name(STUDENT_ROLE)
                .description("Student")
                .build();
        if (!roleRepository.existsByName("STUDENT")) {
            roleRepository.save(studentRole);
        }

        Role parentRole = Role.builder()
                .name("PARENT")
                .description("Parent")
                .build();
        if (!roleRepository.existsByName("PARENT")) {
            roleRepository.save(parentRole);
        }
    }

    private void initializeUsers() {
        // Admin User
        Role adminRole = roleRepository.findByName("ADMIN").orElseThrow();
        User adminUser = User.builder()
                .username("admin")
                .email("admin@eduboost.com")
                .phone("0901234567")
                .password(passwordEncoder.encode("admin123"))
                .fullName("Admin User")
                .isVerify(true)
                .tokenVersion(0)
                .roles(Set.of(adminRole))
                .build();
        userRepository.save(adminUser);

        // Teacher User
        Role teacherRole = roleRepository.findByName("TEACHER").orElseThrow();
        User teacherUser = User.builder()
                .username("teacher1")
                .email("teacher1@eduboost.com")
                .phone("0912345678")
                .password(passwordEncoder.encode("teacher123"))
                .fullName("Nguyen Van A")
                .isVerify(true)
                .tokenVersion(0)
                .roles(Set.of(teacherRole))
                .build();
        User savedTeacher = userRepository.save(teacherUser);

        // Create Teacher record
        Teacher teacher = Teacher.builder()
                .user(savedTeacher)
                .employeeCode("T001")
                .subject("Mathematics")
                .build();
        teacherRepository.save(teacher);

        // Parent User 1
        Role parentRole = roleRepository.findByName("PARENT").orElseThrow();
        User parentUser1 = User.builder()
                .username("parent1")
                .email("parent1@eduboost.com")
                .phone("0923456789")
                .password(passwordEncoder.encode("parent123"))
                .fullName("Tran Thi B")
                .isVerify(true)
                .tokenVersion(0)
                .roles(Set.of(parentRole))
                .build();
        User savedParent1 = userRepository.save(parentUser1);

        // Create Parent record 1
        Parent parent1 = Parent.builder()
                .user(savedParent1)
                .occupation("Business Owner")
                .build();
        parentRepository.save(parent1);

        // Parent User 2
        User parentUser2 = User.builder()
                .username("parent2")
                .email("parent2@eduboost.com")
                .phone("0934567890")
                .password(passwordEncoder.encode("parent123"))
                .fullName("Le Van C")
                .isVerify(true)
                .tokenVersion(0)
                .roles(Set.of(parentRole))
                .build();
        User savedParent2 = userRepository.save(parentUser2);

        // Create Parent record 2
        Parent parent2 = Parent.builder()
                .user(savedParent2)
                .occupation("Engineer")
                .build();
        parentRepository.save(parent2);
    }

    private void initializeClasses() {
        // Get teacher
        Teacher teacher = teacherRepository.findAll().get(0);
        Role studentRole = roleRepository.findByName("STUDENT").orElseThrow();

        // Create grade levels 6-12
        GradeLevel gradeLevel6 = createGradeLevel("6");
        GradeLevel gradeLevel7 = createGradeLevel("7");
        GradeLevel gradeLevel8 = createGradeLevel("8");
        GradeLevel gradeLevel9 = createGradeLevel("9");
        GradeLevel gradeLevel10 = createGradeLevel("10");
        GradeLevel gradeLevel11 = createGradeLevel("11");
        GradeLevel gradeLevel12 = createGradeLevel("12");

        // Create classes for each grade level
        // Grade 6
        createSchoolClass("6A1", "6A1-2024", gradeLevel6, teacher, "2024-2025", "Class 6A1 - General");
        createSchoolClass("6A2", "6A2-2024", gradeLevel6, teacher, "2024-2025", "Class 6A2 - General");
        createSchoolClass("6B1", "6B1-2024", gradeLevel6, teacher, "2024-2025", "Class 6B1 - Advanced");

        // Grade 7
        createSchoolClass("7A1", "7A1-2024", gradeLevel7, teacher, "2024-2025", "Class 7A1 - General");
        createSchoolClass("7A2", "7A2-2024", gradeLevel7, teacher, "2024-2025", "Class 7A2 - General");
        createSchoolClass("7B1", "7B1-2024", gradeLevel7, teacher, "2024-2025", "Class 7B1 - Advanced");

        // Grade 8
        createSchoolClass("8A1", "8A1-2024", gradeLevel8, teacher, "2024-2025", "Class 8A1 - General");
        createSchoolClass("8A2", "8A2-2024", gradeLevel8, teacher, "2024-2025", "Class 8A2 - General");
        createSchoolClass("8B1", "8B1-2024", gradeLevel8, teacher, "2024-2025", "Class 8B1 - Advanced");

        // Grade 9
        createSchoolClass("9A1", "9A1-2024", gradeLevel9, teacher, "2024-2025", "Class 9A1 - General");
        createSchoolClass("9A2", "9A2-2024", gradeLevel9, teacher, "2024-2025", "Class 9A2 - General");
        createSchoolClass("9B1", "9B1-2024", gradeLevel9, teacher, "2024-2025", "Class 9B1 - Advanced");

        // Grade 10
        createSchoolClass("10A1", "10A1-2024", gradeLevel10, teacher, "2024-2025", "Class 10A1 - Mathematics");
        createSchoolClass("10A2", "10A2-2024", gradeLevel10, teacher, "2024-2025", "Class 10A2 - Mathematics");
        createSchoolClass("10B1", "10B1-2024", gradeLevel10, teacher, "2024-2025", "Class 10B1 - Science");

        // Grade 11
        createSchoolClass("11A1", "11A1-2024", gradeLevel11, teacher, "2024-2025", "Class 11A1 - Mathematics");
        createSchoolClass("11A2", "11A2-2024", gradeLevel11, teacher, "2024-2025", "Class 11A2 - Mathematics");
        createSchoolClass("11B1", "11B1-2024", gradeLevel11, teacher, "2024-2025", "Class 11B1 - Science");

        // Grade 12
        createSchoolClass("12A1", "12A1-2024", gradeLevel12, teacher, "2024-2025", "Class 12A1 - Mathematics");
        createSchoolClass("12A2", "12A2-2024", gradeLevel12, teacher, "2024-2025", "Class 12A2 - Mathematics");
        createSchoolClass("12B1", "12B1-2024", gradeLevel12, teacher, "2024-2025", "Class 12B1 - Science");

        // Get some classes for student creation
        List<SchoolClass> allClasses = classRepository.findAll();
        if (allClasses.size() >= 2) {
            SchoolClass class6A1 = allClasses.stream().filter(c -> c.getClassName().equals("6A1")).findFirst().orElse(allClasses.get(0));
            SchoolClass class10A1 = allClasses.stream().filter(c -> c.getClassName().equals("10A1")).findFirst().orElse(allClasses.get(1));
            
            // Create students for classes
            createStudent("student1", "student1@eduboost.com", "0945678901", "Nguyen Van Nam", "S001", class6A1, studentRole, LocalDate.of(2012, 5, 15), Gender.MALE);
            createStudent("student2", "student2@eduboost.com", "0945678902", "Tran Thi Mai", "S002", class6A1, studentRole, LocalDate.of(2012, 8, 20), Gender.FEMALE);
            createStudent("student3", "student3@eduboost.com", "0945678903", "Le Van Cuong", "S003", class10A1, studentRole, LocalDate.of(2008, 3, 10), Gender.MALE);
            createStudent("student4", "student4@eduboost.com", "0945678904", "Pham Thi Linh", "S004", class10A1, studentRole, LocalDate.of(2008, 7, 25), Gender.FEMALE);
        }
    }

    private GradeLevel createGradeLevel(String gradeName) {
        GradeLevel gradeLevel = GradeLevel.builder()
                .gradeName(gradeName)
                .build();
        return gradeLevelRepository.save(gradeLevel);
    }

    private void createSchoolClass(String className, String classCode, GradeLevel gradeLevel, Teacher teacher, String schoolYear, String description) {
        SchoolClass schoolClass = SchoolClass.builder()
                .className(className)
                .classCode(classCode)
                .gradeLevel(gradeLevel)
                .teacher(teacher)
                .schoolYear(schoolYear)
                .description(description)
                .status("ACTIVE")
                .build();
        classRepository.save(schoolClass);
    }

    private void createStudent(String username, String email, String phone, String fullName,
                               String studentCode, SchoolClass schoolClass,
                               Role studentRole, LocalDate dateOfBirth, Gender gender) {
        User studentUser = User.builder()
                .username(username)
                .email(email)
                .phone(phone)
                .password(passwordEncoder.encode("student123"))
                .fullName(fullName)
                .isVerify(true)
                .tokenVersion(0)
                .roles(Set.of(studentRole))
                .build();
        User savedStudent = userRepository.save(studentUser);

        Student student = Student.builder()
                .user(savedStudent)
                .studentCode(studentCode)
                .schoolClass(schoolClass)
                .dateOfBirth(dateOfBirth)
                .gender(gender)
                .enrollmentDate(LocalDate.of(2024, 9, 1))
                .status(StudentStatus.ACTIVE)
                .build();
        studentRepository.save(student);
    }
}

