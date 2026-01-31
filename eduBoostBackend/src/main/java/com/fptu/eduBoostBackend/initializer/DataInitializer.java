package com.fptu.eduBoostBackend.initializer;


import com.fptu.eduBoostBackend.entities.Parent;
import com.fptu.eduBoostBackend.entities.Role;
import com.fptu.eduBoostBackend.entities.Teacher;
import com.fptu.eduBoostBackend.entities.User;
import com.fptu.eduBoostBackend.repositories.ParentRepository;
import com.fptu.eduBoostBackend.repositories.RoleRepository;
import com.fptu.eduBoostBackend.repositories.TeacherRepository;
import com.fptu.eduBoostBackend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

import static com.fptu.eduBoostBackend.constant.PredefinedRole.*;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final TeacherRepository teacherRepository;
    private final ParentRepository parentRepository;
    private final PasswordEncoder passwordEncoder;
    private final TeacherRepository teacherRepository;
    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return;
        }
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

        Role teacherRole = roleRepository.findByName("TEACHER").orElseThrow();
        User teacherUser = User.builder()
                .username("teacher")
                .email("teacher@eduboost.com")
                .phone("0123456789")
                .password(passwordEncoder.encode("teacher123"))
                .isVerify(true)
                .tokenVersion(0)
                .roles(Set.of(teacherRole))
                .build();
        userRepository.save(teacherUser);
        Teacher teacher = Teacher.builder()
                .user(teacherUser)

                .build();

        teacherRepository.save(teacher);

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


}


