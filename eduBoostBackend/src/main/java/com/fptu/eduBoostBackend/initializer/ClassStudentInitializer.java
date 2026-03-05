package com.fptu.eduBoostBackend.initializer;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.entities.enums.Gender;
import com.fptu.eduBoostBackend.entities.enums.StudentStatus;
import com.fptu.eduBoostBackend.repositories.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ClassStudentInitializer {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final GradeLevelRepository gradeLevelRepository;
    private final ClassRepository classRepository;
    private final PasswordEncoder passwordEncoder;

    public void init() {
        List<Teacher> teachers = teacherRepository.findAll();
        Teacher teacher1 = teachers.size() > 0 ? teachers.get(0) : null;
        Teacher teacher2 = teachers.size() > 1 ? teachers.get(1) : teacher1;
        Teacher teacher3 = teachers.size() > 2 ? teachers.get(2) : teacher1;
        Teacher teacher4 = teachers.size() > 3 ? teachers.get(3) : teacher1;
        Teacher teacher5 = teachers.size() > 4 ? teachers.get(4) : teacher1;

        Role studentRole = roleRepository.findByName("STUDENT").orElseThrow();

        GradeLevel gl6  = createGradeLevel("6");
        GradeLevel gl7  = createGradeLevel("7");
        GradeLevel gl8  = createGradeLevel("8");
        GradeLevel gl9  = createGradeLevel("9");
        GradeLevel gl10 = createGradeLevel("10");
        GradeLevel gl11 = createGradeLevel("11");
        GradeLevel gl12 = createGradeLevel("12");

        // Grade 6
        SchoolClass c6A1 = createSchoolClass("6A1", "6A1-2024", gl6, teacher1, "2024-2025", "Class 6A1 - General");
        SchoolClass c6A2 = createSchoolClass("6A2", "6A2-2024", gl6, teacher2, "2024-2025", "Class 6A2 - General");
        SchoolClass c6B1 = createSchoolClass("6B1", "6B1-2024", gl6, teacher3, "2024-2025", "Class 6B1 - Advanced");
        // Grade 7
        SchoolClass c7A1 = createSchoolClass("7A1", "7A1-2024", gl7, teacher2, "2024-2025", "Class 7A1 - General");
        SchoolClass c7A2 = createSchoolClass("7A2", "7A2-2024", gl7, teacher4, "2024-2025", "Class 7A2 - General");
        SchoolClass c7B1 = createSchoolClass("7B1", "7B1-2024", gl7, teacher5, "2024-2025", "Class 7B1 - Advanced");
        // Grade 8
        SchoolClass c8A1 = createSchoolClass("8A1", "8A1-2024", gl8, teacher3, "2024-2025", "Class 8A1 - General");
        SchoolClass c8A2 = createSchoolClass("8A2", "8A2-2024", gl8, teacher1, "2024-2025", "Class 8A2 - General");
        SchoolClass c8B1 = createSchoolClass("8B1", "8B1-2024", gl8, teacher4, "2024-2025", "Class 8B1 - Advanced");
        // Grade 9
        SchoolClass c9A1 = createSchoolClass("9A1", "9A1-2024", gl9, teacher4, "2024-2025", "Class 9A1 - General");
        SchoolClass c9A2 = createSchoolClass("9A2", "9A2-2024", gl9, teacher5, "2024-2025", "Class 9A2 - General");
        SchoolClass c9B1 = createSchoolClass("9B1", "9B1-2024", gl9, teacher2, "2024-2025", "Class 9B1 - Advanced");
        // Grade 10
        SchoolClass c10A1 = createSchoolClass("10A1", "10A1-2024", gl10, teacher1, "2024-2025", "Class 10A1 - Mathematics");
        SchoolClass c10A2 = createSchoolClass("10A2", "10A2-2024", gl10, teacher2, "2024-2025", "Class 10A2 - Mathematics");
        SchoolClass c10B1 = createSchoolClass("10B1", "10B1-2024", gl10, teacher3, "2024-2025", "Class 10B1 - Science");
        // Grade 11
        SchoolClass c11A1 = createSchoolClass("11A1", "11A1-2024", gl11, teacher2, "2024-2025", "Class 11A1 - Mathematics");
        SchoolClass c11A2 = createSchoolClass("11A2", "11A2-2024", gl11, teacher4, "2024-2025", "Class 11A2 - Mathematics");
        SchoolClass c11B1 = createSchoolClass("11B1", "11B1-2024", gl11, teacher5, "2024-2025", "Class 11B1 - Science");
        // Grade 12
        SchoolClass c12A1 = createSchoolClass("12A1", "12A1-2024", gl12, teacher3, "2024-2025", "Class 12A1 - Mathematics");
        SchoolClass c12A2 = createSchoolClass("12A2", "12A2-2024", gl12, teacher4, "2024-2025", "Class 12A2 - Mathematics");
        SchoolClass c12B1 = createSchoolClass("12B1", "12B1-2024", gl12, teacher5, "2024-2025", "Class 12B1 - Science");

        int counter = 1;
        counter = createStudentsForClass(c6A1,  studentRole, counter, 2012);
        counter = createStudentsForClass(c6A2,  studentRole, counter, 2012);
        counter = createStudentsForClass(c6B1,  studentRole, counter, 2012);
        counter = createStudentsForClass(c7A1,  studentRole, counter, 2011);
        counter = createStudentsForClass(c7A2,  studentRole, counter, 2011);
        counter = createStudentsForClass(c7B1,  studentRole, counter, 2011);
        counter = createStudentsForClass(c8A1,  studentRole, counter, 2010);
        counter = createStudentsForClass(c8A2,  studentRole, counter, 2010);
        counter = createStudentsForClass(c8B1,  studentRole, counter, 2010);
        counter = createStudentsForClass(c9A1,  studentRole, counter, 2009);
        counter = createStudentsForClass(c9A2,  studentRole, counter, 2009);
        counter = createStudentsForClass(c9B1,  studentRole, counter, 2009);
        counter = createStudentsForClass(c10A1, studentRole, counter, 2008);
        counter = createStudentsForClass(c10A2, studentRole, counter, 2008);
        counter = createStudentsForClass(c10B1, studentRole, counter, 2008);
        counter = createStudentsForClass(c11A1, studentRole, counter, 2007);
        counter = createStudentsForClass(c11A2, studentRole, counter, 2007);
        counter = createStudentsForClass(c11B1, studentRole, counter, 2007);
        counter = createStudentsForClass(c12A1, studentRole, counter, 2006);
        counter = createStudentsForClass(c12A2, studentRole, counter, 2006);
        counter = createStudentsForClass(c12B1, studentRole, counter, 2006);
    }

    private GradeLevel createGradeLevel(String gradeName) {
        return gradeLevelRepository.save(GradeLevel.builder().gradeName(gradeName).build());
    }

    private SchoolClass createSchoolClass(String className, String classCode, GradeLevel gradeLevel,
                                          Teacher teacher, String schoolYear, String description) {
        return classRepository.save(SchoolClass.builder()
                .className(className).classCode(classCode).gradeLevel(gradeLevel)
                .teacher(teacher).schoolYear(schoolYear).description(description).status("ACTIVE").build());
    }

    private int createStudentsForClass(SchoolClass schoolClass, Role studentRole, int startCounter, int birthYear) {
        int numStudents = 3 + (startCounter % 3);
        String[] maleNames   = {"Nguyen Van An", "Tran Van Binh", "Le Van Cuong", "Pham Van Dung", "Hoang Van Em"};
        String[] femaleNames = {"Tran Thi Mai",  "Le Thi Lan",    "Pham Thi Hoa", "Nguyen Thi Kim", "Hoang Thi Trang"};
        for (int i = 0; i < numStudents; i++) {
            int num = startCounter + i;
            Gender gender;
            String fullName;
            if (i % 2 == 0) {
                gender   = Gender.MALE;
                fullName = maleNames[i % maleNames.length] + " " + num;
            } else {
                gender   = Gender.FEMALE;
                fullName = femaleNames[i % femaleNames.length] + " " + num;
            }
            int month = 1 + (num % 12);
            int day   = 1 + (num % 28);
            createStudent("student" + num, "student" + num + "@eduboost.com",
                    "0945678" + String.format("%04d", num), fullName,
                    "S" + String.format("%04d", num), schoolClass, studentRole,
                    LocalDate.of(birthYear, month, day), gender);
        }
        return startCounter + numStudents;
    }

    private void createStudent(String username, String email, String phone, String fullName,
                               String studentCode, SchoolClass schoolClass, Role studentRole,
                               LocalDate dateOfBirth, Gender gender) {
        User savedUser = userRepository.save(User.builder()
                .username(username).email(email).phone(phone)
                .password(passwordEncoder.encode("student123")).fullName(fullName)
                .isVerify(true).tokenVersion(0).roles(Set.of(studentRole)).build());
        studentRepository.save(Student.builder()
                .user(savedUser).studentCode(studentCode).schoolClass(schoolClass)
                .dateOfBirth(dateOfBirth).gender(gender)
                .enrollmentDate(LocalDate.of(2024, 9, 1)).status(StudentStatus.ACTIVE).build());
    }
}
