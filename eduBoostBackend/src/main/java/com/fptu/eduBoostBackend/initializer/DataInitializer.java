package com.fptu.eduBoostBackend.initializer;


import java.time.LocalDate;
import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import static com.fptu.eduBoostBackend.constant.PredefinedRole.ADMIN_ROLE;
import static com.fptu.eduBoostBackend.constant.PredefinedRole.STUDENT_ROLE;
import static com.fptu.eduBoostBackend.constant.PredefinedRole.TEACH_ROLE;
import com.fptu.eduBoostBackend.entities.Parent;
import com.fptu.eduBoostBackend.entities.Role;
import com.fptu.eduBoostBackend.entities.Student;
import com.fptu.eduBoostBackend.entities.Teacher;
import com.fptu.eduBoostBackend.entities.User;
import com.fptu.eduBoostBackend.entities.enums.Gender;
import com.fptu.eduBoostBackend.entities.enums.StudentStatus;
import com.fptu.eduBoostBackend.repositories.ClassRepository;
import com.fptu.eduBoostBackend.repositories.ParentRepository;
import com.fptu.eduBoostBackend.repositories.RoleRepository;
import com.fptu.eduBoostBackend.repositories.StudentRepository;
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
    private final ClassRepository classRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return;
        }
        initializeRoles();
        initializeUsers();
        initializeClasses();
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

        // Create Class 10A1
        com.fptu.eduBoostBackend.entities.Class class10A1 = com.fptu.eduBoostBackend.entities.Class.builder()
                .className("10A1")
                .classCode("10A1-2024")
                .gradeLevel("10")
                .teacher(teacher)
                .schoolYear("2024-2025")
                .description("Class 10A1 - Mathematics")
                .status("ACTIVE")
                .build();
        classRepository.save(class10A1);

        // Create Class 10A2
        com.fptu.eduBoostBackend.entities.Class class10A2 = com.fptu.eduBoostBackend.entities.Class.builder()
                .className("10A2")
                .classCode("10A2-2024")
                .gradeLevel("10")
                .teacher(teacher)
                .schoolYear("2024-2025")
                .description("Class 10A2 - Mathematics")
                .status("ACTIVE")
                .build();
        classRepository.save(class10A2);

        // Create students for Class 10A1
        createStudent("student1", "student1@eduboost.com", "0945678901", "Nguyen Van Nam", "S001", class10A1, studentRole, LocalDate.of(2008, 5, 15), Gender.MALE);
        createStudent("student2", "student2@eduboost.com", "0945678902", "Tran Thi Mai", "S002", class10A1, studentRole, LocalDate.of(2008, 8, 20), Gender.FEMALE);
        createStudent("student3", "student3@eduboost.com", "0945678903", "Le Van Tuan", "S003", class10A1, studentRole, LocalDate.of(2008, 3, 10), Gender.MALE);
        createStudent("student4", "student4@eduboost.com", "0945678904", "Pham Thi Lan", "S004", class10A1, studentRole, LocalDate.of(2008, 12, 5), Gender.FEMALE);
        createStudent("student5", "student5@eduboost.com", "0945678905", "Hoang Van Long", "S005", class10A1, studentRole, LocalDate.of(2008, 7, 25), Gender.MALE);

        // Create students for Class 10A2
        createStudent("student6", "student6@eduboost.com", "0945678906", "Vu Thi Hoa", "S006", class10A2, studentRole, LocalDate.of(2008, 4, 18), Gender.FEMALE);
        createStudent("student7", "student7@eduboost.com", "0945678907", "Dang Van Minh", "S007", class10A2, studentRole, LocalDate.of(2008, 9, 22), Gender.MALE);
        createStudent("student8", "student8@eduboost.com", "0945678908", "Bui Thi Huong", "S008", class10A2, studentRole, LocalDate.of(2008, 6, 30), Gender.FEMALE);
        createStudent("student9", "student9@eduboost.com", "0945678909", "Ngo Van Hai", "S009", class10A2, studentRole, LocalDate.of(2008, 11, 12), Gender.MALE);
        createStudent("student10", "student10@eduboost.com", "0945678910", "Do Thi Thao", "S010", class10A2, studentRole, LocalDate.of(2008, 2, 8), Gender.FEMALE);
    }

    private void createStudent(String username, String email, String phone, String fullName, 
                               String studentCode, com.fptu.eduBoostBackend.entities.Class classEntity, 
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
                .classEntity(classEntity)
                .dateOfBirth(dateOfBirth)
                .gender(gender)
                .enrollmentDate(LocalDate.of(2024, 9, 1))
                .status(StudentStatus.ACTIVE)
                .build();
        studentRepository.save(student);
    }
}


