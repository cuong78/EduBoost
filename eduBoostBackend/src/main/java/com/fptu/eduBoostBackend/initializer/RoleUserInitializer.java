package com.fptu.eduBoostBackend.initializer;

import java.util.Set;

import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.repositories.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import static com.fptu.eduBoostBackend.constant.PredefinedRole.ADMIN_ROLE;
import static com.fptu.eduBoostBackend.constant.PredefinedRole.STUDENT_ROLE;
import static com.fptu.eduBoostBackend.constant.PredefinedRole.TEACH_ROLE;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class RoleUserInitializer {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final TeacherRepository teacherRepository;
    private final ParentRepository parentRepository;
    private final PasswordEncoder passwordEncoder;

    public void init() {
        initializeRoles();
        initializeUsers();
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

        // Create multiple teachers
        Role teacherRole = roleRepository.findByName("TEACHER").orElseThrow();

        User savedTeacher1 = userRepository.save(User.builder()
                .username("teacher1").email("teacher1@eduboost.com").phone("0912345678")
                .password(passwordEncoder.encode("teacher123")).fullName("Nguyen Van A")
                .isVerify(true).tokenVersion(0).roles(Set.of(teacherRole)).build());
        teacherRepository.save(Teacher.builder().user(savedTeacher1).employeeCode("T001").subject("Mathematics").build());

        User savedTeacher2 = userRepository.save(User.builder()
                .username("teacher2").email("teacher2@eduboost.com").phone("0912345679")
                .password(passwordEncoder.encode("teacher123")).fullName("Tran Thi B")
                .isVerify(true).tokenVersion(0).roles(Set.of(teacherRole)).build());
        teacherRepository.save(Teacher.builder().user(savedTeacher2).employeeCode("T002").subject("Physics").build());

        User savedTeacher3 = userRepository.save(User.builder()
                .username("teacher3").email("teacher3@eduboost.com").phone("0912345680")
                .password(passwordEncoder.encode("teacher123")).fullName("Le Van C")
                .isVerify(true).tokenVersion(0).roles(Set.of(teacherRole)).build());
        teacherRepository.save(Teacher.builder().user(savedTeacher3).employeeCode("T003").subject("Chemistry").build());

        User savedTeacher4 = userRepository.save(User.builder()
                .username("teacher4").email("teacher4@eduboost.com").phone("0912345681")
                .password(passwordEncoder.encode("teacher123")).fullName("Pham Thi D")
                .isVerify(true).tokenVersion(0).roles(Set.of(teacherRole)).build());
        teacherRepository.save(Teacher.builder().user(savedTeacher4).employeeCode("T004").subject("English").build());

        User savedTeacher5 = userRepository.save(User.builder()
                .username("teacher5").email("teacher5@eduboost.com").phone("0912345682")
                .password(passwordEncoder.encode("teacher123")).fullName("Hoang Van E")
                .isVerify(true).tokenVersion(0).roles(Set.of(teacherRole)).build());
        teacherRepository.save(Teacher.builder().user(savedTeacher5).employeeCode("T005").subject("Literature").build());

        // Parents
        Role parentRole = roleRepository.findByName("PARENT").orElseThrow();

        User savedParent1 = userRepository.save(User.builder()
                .username("parent1").email("parent1@eduboost.com").phone("0923456789")
                .password(passwordEncoder.encode("parent123")).fullName("Tran Thi B")
                .isVerify(true).tokenVersion(0).roles(Set.of(parentRole)).build());
        parentRepository.save(Parent.builder().user(savedParent1).occupation("Business Owner").build());

        User savedParent2 = userRepository.save(User.builder()
                .username("parent2").email("parent2@eduboost.com").phone("0934567890")
                .password(passwordEncoder.encode("parent123")).fullName("Le Van C")
                .isVerify(true).tokenVersion(0).roles(Set.of(parentRole)).build());
        parentRepository.save(Parent.builder().user(savedParent2).occupation("Engineer").build());
    }
}
