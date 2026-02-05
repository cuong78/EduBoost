package com.fptu.eduBoostBackend.initializer;


import java.time.LocalDate;
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
import com.fptu.eduBoostBackend.entities.Subject;
import com.fptu.eduBoostBackend.entities.Teacher;
import com.fptu.eduBoostBackend.entities.User;
import com.fptu.eduBoostBackend.entities.enums.Gender;
import com.fptu.eduBoostBackend.entities.enums.LessonResourceType;
import com.fptu.eduBoostBackend.entities.enums.StudentStatus;
import com.fptu.eduBoostBackend.entities.CognitiveLevel;
import com.fptu.eduBoostBackend.repositories.ChapterRepository;
import com.fptu.eduBoostBackend.repositories.ClassRepository;
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
        Subject Science = Subject.builder()
                .subjectCode("KHTN")
                .description("Khoa Học Tự Nhiên ")
                .build();
        subjectRepository.save(Science);


    }

    private void initializeChaptersAndLessons() {
        // Get subjects
        Subject math = subjectRepository.findBySubjectCode("TOAN").orElse(null);
        Subject physics = subjectRepository.findBySubjectCode("LY").orElse(null);
        Subject chemistry = subjectRepository.findBySubjectCode("HOA").orElse(null);
        Subject science = subjectRepository.findBySubjectCode("KHTN").orElse(null);

        if (math != null) {
            // Toán 10 - Chương 1



            Chapter G6Chap1 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(6)
                    .chapterNumber(1)
                    .chapterName("Tập hợp các số tự nhiên")
                    .description("Chương 1: Tập hợp các số tự nhiên")
                    .build();
            chapterRepository.save(G6Chap1);


            Lesson MathG6C1L1 = Lesson.builder()
                    .chapter(G6Chap1)
                    .lessonNumber(1)
                    .lessonName("Tập hợp")
                    .description("Bài 1: Tập hợp")
                    .build();
            lessonRepository.save(MathG6C1L1);
            Lesson MathG6C1L2 = Lesson.builder()
                    .chapter(G6Chap1)
                    .lessonNumber(2)
                    .lessonName("Cách ghi số tự nhiên")
                    .description("Bài 2: Cách ghi số tự nhiên")
                    .build();
            lessonRepository.save(MathG6C1L2);
            Lesson MathG6C1L3 = Lesson.builder()
                    .chapter(G6Chap1)
                    .lessonNumber(3)
                    .lessonName("Thứ tự trong tập hợp các số tự nhiên")
                    .description("Bài 3: Thứ tự trong tập hợp các số tự nhiên")
                    .build();
            lessonRepository.save(MathG6C1L3);
            Lesson MathG6C1L4 = Lesson.builder()
                    .chapter(G6Chap1)
                    .lessonNumber(4)
                    .lessonName("Phép cộng và phép trừ số tự nhiên")
                    .description("Bài 4: Phép cộng và phép trừ số tự nhiên")
                    .build();
            lessonRepository.save(MathG6C1L4);
            Lesson MathG6C1L5 = Lesson.builder()
                    .chapter(G6Chap1)
                    .lessonNumber(5)
                    .lessonName("Phép nhân và phép chia số tự nhiên")
                    .description("Bài 5: Phép nhân và phép chia số tự nhiên")
                    .build();
            lessonRepository.save(MathG6C1L5);
            Lesson MathG6C1L6 = Lesson.builder()
                    .chapter(G6Chap1)
                    .lessonNumber(6)
                    .lessonName("Lũy thừa với số mũ tự nhiên")
                    .description("Bài 6: Lũy thừa với số mũ tự nhiên")
                    .build();
            lessonRepository.save(MathG6C1L6);
            Lesson MathG6C1L7 = Lesson.builder()
                    .chapter(G6Chap1)
                    .lessonNumber(7)
                    .lessonName("Thứ tự thực hiện các phép tính")
                    .description("Bài 7: Thứ tự thực hiện các phép tính")
                    .build();
            lessonRepository.save(MathG6C1L7);
            Lesson MathG6C1L8 = Lesson.builder()
                    .chapter(G6Chap1)
                    .lessonNumber(8)
                    .lessonName("Bài tập cuối Chương 1 trang 28")
                    .description("Bài tập cuối Chương 1 trang 28")
                    .build();
            lessonRepository.save(MathG6C1L8);

            Chapter G6Chap2 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(6)
                    .chapterNumber(2)
                    .chapterName("Tính chia hết trong tập hợp các số tự nhiên")
                    .description("Chương 2: Tính chia hết trong tập hợp các số tự nhiên")
                    .build();
            chapterRepository.save(G6Chap2);

            Lesson MathG6C2L1 = Lesson.builder()
                    .chapter(G6Chap2)
                    .lessonNumber(9)
                    .lessonName("Quan hệ chia hết và tính chất")
                    .description("Bài 8: Quan hệ chia hết và tính chất")
                    .build();
            lessonRepository.save(MathG6C2L1);
            Lesson MathG6C2L2 = Lesson.builder()
                    .chapter(G6Chap2)
                    .lessonNumber(10)
                    .lessonName("Dấu hiệu chia hết")
                    .description("Bài 9: Dấu hiệu chia hết")
                    .build();
            lessonRepository.save(MathG6C2L2);
            Lesson MathG6C2L3 = Lesson.builder()
                    .chapter(G6Chap2)
                    .lessonNumber(11)
                    .lessonName("Số nguyên tố")
                    .description("Bài 10: Số nguyên tố")
                    .build();
            lessonRepository.save(MathG6C2L3);
            Lesson MathG6C2L4 = Lesson.builder()
                    .chapter(G6Chap2)
                    .lessonNumber(12)
                    .lessonName("Ước chung. Ước chung lớn nhất")
                    .description("Bài 11: Ước chung. Ước chung lớn nhất")
                    .build();
            lessonRepository.save(MathG6C2L4);
            Lesson MathG6C2L5 = Lesson.builder()
                    .chapter(G6Chap2)
                    .lessonNumber(13)
                    .lessonName("Bội chung. Bội chung nhỏ nhất")
                    .description("Bài 12: Bội chung. Bội chung nhỏ nhất")
                    .build();
            lessonRepository.save(MathG6C2L5);
            Lesson MathG6C2L6 = Lesson.builder()
                    .chapter(G6Chap2)
                    .lessonNumber(14)
                    .lessonName("Bài tập cuối Chương 2 trang 56")
                    .description("Bài tập cuối Chương 2 trang 56")
                    .build();
            lessonRepository.save(MathG6C2L6);

            Chapter G6Chap3 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(6)
                    .chapterNumber(3)
                    .chapterName("Số nguyên")
                    .description("Chương 3: Số nguyên")
                    .build();
            chapterRepository.save(G6Chap3);
            Lesson MathG6C3L1 = Lesson.builder()
                    .chapter(G6Chap3)
                    .lessonNumber(15)
                    .lessonName("Tập hợp các số nguyên")
                    .description("Bài 13: Tập hợp các số nguyên")
                    .build();
            lessonRepository.save(MathG6C3L1);
            Lesson MathG6C3L2 = Lesson.builder()
                    .chapter(G6Chap3)
                    .lessonNumber(16)
                    .lessonName("Phép cộng và phép trừ số nguyên")
                    .description("Bài 14: Phép cộng và phép trừ số nguyên")
                    .build();
            lessonRepository.save(MathG6C3L2);
            Lesson MathG6C3L3 = Lesson.builder()
                    .chapter(G6Chap3)
                    .lessonNumber(17)
                    .lessonName("Quy tắc dấu ngoặc")
                    .description("Bài 15: Quy tắc dấu ngoặc")
                    .build();
            lessonRepository.save(MathG6C3L3);
            Lesson MathG6C3L4 = Lesson.builder()
                    .chapter(G6Chap3)
                    .lessonNumber(18)
                    .lessonName("Phép nhân số nguyên")
                    .description("Bài 16: Phép nhân số nguyên")
                    .build();
            lessonRepository.save(MathG6C3L4);
            Lesson MathG6C3L5 = Lesson.builder()
                    .chapter(G6Chap3)
                    .lessonNumber(19)
                    .lessonName("Phép chia hết. Ước và bội của một số nguyên")
                    .description("Bài 17: Phép chia hết. Ước và bội của một số nguyên")
                    .build();
            lessonRepository.save(MathG6C3L5);
            Lesson MathG6C3L6 = Lesson.builder()
                    .chapter(G6Chap3)
                    .lessonNumber(20)
                    .lessonName("Bài tập cuối Chương 3 trang 76")
                    .description("Bài tập cuối Chương 3 trang 76")
                    .build();
            lessonRepository.save(MathG6C3L6);

            Chapter G6Chap4= Chapter.builder()
                    .subject(math)
                    .gradeLevel(6)
                    .chapterNumber(4)
                    .chapterName("Một số hình phẳng trong thực tiễn")
                    .description("Chương 4: Một số hình phẳng trong thực tiễn")
                    .build();
            chapterRepository.save(G6Chap4);
            Lesson MathG6C4L1 = Lesson.builder()
                    .chapter(G6Chap4)
                    .lessonNumber(21)
                    .lessonName("Hình tam giác đều. hình vuông. hình lục giác đều")
                    .description("Bài 18: Hình tam giác đều. hình vuông. hình lục giác đều")
                    .build();
            lessonRepository.save(MathG6C4L1);
            Lesson MathG6C4L2 = Lesson.builder()
                    .chapter(G6Chap4)
                    .lessonNumber(22)
                    .lessonName("hình chữ nhật. Hình thoi hình bình hành. Hình thang cân")
                    .description("Bài 19: hình chữ nhật. Hình thoi hình bình hành. Hình thang cân")
                    .build();
            lessonRepository.save(MathG6C4L2);
            Lesson MathG6C4L3 = Lesson.builder()
                    .chapter(G6Chap4)
                    .lessonNumber(23)
                    .lessonName("Chu vi và diện tích của một số tứ giác đã học")
                    .description("Bài 20: Chu vi và diện tích của một số tứ giác đã học")
                    .build();
            lessonRepository.save(MathG6C4L3);
            Lesson MathG6C4L4 = Lesson.builder()
                    .chapter(G6Chap4)
                    .lessonNumber(24)
                    .lessonName("Bài tập cuối Chương 4 trang 97")
                    .description("Bài tập cuối Chương 4 trang 97")
                    .build();
            lessonRepository.save(MathG6C4L4);
            Chapter G6Chap5= Chapter.builder()
                    .subject(math)
                    .gradeLevel(6)
                    .chapterNumber(5)
                    .chapterName("Tính đối xứng của hình phẳng trong tự nhiên")
                    .description("Chương 5: Tính đối xứng của hình phẳng trong tự nhiên")
                    .build();
            chapterRepository.save(G6Chap5);
            Lesson MathG6C5L1 = Lesson.builder()
                    .chapter(G6Chap5)
                    .lessonNumber(25)
                    .lessonName("Hình có trục đối xứng")
                    .description("Bài 21: Hình có trục đối xứng")
                    .build();
            lessonRepository.save(MathG6C5L1);
            Lesson MathG6C5L2 = Lesson.builder()
                    .chapter(G6Chap5)
                    .lessonNumber(26)
                    .lessonName("Hình có tâm đối xứng")
                    .description("Bài 22: Hình có tâm đối xứng")
                    .build();
            lessonRepository.save(MathG6C5L2);
            Lesson MathG6C5L3 = Lesson.builder()
                    .chapter(G6Chap5)
                    .lessonNumber(27)
                    .lessonName("Bài tập cuối Chương 5 trang 110")
                    .description("Bài tập cuối Chương 5 trang 110")
                    .build();
            lessonRepository.save(MathG6C5L3);
            Chapter G6Chap6= Chapter.builder()
                    .subject(math)
                    .gradeLevel(6)
                    .chapterNumber(6)
                    .chapterName("Phân số")
                    .description("Chương 6: Phân số")
                    .build();
            chapterRepository.save(G6Chap6);

            Lesson MathG6C6L1 = Lesson.builder()
                    .chapter(G6Chap6)
                    .lessonNumber(28)
                    .lessonName("Bài 23: Mở rộng phân số. Phân số bằng nhau")
                    .description("Mở rộng phân số. Phân số bằng nhau")
                    .build();
            lessonRepository.save(MathG6C6L1);
            Lesson MathG6C6L2 = Lesson.builder()
                    .chapter(G6Chap6)
                    .lessonNumber(29)
                    .lessonName("Bài 24: So sánh phân số. Hỗn số dương")
                    .description("So sánh phân số. Hỗn số dương")
                    .build();
            lessonRepository.save(MathG6C6L2);
            Lesson MathG6C6L3 = Lesson.builder()
                    .chapter(G6Chap6)
                    .lessonNumber(30)
                    .lessonName("Bài 25: Mở rộng phân số. Phân số bằng nhau")
                    .description("Mở rộng phân số. Phân số bằng nhau")
                    .build();
            lessonRepository.save(MathG6C6L3);
            Lesson MathG6C6L4 = Lesson.builder()
                    .chapter(G6Chap6)
                    .lessonNumber(31)
                    .lessonName("Phép nhân và phép chia phân số")
                    .description("Bài 26: Phép nhân và phép chia phân số")
                    .build();
            lessonRepository.save(MathG6C6L4);
            Lesson MathG6C6L5 = Lesson.builder()
                    .chapter(G6Chap6)
                    .lessonNumber(32)
                    .lessonName("Hai bài toán về phân số")
                    .description("Bài 27: Hai bài toán về phân số")
                    .build();
            lessonRepository.save(MathG6C6L5);
            Lesson MathG6C6L6 = Lesson.builder()
                    .chapter(G6Chap6)
                    .lessonNumber(33)
                    .lessonName("Bài tập cuối chương 6 trang 27")
                    .description("Bài tập cuối chương 6 trang 27")
                    .build();
            lessonRepository.save(MathG6C6L6);
            Chapter G6Chap7= Chapter.builder()
                    .subject(math)
                    .gradeLevel(6)
                    .chapterNumber(7)
                    .chapterName("Số thập phân")
                    .description("Chương 7: Số thập phân")
                    .build();
            chapterRepository.save(G6Chap7);
            Lesson MathG6C7L1 = Lesson.builder()
                    .chapter(G6Chap7)
                    .lessonNumber(34)
                    .lessonName("Số thập phân")
                    .description("Bài 28: Số thập phân")
                    .build();
            lessonRepository.save(MathG6C7L1);
            Lesson MathG6C7L2 = Lesson.builder()
                    .chapter(G6Chap7)
                    .lessonNumber(35)
                    .lessonName("Tính toán với số thập phân")
                    .description("Bài 29: Tính toán với số thập phân")
                    .build();
            lessonRepository.save(MathG6C7L2);

            Lesson MathG6C7L3 = Lesson.builder()
                    .chapter(G6Chap7)
                    .lessonNumber(36)
                    .lessonName("Làm tròn và ước lượng")
                    .description("Bài 30: Làm tròn và ước lượng")
                    .build();
            lessonRepository.save(MathG6C7L3);
            Lesson MathG6C7L4 = Lesson.builder()
                    .chapter(G6Chap7)
                    .lessonNumber(37)
                    .lessonName("Một số bài toán về tỉ số và tỉ số phần trăm")
                    .description("Bài 31: Một số bài toán về tỉ số và tỉ số phần trăm")
                    .build();
            lessonRepository.save(MathG6C7L4);
            Lesson MathG6C7L5 = Lesson.builder()
                    .chapter(G6Chap7)
                    .lessonNumber(38)
                    .lessonName("Bài tập cuối chương 7 trang 42")
                    .description("Bài tập cuối chương 7 trang 42")
                    .build();
            lessonRepository.save(MathG6C7L5);
            Chapter G6Chap8= Chapter.builder()
                    .subject(math)
                    .gradeLevel(6)
                    .chapterNumber(8)
                    .chapterName("Những hình học cơ bảnn")
                    .description("Chương 8: Những hình học cơ bản")
                    .build();
            chapterRepository.save(G6Chap8);
            Lesson MathG6C8L1 = Lesson.builder()
                    .chapter(G6Chap8)
                    .lessonNumber(39)
                    .lessonName("Điểm và đường thẳng")
                    .description("Bài 32: Điểm và đường thẳng")
                    .build();
            lessonRepository.save(MathG6C8L1);
            Lesson MathG6C8L2 = Lesson.builder()
                    .chapter(G6Chap8)
                    .lessonNumber(40)
                    .lessonName("Điểm nằm giữa hai điểm. Tia")
                    .description("Bài 33: Điểm nằm giữa hai điểm. Tia")
                    .build();
            lessonRepository.save(MathG6C8L2);
            Lesson MathG6C8L3 = Lesson.builder()
                    .chapter(G6Chap8)
                    .lessonNumber(41)
                    .lessonName("Đoạn thẳng. Độ dài đoạn thẳng")
                    .description("Bài 34: Đoạn thẳng. Độ dài đoạn thẳng")
                    .build();
            lessonRepository.save(MathG6C8L3);
            Lesson MathG6C8L4 = Lesson.builder()
                    .chapter(G6Chap8)
                    .lessonNumber(42)
                    .lessonName("Trung điểm của đoạn thẳng")
                    .description("Bài 35: Trung điểm của đoạn thẳng")
                    .build();
            lessonRepository.save(MathG6C8L4);
            Lesson MathG6C8L5 = Lesson.builder()
                    .chapter(G6Chap8)
                    .lessonNumber(43)
                    .lessonName("Góc")
                    .description("Bài 36: Góc")
                    .build();
            lessonRepository.save(MathG6C8L5);
            Lesson MathG6C8L6 = Lesson.builder()
                    .chapter(G6Chap7)
                    .lessonNumber(43)
                    .lessonName("Số đo góc")
                    .description("Bài 37: Số đo góc")
                    .build();
            lessonRepository.save(MathG6C8L6);
            Lesson MathG6C8L7 = Lesson.builder()
                    .chapter(G6Chap8)
                    .lessonNumber(44)
                    .lessonName("Bài tập ôn cuối chương 8 trang 67")
                    .description("Bài tập ôn cuối chương 8 trang 67")
                    .build();
            lessonRepository.save(MathG6C8L7);


            Chapter G6Chap9= Chapter.builder()
                    .subject(math)
                    .gradeLevel(6)
                    .chapterNumber(9)
                    .chapterName("Dữ liệu và xác suất thực nghiệm")
                    .description("Chương 9: Dữ liệu và xác suất thực nghiệm")
                    .build();
            chapterRepository.save(G6Chap9);
            Lesson MathG6C9L1 = Lesson.builder()
                    .chapter(G6Chap9)
                    .lessonNumber(45)
                    .lessonName("Dữ liệu và thu thập dữ liệu")
                    .description("Bài 38: Dữ liệu và thu thập dữ liệu")
                    .build();
            lessonRepository.save(MathG6C9L1);
            Lesson MathG6C9L2 = Lesson.builder()
                    .chapter(G6Chap9)
                    .lessonNumber(46)
                    .lessonName("Bảng thống kê và biểu đồ tranh")
                    .description("Bài 39: Bảng thống kê và biểu đồ tranh")
                    .build();
            lessonRepository.save(MathG6C9L2);
            Lesson MathG6C9L3 = Lesson.builder()
                    .chapter(G6Chap9)
                    .lessonNumber(47)
                    .lessonName("Biểu đồ cột")
                    .description("Bài 40: Biểu đồ cột")
                    .build();
            lessonRepository.save(MathG6C9L3);
            Lesson MathG6C9L4 = Lesson.builder()
                    .chapter(G6Chap9)
                    .lessonNumber(48)
                    .lessonName("Biểu đồ cột kép")
                    .description("Bài 41: Biểu đồ cột kép")
                    .build();
            lessonRepository.save(MathG6C9L4);
            Lesson MathG6C9L5 = Lesson.builder()
                    .chapter(G6Chap9)
                    .lessonNumber(49)
                    .lessonName("Kết quả có thể và sự kiện trong trò chơi, thí nghiệm")
                    .description("Bài 42: Kết quả có thể và sự kiện trong trò chơi, thí nghiệm")
                    .build();
            lessonRepository.save(MathG6C9L5);
            Lesson MathG6C9L6 = Lesson.builder()
                    .chapter(G6Chap9)
                    .lessonNumber(50)
                    .lessonName("Xác suất thực nghiệm")
                    .description("Bài 43: Xác suất thực nghiệm")
                    .build();
            lessonRepository.save(MathG6C9L6);

// Chapter 1: Số hữu tỉ
            Chapter G7Chap1 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(7)
                    .chapterNumber(1)
                    .chapterName("Số hữu tỉ")
                    .description("Chương 1: Số hữu tỉ")
                    .build();
            chapterRepository.save(G7Chap1);

            Lesson MathG7C1L1 = Lesson.builder()
                    .chapter(G7Chap1)
                    .lessonNumber(1)
                    .lessonName("Tập hợp các số hữu tỉ")
                    .description("Bài 1: Tập hợp các số hữu tỉ")
                    .build();
            lessonRepository.save(MathG7C1L1);

            Lesson MathG7C1L2 = Lesson.builder()
                    .chapter(G7Chap1)
                    .lessonNumber(2)
                    .lessonName("Cộng, trừ, nhân, chia số hữu tỉ")
                    .description("Bài 2: Cộng, trừ, nhân, chia số hữu tỉ")
                    .build();
            lessonRepository.save(MathG7C1L2);

            Lesson MathG7C1L3 = Lesson.builder()
                    .chapter(G7Chap1)
                    .lessonNumber(3)
                    .lessonName("Lũy thừa với số mũ tự nhiên của một số hữu tỉ")
                    .description("Bài 3: Lũy thừa với số mũ tự nhiên của một số hữu tỉ")
                    .build();
            lessonRepository.save(MathG7C1L3);

            Lesson MathG7C1L4 = Lesson.builder()
                    .chapter(G7Chap1)
                    .lessonNumber(4)
                    .lessonName("Thứ tự thực hiện các phép tính. Quy tắc chuyển vế")
                    .description("Bài 4: Thứ tự thực hiện các phép tính. Quy tắc chuyển vế")
                    .build();
            lessonRepository.save(MathG7C1L4);

            Lesson MathG7C1L5 = Lesson.builder()
                    .chapter(G7Chap1)
                    .lessonNumber(5)
                    .lessonName("Bài tập cuối chương I")
                    .description("Bài tập cuối chương I")
                    .build();
            lessonRepository.save(MathG7C1L5);

            Lesson MathG7C1L6 = Lesson.builder()
                    .chapter(G7Chap1)
                    .lessonNumber(6)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 1")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 1")
                    .build();
            lessonRepository.save(MathG7C1L6);

// Chapter 2: Số thực
            Chapter G7Chap2 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(7)
                    .chapterNumber(2)
                    .chapterName("Số thực")
                    .description("Chương 2: Số thực")
                    .build();
            chapterRepository.save(G7Chap2);

            Lesson MathG7C2L1 = Lesson.builder()
                    .chapter(G7Chap2)
                    .lessonNumber(7)
                    .lessonName("Làm quen với số thập phân vô hạn tuần hoàn")
                    .description("Bài 5: Làm quen với số thập phân vô hạn tuần hoàn")
                    .build();
            lessonRepository.save(MathG7C2L1);

            Lesson MathG7C2L2 = Lesson.builder()
                    .chapter(G7Chap2)
                    .lessonNumber(8)
                    .lessonName("Số vô tỉ. Căn bậc hai số học")
                    .description("Bài 6: Số vô tỉ. Căn bậc hai số học")
                    .build();
            lessonRepository.save(MathG7C2L2);

            Lesson MathG7C2L3 = Lesson.builder()
                    .chapter(G7Chap2)
                    .lessonNumber(9)
                    .lessonName("Tập hợp các số thực")
                    .description("Bài 7: Tập hợp các số thực")
                    .build();
            lessonRepository.save(MathG7C2L3);

            Lesson MathG7C2L4 = Lesson.builder()
                    .chapter(G7Chap2)
                    .lessonNumber(10)
                    .lessonName("Bài tập cuối chương II")
                    .description("Bài tập cuối chương II")
                    .build();
            lessonRepository.save(MathG7C2L4);

            Lesson MathG7C2L5 = Lesson.builder()
                    .chapter(G7Chap2)
                    .lessonNumber(11)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 2")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 2")
                    .build();
            lessonRepository.save(MathG7C2L5);

// Chapter 3: Góc và đường thẳng song song
            Chapter G7Chap3 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(7)
                    .chapterNumber(3)
                    .chapterName("Góc và đường thẳng song song")
                    .description("Chương 3: Góc và đường thẳng song song")
                    .build();
            chapterRepository.save(G7Chap3);

            Lesson MathG7C3L1 = Lesson.builder()
                    .chapter(G7Chap3)
                    .lessonNumber(12)
                    .lessonName("Góc ở vị trí đặc biệt. Tia phân giác của một góc")
                    .description("Bài 8: Góc ở vị trí đặc biệt. Tia phân giác của một góc")
                    .build();
            lessonRepository.save(MathG7C3L1);

            Lesson MathG7C3L2 = Lesson.builder()
                    .chapter(G7Chap3)
                    .lessonNumber(13)
                    .lessonName("Hai đường thẳng song song và dấu hiệu nhận biết")
                    .description("Bài 9: Hai đường thẳng song song và dấu hiệu nhận biết")
                    .build();
            lessonRepository.save(MathG7C3L2);

            Lesson MathG7C3L3 = Lesson.builder()
                    .chapter(G7Chap3)
                    .lessonNumber(14)
                    .lessonName("Tiên đề Euclid. Tính chất của hai đường thẳng song song")
                    .description("Bài 10: Tiên đề Euclid. Tính chất của hai đường thẳng song song")
                    .build();
            lessonRepository.save(MathG7C3L3);

            Lesson MathG7C3L4 = Lesson.builder()
                    .chapter(G7Chap3)
                    .lessonNumber(15)
                    .lessonName("Định lí và chứng minh định lí")
                    .description("Bài 11: Định lí và chứng minh định lí")
                    .build();
            lessonRepository.save(MathG7C3L4);

            Lesson MathG7C3L5 = Lesson.builder()
                    .chapter(G7Chap3)
                    .lessonNumber(16)
                    .lessonName("Bài tập cuối chương III")
                    .description("Bài tập cuối chương III")
                    .build();
            lessonRepository.save(MathG7C3L5);
            // Chapter 4: Tam giác bằng nhau
            Chapter G7Chap4 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(7)
                    .chapterNumber(4)
                    .chapterName("Tam giác bằng nhau")
                    .description("Chương 4: Tam giác bằng nhau")
                    .build();
            chapterRepository.save(G7Chap4);

            Lesson MathG7C4L1 = Lesson.builder()
                    .chapter(G7Chap4)
                    .lessonNumber(17)
                    .lessonName("Tổng các góc trong một tam giác")
                    .description("Bài 12: Tổng các góc trong một tam giác")
                    .build();
            lessonRepository.save(MathG7C4L1);

            Lesson MathG7C4L2 = Lesson.builder()
                    .chapter(G7Chap4)
                    .lessonNumber(18)
                    .lessonName("Hai tam giác bằng nhau. Trường hợp bằng nhau thứ nhất của tam giác")
                    .description("Bài 13: Hai tam giác bằng nhau. Trường hợp bằng nhau thứ nhất của tam giác")
                    .build();
            lessonRepository.save(MathG7C4L2);

            Lesson MathG7C4L3 = Lesson.builder()
                    .chapter(G7Chap4)
                    .lessonNumber(19)
                    .lessonName("Trường hợp bằng nhau thứ hai và thứ ba của tam giác")
                    .description("Bài 14: Trường hợp bằng nhau thứ hai và thứ ba của tam giác")
                    .build();
            lessonRepository.save(MathG7C4L3);

            Lesson MathG7C4L4 = Lesson.builder()
                    .chapter(G7Chap4)
                    .lessonNumber(20)
                    .lessonName("Các trường hợp bằng nhau của tam giác vuông")
                    .description("Bài 15: Các trường hợp bằng nhau của tam giác vuông")
                    .build();
            lessonRepository.save(MathG7C4L4);

            Lesson MathG7C4L5 = Lesson.builder()
                    .chapter(G7Chap4)
                    .lessonNumber(21)
                    .lessonName("Tam giác cân. Đường trung trực của đoạn thẳng")
                    .description("Bài 16: Tam giác cân. Đường trung trực của đoạn thẳng")
                    .build();
            lessonRepository.save(MathG7C4L5);

            Lesson MathG7C4L6 = Lesson.builder()
                    .chapter(G7Chap4)
                    .lessonNumber(22)
                    .lessonName("Bài tập cuối chương IV")
                    .description("Bài tập cuối chương IV")
                    .build();
            lessonRepository.save(MathG7C4L6);

// Chapter 5: Thu thập và biểu diễn dữ liệu
            Chapter G7Chap5 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(7)
                    .chapterNumber(5)
                    .chapterName("Thu thập và biểu diễn dữ liệu")
                    .description("Chương 5: Thu thập và biểu diễn dữ liệu")
                    .build();
            chapterRepository.save(G7Chap5);

            Lesson MathG7C5L1 = Lesson.builder()
                    .chapter(G7Chap5)
                    .lessonNumber(23)
                    .lessonName("Thu thập và phân loại dữ liệu")
                    .description("Bài 17: Thu thập và phân loại dữ liệu")
                    .build();
            lessonRepository.save(MathG7C5L1);

            Lesson MathG7C5L2 = Lesson.builder()
                    .chapter(G7Chap5)
                    .lessonNumber(24)
                    .lessonName("Biểu đồ hình quạt tròn")
                    .description("Bài 18: Biểu đồ hình quạt tròn")
                    .build();
            lessonRepository.save(MathG7C5L2);

            Lesson MathG7C5L3 = Lesson.builder()
                    .chapter(G7Chap5)
                    .lessonNumber(25)
                    .lessonName("Biểu đồ đoạn thẳng")
                    .description("Bài 19: Biểu đồ đoạn thẳng")
                    .build();
            lessonRepository.save(MathG7C5L3);

            Lesson MathG7C5L4 = Lesson.builder()
                    .chapter(G7Chap5)
                    .lessonNumber(26)
                    .lessonName("Bài tập cuối chương V")
                    .description("Bài tập cuối chương V")
                    .build();
            lessonRepository.save(MathG7C5L4);

// Chapter 6: Tỉ lệ thức và đại lượng tỉ lệ
            Chapter G7Chap6 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(7)
                    .chapterNumber(6)
                    .chapterName("Tỉ lệ thức và đại lượng tỉ lệ")
                    .description("Chương 6: Tỉ lệ thức và đại lượng tỉ lệ")
                    .build();
            chapterRepository.save(G7Chap6);

            Lesson MathG7C6L1 = Lesson.builder()
                    .chapter(G7Chap6)
                    .lessonNumber(27)
                    .lessonName("Tỉ lệ thức")
                    .description("Bài 20: Tỉ lệ thức")
                    .build();
            lessonRepository.save(MathG7C6L1);

            Lesson MathG7C6L2 = Lesson.builder()
                    .chapter(G7Chap6)
                    .lessonNumber(28)
                    .lessonName("Tính chất của dãy tỉ số bằng nhau")
                    .description("Bài 21: Tính chất của dãy tỉ số bằng nhau")
                    .build();
            lessonRepository.save(MathG7C6L2);

            Lesson MathG7C6L3 = Lesson.builder()
                    .chapter(G7Chap6)
                    .lessonNumber(29)
                    .lessonName("Đại lượng tỉ lệ thuận")
                    .description("Bài 22: Đại lượng tỉ lệ thuận")
                    .build();
            lessonRepository.save(MathG7C6L3);

            Lesson MathG7C6L4 = Lesson.builder()
                    .chapter(G7Chap6)
                    .lessonNumber(30)
                    .lessonName("Đại lượng tỉ lệ nghịch")
                    .description("Bài 23: Đại lượng tỉ lệ nghịch")
                    .build();
            lessonRepository.save(MathG7C6L4);

            Lesson MathG7C6L5 = Lesson.builder()
                    .chapter(G7Chap6)
                    .lessonNumber(31)
                    .lessonName("Bài tập cuối chương VI")
                    .description("Bài tập cuối chương VI")
                    .build();
            lessonRepository.save(MathG7C6L5);
            // Chapter 7: Biểu thức đại số và đa thức một biến
            Chapter G7Chap7 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(7)
                    .chapterNumber(7)
                    .chapterName("Biểu thức đại số và đa thức một biến")
                    .description("Chương 7: Biểu thức đại số và đa thức một biến")
                    .build();
            chapterRepository.save(G7Chap7);

            Lesson MathG7C7L1 = Lesson.builder()
                    .chapter(G7Chap7)
                    .lessonNumber(32)
                    .lessonName("Biểu thức đại số")
                    .description("Bài 24: Biểu thức đại số")
                    .build();
            lessonRepository.save(MathG7C7L1);

            Lesson MathG7C7L2 = Lesson.builder()
                    .chapter(G7Chap7)
                    .lessonNumber(33)
                    .lessonName("Đa thức một biến")
                    .description("Bài 25: Đa thức một biến")
                    .build();
            lessonRepository.save(MathG7C7L2);

            Lesson MathG7C7L3 = Lesson.builder()
                    .chapter(G7Chap7)
                    .lessonNumber(34)
                    .lessonName("Phép cộng và phép trừ đa thức một biến")
                    .description("Bài 26: Phép cộng và phép trừ đa thức một biến")
                    .build();
            lessonRepository.save(MathG7C7L3);

            Lesson MathG7C7L4 = Lesson.builder()
                    .chapter(G7Chap7)
                    .lessonNumber(35)
                    .lessonName("Phép nhân đa thức một biến")
                    .description("Bài 27: Phép nhân đa thức một biến")
                    .build();
            lessonRepository.save(MathG7C7L4);

            Lesson MathG7C7L5 = Lesson.builder()
                    .chapter(G7Chap7)
                    .lessonNumber(36)
                    .lessonName("Phép chia đa thức một biến")
                    .description("Bài 28: Phép chia đa thức một biến")
                    .build();
            lessonRepository.save(MathG7C7L5);

            Lesson MathG7C7L6 = Lesson.builder()
                    .chapter(G7Chap7)
                    .lessonNumber(37)
                    .lessonName("Bài tập cuối chương VII")
                    .description("Bài tập cuối chương VII")
                    .build();
            lessonRepository.save(MathG7C7L6);

// Chapter 8: Làm quen với biến cố và xác suất của biến cố
            Chapter G7Chap8 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(7)
                    .chapterNumber(8)
                    .chapterName("Làm quen với biến cố và xác suất của biến cố")
                    .description("Chương 8: Làm quen với biến cố và xác suất của biến cố")
                    .build();
            chapterRepository.save(G7Chap8);

            Lesson MathG7C8L1 = Lesson.builder()
                    .chapter(G7Chap8)
                    .lessonNumber(38)
                    .lessonName("Làm quen với biến cố")
                    .description("Bài 29: Làm quen với biến cố")
                    .build();
            lessonRepository.save(MathG7C8L1);

            Lesson MathG7C8L2 = Lesson.builder()
                    .chapter(G7Chap8)
                    .lessonNumber(39)
                    .lessonName("Làm quen với xác suất của biến cố")
                    .description("Bài 30: Làm quen với xác suất của biến cố")
                    .build();
            lessonRepository.save(MathG7C8L2);

            Lesson MathG7C8L3 = Lesson.builder()
                    .chapter(G7Chap8)
                    .lessonNumber(40)
                    .lessonName("Bài tập cuối chương VIII")
                    .description("Bài tập cuối chương VIII")
                    .build();
            lessonRepository.save(MathG7C8L3);

// Chapter 9: Quan hệ giữa các yếu tố trong một tam giác
            Chapter G7Chap9 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(7)
                    .chapterNumber(9)
                    .chapterName("Quan hệ giữa các yếu tố trong một tam giác")
                    .description("Chương 9: Quan hệ giữa các yếu tố trong một tam giác")
                    .build();
            chapterRepository.save(G7Chap9);

            Lesson MathG7C9L1 = Lesson.builder()
                    .chapter(G7Chap9)
                    .lessonNumber(41)
                    .lessonName("Quan hệ giữa góc và cạnh đối diện trong một tam giác")
                    .description("Bài 31: Quan hệ giữa góc và cạnh đối diện trong một tam giác")
                    .build();
            lessonRepository.save(MathG7C9L1);

            Lesson MathG7C9L2 = Lesson.builder()
                    .chapter(G7Chap9)
                    .lessonNumber(42)
                    .lessonName("Quan hệ giữa đường vuông góc và đường xiên")
                    .description("Bài 32: Quan hệ giữa đường vuông góc và đường xiên")
                    .build();
            lessonRepository.save(MathG7C9L2);

            Lesson MathG7C9L3 = Lesson.builder()
                    .chapter(G7Chap9)
                    .lessonNumber(43)
                    .lessonName("Quan hệ giữa ba cạnh của một tam giác")
                    .description("Bài 33: Quan hệ giữa ba cạnh của một tam giác")
                    .build();
            lessonRepository.save(MathG7C9L3);

            Lesson MathG7C9L4 = Lesson.builder()
                    .chapter(G7Chap9)
                    .lessonNumber(44)
                    .lessonName("Sự đồng quy của ba đường trung tuyến, ba đường phân giác trong một tam giác")
                    .description("Bài 34: Sự đồng quy của ba đường trung tuyến, ba đường phân giác trong một tam giác")
                    .build();
            lessonRepository.save(MathG7C9L4);

            Lesson MathG7C9L5 = Lesson.builder()
                    .chapter(G7Chap9)
                    .lessonNumber(45)
                    .lessonName("Sự đồng quy của ba đường trực, ba đường cao trong một tam giác")
                    .description("Bài 35: Sự đồng quy của ba đường trực, ba đường cao trong một tam giác")
                    .build();
            lessonRepository.save(MathG7C9L5);

// Chapter 10: Một số hình khối trong thực tiễn
            Chapter G7Chap10 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(7)
                    .chapterNumber(10)
                    .chapterName("Một số hình khối trong thực tiễn")
                    .description("Chương 10: Một số hình khối trong thực tiễn")
                    .build();
            chapterRepository.save(G7Chap10);

            Lesson MathG7C10L1 = Lesson.builder()
                    .chapter(G7Chap10)
                    .lessonNumber(46)
                    .lessonName("Hình hộp chữ nhật và hình lập phương")
                    .description("Bài 36: Hình hộp chữ nhật và hình lập phương")
                    .build();
            lessonRepository.save(MathG7C10L1);

            Lesson MathG7C10L2 = Lesson.builder()
                    .chapter(G7Chap10)
                    .lessonNumber(47)
                    .lessonName("Luyện tập trang 92")
                    .description("Luyện tập trang 92")
                    .build();
            lessonRepository.save(MathG7C10L2);

            Lesson MathG7C10L3 = Lesson.builder()
                    .chapter(G7Chap10)
                    .lessonNumber(48)
                    .lessonName("Hình lăng trụ đứng tam giác và hình lăng trụ đứng tứ giác")
                    .description("Bài 37: Hình lăng trụ đứng tam giác và hình lăng trụ đứng tứ giác")
                    .build();
            lessonRepository.save(MathG7C10L3);
            // Grade 8 Math - Chapter 1: Đa thức
            Chapter G8Chap1 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(8)
                    .chapterNumber(1)
                    .chapterName("Đa thức")
                    .description("Chương 1: Đa thức")
                    .build();
            chapterRepository.save(G8Chap1);

            Lesson MathG8C1L1 = Lesson.builder()
                    .chapter(G8Chap1)
                    .lessonNumber(1)
                    .lessonName("Đơn thức")
                    .description("Bài 1: Đơn thức")
                    .build();
            lessonRepository.save(MathG8C1L1);

            Lesson MathG8C1L2 = Lesson.builder()
                    .chapter(G8Chap1)
                    .lessonNumber(2)
                    .lessonName("Đa thức")
                    .description("Bài 2: Đa thức")
                    .build();
            lessonRepository.save(MathG8C1L2);

            Lesson MathG8C1L3 = Lesson.builder()
                    .chapter(G8Chap1)
                    .lessonNumber(3)
                    .lessonName("Phép cộng và phép trừ đa thức")
                    .description("Bài 3: Phép cộng và phép trừ đa thức")
                    .build();
            lessonRepository.save(MathG8C1L3);

            Lesson MathG8C1L4 = Lesson.builder()
                    .chapter(G8Chap1)
                    .lessonNumber(4)
                    .lessonName("Phép nhân đa thức")
                    .description("Bài 4: Phép nhân đa thức")
                    .build();
            lessonRepository.save(MathG8C1L4);

            Lesson MathG8C1L5 = Lesson.builder()
                    .chapter(G8Chap1)
                    .lessonNumber(5)
                    .lessonName("Phép chia đa thức cho đơn thức")
                    .description("Bài 5: Phép chia đa thức cho đơn thức")
                    .build();
            lessonRepository.save(MathG8C1L5);

            Lesson MathG8C1L6 = Lesson.builder()
                    .chapter(G8Chap1)
                    .lessonNumber(6)
                    .lessonName("Bài tập cuối chương 1")
                    .description("Bài tập cuối chương 1")
                    .build();
            lessonRepository.save(MathG8C1L6);

// Chapter 2: Hằng đẳng thức đáng nhớ và ứng dụng
            Chapter G8Chap2 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(8)
                    .chapterNumber(2)
                    .chapterName("Hằng đẳng thức đáng nhớ và ứng dụng")
                    .description("Chương 2: Hằng đẳng thức đáng nhớ và ứng dụng")
                    .build();
            chapterRepository.save(G8Chap2);

            Lesson MathG8C2L1 = Lesson.builder()
                    .chapter(G8Chap2)
                    .lessonNumber(7)
                    .lessonName("Hiệu hai bình phương. Bình phương của một tổng hay một hiệu")
                    .description("Bài 6: Hiệu hai bình phương. Bình phương của một tổng hay một hiệu")
                    .build();
            lessonRepository.save(MathG8C2L1);

            Lesson MathG8C2L2 = Lesson.builder()
                    .chapter(G8Chap2)
                    .lessonNumber(8)
                    .lessonName("Lập phương của một tổng hay một hiệu")
                    .description("Bài 7: Lập phương của một tổng hay một hiệu")
                    .build();
            lessonRepository.save(MathG8C2L2);

            Lesson MathG8C2L3 = Lesson.builder()
                    .chapter(G8Chap2)
                    .lessonNumber(9)
                    .lessonName("Tổng và hiệu hai lập phương")
                    .description("Bài 8: Tổng và hiệu hai lập phương")
                    .build();
            lessonRepository.save(MathG8C2L3);

            Lesson MathG8C2L4 = Lesson.builder()
                    .chapter(G8Chap2)
                    .lessonNumber(10)
                    .lessonName("Phân tích đa thức thành nhân tử")
                    .description("Bài 9: Phân tích đa thức thành nhân tử")
                    .build();
            lessonRepository.save(MathG8C2L4);

            Lesson MathG8C2L5 = Lesson.builder()
                    .chapter(G8Chap2)
                    .lessonNumber(11)
                    .lessonName("Bài tập cuối chương 2")
                    .description("Bài tập cuối chương 2")
                    .build();
            lessonRepository.save(MathG8C2L5);

// Chapter 3: Tứ giác
            Chapter G8Chap3 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(8)
                    .chapterNumber(3)
                    .chapterName("Tứ giác")
                    .description("Chương 3: Tứ giác")
                    .build();
            chapterRepository.save(G8Chap3);

            Lesson MathG8C3L1 = Lesson.builder()
                    .chapter(G8Chap3)
                    .lessonNumber(12)
                    .lessonName("Tứ giác")
                    .description("Bài 10: Tứ giác")
                    .build();
            lessonRepository.save(MathG8C3L1);

            Lesson MathG8C3L2 = Lesson.builder()
                    .chapter(G8Chap3)
                    .lessonNumber(13)
                    .lessonName("Hình thang cân")
                    .description("Bài 11: Hình thang cân")
                    .build();
            lessonRepository.save(MathG8C3L2);

            Lesson MathG8C3L3 = Lesson.builder()
                    .chapter(G8Chap3)
                    .lessonNumber(14)
                    .lessonName("Hình bình hành")
                    .description("Bài 12: Hình bình hành")
                    .build();
            lessonRepository.save(MathG8C3L3);

            Lesson MathG8C3L4 = Lesson.builder()
                    .chapter(G8Chap3)
                    .lessonNumber(15)
                    .lessonName("Hình chữ nhật")
                    .description("Bài 13: Hình chữ nhật")
                    .build();
            lessonRepository.save(MathG8C3L4);

            Lesson MathG8C3L5 = Lesson.builder()
                    .chapter(G8Chap3)
                    .lessonNumber(16)
                    .lessonName("Hình thoi và hình vuông")
                    .description("Bài 14: Hình thoi và hình vuông")
                    .build();
            lessonRepository.save(MathG8C3L5);

            Lesson MathG8C3L6 = Lesson.builder()
                    .chapter(G8Chap3)
                    .lessonNumber(17)
                    .lessonName("Bài tập cuối chương 3")
                    .description("Bài tập cuối chương 3")
                    .build();
            lessonRepository.save(MathG8C3L6);

// Chapter 4: Định lí Thalès
            Chapter G8Chap4 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(8)
                    .chapterNumber(4)
                    .chapterName("Định lí Thalès")
                    .description("Chương 4: Định lí Thalès")
                    .build();
            chapterRepository.save(G8Chap4);

            Lesson MathG8C4L1 = Lesson.builder()
                    .chapter(G8Chap4)
                    .lessonNumber(18)
                    .lessonName("Định lí Thales trong tam giác")
                    .description("Bài 15: Định lí Thales trong tam giác")
                    .build();
            lessonRepository.save(MathG8C4L1);

            Lesson MathG8C4L2 = Lesson.builder()
                    .chapter(G8Chap4)
                    .lessonNumber(19)
                    .lessonName("Đường trung bình của tam giác")
                    .description("Bài 16: Đường trung bình của tam giác")
                    .build();
            lessonRepository.save(MathG8C4L2);

            Lesson MathG8C4L3 = Lesson.builder()
                    .chapter(G8Chap4)
                    .lessonNumber(20)
                    .lessonName("Tính chất đường phân giác của tam giác")
                    .description("Bài 17: Tính chất đường phân giác của tam giác")
                    .build();
            lessonRepository.save(MathG8C4L3);

            Lesson MathG8C4L4 = Lesson.builder()
                    .chapter(G8Chap4)
                    .lessonNumber(21)
                    .lessonName("Bài tập cuối chương 4")
                    .description("Bài tập cuối chương 4")
                    .build();
            lessonRepository.save(MathG8C4L4);

// Chapter 5: Dữ liệu và biểu đồ
            Chapter G8Chap5 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(8)
                    .chapterNumber(5)
                    .chapterName("Dữ liệu và biểu đồ")
                    .description("Chương 5: Dữ liệu và biểu đồ")
                    .build();
            chapterRepository.save(G8Chap5);

            Lesson MathG8C5L1 = Lesson.builder()
                    .chapter(G8Chap5)
                    .lessonNumber(22)
                    .lessonName("Thu thập và phân loại dữ liệu")
                    .description("Bài 18: Thu thập và phân loại dữ liệu")
                    .build();
            lessonRepository.save(MathG8C5L1);

            Lesson MathG8C5L2 = Lesson.builder()
                    .chapter(G8Chap5)
                    .lessonNumber(23)
                    .lessonName("Biểu diễn dữ liệu bằng bảng, biểu đồ")
                    .description("Bài 19: Biểu diễn dữ liệu bằng bảng, biểu đồ")
                    .build();
            lessonRepository.save(MathG8C5L2);

            Lesson MathG8C5L3 = Lesson.builder()
                    .chapter(G8Chap5)
                    .lessonNumber(24)
                    .lessonName("Phân tích số liệu thống kê dựa vào biểu đồ")
                    .description("Bài 20: Phân tích số liệu thống kê dựa vào biểu đồ")
                    .build();
            lessonRepository.save(MathG8C5L3);

            Lesson MathG8C5L4 = Lesson.builder()
                    .chapter(G8Chap5)
                    .lessonNumber(25)
                    .lessonName("Bài tập cuối chương 5")
                    .description("Bài tập cuối chương 5")
                    .build();
            lessonRepository.save(MathG8C5L4);

// Chapter 6: Phân thức Đại số
            Chapter G8Chap6 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(8)
                    .chapterNumber(6)
                    .chapterName("Phân thức Đại số")
                    .description("Chương 6: Phân thức Đại số")
                    .build();
            chapterRepository.save(G8Chap6);

            Lesson MathG8C6L1 = Lesson.builder()
                    .chapter(G8Chap6)
                    .lessonNumber(26)
                    .lessonName("Phân thức Đại số")
                    .description("Bài 21: Phân thức Đại số")
                    .build();
            lessonRepository.save(MathG8C6L1);

            Lesson MathG8C6L2 = Lesson.builder()
                    .chapter(G8Chap6)
                    .lessonNumber(27)
                    .lessonName("Tính chất cơ bản của phân thức đại số")
                    .description("Bài 22: Tính chất cơ bản của phân thức đại số")
                    .build();
            lessonRepository.save(MathG8C6L2);

            Lesson MathG8C6L3 = Lesson.builder()
                    .chapter(G8Chap6)
                    .lessonNumber(28)
                    .lessonName("Phép cộng và phép trừ phân thức đại số")
                    .description("Bài 23: Phép cộng và phép trừ phân thức đại số")
                    .build();
            lessonRepository.save(MathG8C6L3);

            Lesson MathG8C6L4 = Lesson.builder()
                    .chapter(G8Chap6)
                    .lessonNumber(29)
                    .lessonName("Phép nhân và phép chia phân thức đại số")
                    .description("Bài 24: Phép nhân và phép chia phân thức đại số")
                    .build();
            lessonRepository.save(MathG8C6L4);

            Lesson MathG8C6L5 = Lesson.builder()
                    .chapter(G8Chap6)
                    .lessonNumber(30)
                    .lessonName("Bài tập cuối chương 6")
                    .description("Bài tập cuối chương 6")
                    .build();
            lessonRepository.save(MathG8C6L5);

// Chapter 7: Phương trình bậc nhất và hàm số bậc nhất
            Chapter G8Chap7 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(8)
                    .chapterNumber(7)
                    .chapterName("Phương trình bậc nhất và hàm số bậc nhất")
                    .description("Chương 7: Phương trình bậc nhất và hàm số bậc nhất")
                    .build();
            chapterRepository.save(G8Chap7);

            Lesson MathG8C7L1 = Lesson.builder()
                    .chapter(G8Chap7)
                    .lessonNumber(31)
                    .lessonName("Phương trình bậc nhất một ẩn")
                    .description("Bài 25: Phương trình bậc nhất một ẩn")
                    .build();
            lessonRepository.save(MathG8C7L1);

            Lesson MathG8C7L2 = Lesson.builder()
                    .chapter(G8Chap7)
                    .lessonNumber(32)
                    .lessonName("Giải bài toán bằng cách lập phương trình")
                    .description("Bài 26: Giải bài toán bằng cách lập phương trình")
                    .build();
            lessonRepository.save(MathG8C7L2);

            Lesson MathG8C7L3 = Lesson.builder()
                    .chapter(G8Chap7)
                    .lessonNumber(33)
                    .lessonName("Khái niệm hàm số và đồ thị hàm số")
                    .description("Bài 27: Khái niệm hàm số và đồ thị hàm số")
                    .build();
            lessonRepository.save(MathG8C7L3);

            Lesson MathG8C7L4 = Lesson.builder()
                    .chapter(G8Chap7)
                    .lessonNumber(34)
                    .lessonName("Hàm số bậc nhất và đồ thị của hàm số bậc nhất")
                    .description("Bài 28: Hàm số bậc nhất và đồ thị của hàm số bậc nhất")
                    .build();
            lessonRepository.save(MathG8C7L4);

            Lesson MathG8C7L5 = Lesson.builder()
                    .chapter(G8Chap7)
                    .lessonNumber(35)
                    .lessonName("Hệ số góc của đường thẳng")
                    .description("Bài 29: Hệ số góc của đường thẳng")
                    .build();
            lessonRepository.save(MathG8C7L5);

            Lesson MathG8C7L6 = Lesson.builder()
                    .chapter(G8Chap7)
                    .lessonNumber(36)
                    .lessonName("Bài tập cuối chương 7")
                    .description("Bài tập cuối chương 7")
                    .build();
            lessonRepository.save(MathG8C7L6);

// Chapter 8: Mở đầu về tính xác suất của biến cố
            Chapter G8Chap8 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(8)
                    .chapterNumber(8)
                    .chapterName("Mở đầu về tính xác suất của biến cố")
                    .description("Chương 8: Mở đầu về tính xác suất của biến cố")
                    .build();
            chapterRepository.save(G8Chap8);

            Lesson MathG8C8L1 = Lesson.builder()
                    .chapter(G8Chap8)
                    .lessonNumber(37)
                    .lessonName("Kết quả có thể và kết quả thuận lợi")
                    .description("Bài 30: Kết quả có thể và kết quả thuận lợi")
                    .build();
            lessonRepository.save(MathG8C8L1);

            Lesson MathG8C8L2 = Lesson.builder()
                    .chapter(G8Chap8)
                    .lessonNumber(38)
                    .lessonName("Cách tính xác suất của biến cố bằng tỉ số")
                    .description("Bài 31: Cách tính xác suất của biến cố bằng tỉ số")
                    .build();
            lessonRepository.save(MathG8C8L2);

            Lesson MathG8C8L3 = Lesson.builder()
                    .chapter(G8Chap8)
                    .lessonNumber(39)
                    .lessonName("Mối liên hệ giữa xác suất thực nghiệm với xác suất và ứng dụng")
                    .description("Bài 32: Mối liên hệ giữa xác suất thực nghiệm với xác suất và ứng dụng")
                    .build();
            lessonRepository.save(MathG8C8L3);

            Lesson MathG8C8L4 = Lesson.builder()
                    .chapter(G8Chap8)
                    .lessonNumber(40)
                    .lessonName("Bài tập cuối chương 8")
                    .description("Bài tập cuối chương 8")
                    .build();
            lessonRepository.save(MathG8C8L4);

// Chapter 9: Tam giác đồng dạng
            Chapter G8Chap9 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(8)
                    .chapterNumber(9)
                    .chapterName("Tam giác đồng dạng")
                    .description("Chương 9: Tam giác đồng dạng")
                    .build();
            chapterRepository.save(G8Chap9);

            Lesson MathG8C9L1 = Lesson.builder()
                    .chapter(G8Chap9)
                    .lessonNumber(41)
                    .lessonName("Hai tam giác đồng dạng")
                    .description("Bài 33: Hai tam giác đồng dạng")
                    .build();
            lessonRepository.save(MathG8C9L1);

            Lesson MathG8C9L2 = Lesson.builder()
                    .chapter(G8Chap9)
                    .lessonNumber(42)
                    .lessonName("Ba trường hợp đồng dạng của hai tam giác")
                    .description("Bài 34: Ba trường hợp đồng dạng của hai tam giác")
                    .build();
            lessonRepository.save(MathG8C9L2);

            Lesson MathG8C9L3 = Lesson.builder()
                    .chapter(G8Chap9)
                    .lessonNumber(43)
                    .lessonName("Định lí Pythagore và ứng dụng")
                    .description("Bài 35: Định lí Pythagore và ứng dụng")
                    .build();
            lessonRepository.save(MathG8C9L3);

            Lesson MathG8C9L4 = Lesson.builder()
                    .chapter(G8Chap9)
                    .lessonNumber(44)
                    .lessonName("Các trường hợp đồng dạng của hai tam giác vuông")
                    .description("Bài 36: Các trường hợp đồng dạng của hai tam giác vuông")
                    .build();
            lessonRepository.save(MathG8C9L4);

            Lesson MathG8C9L5 = Lesson.builder()
                    .chapter(G8Chap9)
                    .lessonNumber(45)
                    .lessonName("Hình đồng dạng")
                    .description("Bài 37: Hình đồng dạng")
                    .build();
            lessonRepository.save(MathG8C9L5);

            Lesson MathG8C9L6 = Lesson.builder()
                    .chapter(G8Chap9)
                    .lessonNumber(46)
                    .lessonName("Bài tập cuối chương 9")
                    .description("Bài tập cuối chương 9")
                    .build();
            lessonRepository.save(MathG8C9L6);

// Chapter 10: Một số hình khối trong thực tiễn
            Chapter G8Chap10 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(8)
                    .chapterNumber(10)
                    .chapterName("Một số hình khối trong thực tiễn")
                    .description("Chương 10: Một số hình khối trong thực tiễn")
                    .build();
            chapterRepository.save(G8Chap10);

            Lesson MathG8C10L1 = Lesson.builder()
                    .chapter(G8Chap10)
                    .lessonNumber(47)
                    .lessonName("Hình chóp tam giác đều")
                    .description("Bài 38: Hình chóp tam giác đều")
                    .build();
            lessonRepository.save(MathG8C10L1);

            Lesson MathG8C10L2 = Lesson.builder()
                    .chapter(G8Chap10)
                    .lessonNumber(48)
                    .lessonName("Hình chóp tứ giác đều")
                    .description("Bài 39: Hình chóp tứ giác đều")
                    .build();
            lessonRepository.save(MathG8C10L2);

            Lesson MathG8C10L3 = Lesson.builder()
                    .chapter(G8Chap10)
                    .lessonNumber(49)
                    .lessonName("Bài tập cuối chương 10")
                    .description("Bài tập cuối chương 10")
                    .build();
            lessonRepository.save(MathG8C10L3);
            // Grade 9 Math - Chapter 1: Phương trình và hệ hai phương trình bậc nhất hai ẩn
            Chapter G9Chap1 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(9)
                    .chapterNumber(1)
                    .chapterName("Phương trình và hệ hai phương trình bậc nhất hai ẩn")
                    .description("Chương 1: Phương trình và hệ hai phương trình bậc nhất hai ẩn")
                    .build();
            chapterRepository.save(G9Chap1);

            Lesson MathG9C1L1 = Lesson.builder()
                    .chapter(G9Chap1)
                    .lessonNumber(1)
                    .lessonName("Khái niệm phương trình và hệ hai phương trình bậc nhất hai ẩn")
                    .description("Bài 1: Khái niệm phương trình và hệ hai phương trình bậc nhất hai ẩn")
                    .build();
            lessonRepository.save(MathG9C1L1);

            Lesson MathG9C1L2 = Lesson.builder()
                    .chapter(G9Chap1)
                    .lessonNumber(2)
                    .lessonName("Giải hệ hai phương trình bậc nhất hai ẩn")
                    .description("Bài 2: Giải hệ hai phương trình bậc nhất hai ẩn")
                    .build();
            lessonRepository.save(MathG9C1L2);

            Lesson MathG9C1L3 = Lesson.builder()
                    .chapter(G9Chap1)
                    .lessonNumber(3)
                    .lessonName("Giải bài toán bằng cách lập hệ phương trình")
                    .description("Bài 3: Giải bài toán bằng cách lập hệ phương trình")
                    .build();
            lessonRepository.save(MathG9C1L3);

            Lesson MathG9C1L4 = Lesson.builder()
                    .chapter(G9Chap1)
                    .lessonNumber(4)
                    .lessonName("Bài tập cuối chương 1")
                    .description("Bài tập cuối chương 1")
                    .build();
            lessonRepository.save(MathG9C1L4);

            Lesson MathG9C1L5 = Lesson.builder()
                    .chapter(G9Chap1)
                    .lessonNumber(5)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 1")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 1")
                    .build();
            lessonRepository.save(MathG9C1L5);

// Chapter 2: Phương trình và bất phương trình bậc nhất một ẩn
            Chapter G9Chap2 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(9)
                    .chapterNumber(2)
                    .chapterName("Phương trình và bất phương trình bậc nhất một ẩn")
                    .description("Chương 2: Phương trình và bất phương trình bậc nhất một ẩn")
                    .build();
            chapterRepository.save(G9Chap2);

            Lesson MathG9C2L1 = Lesson.builder()
                    .chapter(G9Chap2)
                    .lessonNumber(6)
                    .lessonName("Phương trình quy về phương trình bậc nhất một ẩn")
                    .description("Bài 4: Phương trình quy về phương trình bậc nhất một ẩn")
                    .build();
            lessonRepository.save(MathG9C2L1);

            Lesson MathG9C2L2 = Lesson.builder()
                    .chapter(G9Chap2)
                    .lessonNumber(7)
                    .lessonName("Bất đẳng thức và tính chất")
                    .description("Bài 5: Bất đẳng thức và tính chất")
                    .build();
            lessonRepository.save(MathG9C2L2);

            Lesson MathG9C2L3 = Lesson.builder()
                    .chapter(G9Chap2)
                    .lessonNumber(8)
                    .lessonName("Bất phương trình bậc nhất một ẩn")
                    .description("Bài 6: Bất phương trình bậc nhất một ẩn")
                    .build();
            lessonRepository.save(MathG9C2L3);

            Lesson MathG9C2L4 = Lesson.builder()
                    .chapter(G9Chap2)
                    .lessonNumber(9)
                    .lessonName("Bài tập cuối chương 2")
                    .description("Bài tập cuối chương 2")
                    .build();
            lessonRepository.save(MathG9C2L4);

            Lesson MathG9C2L5 = Lesson.builder()
                    .chapter(G9Chap2)
                    .lessonNumber(10)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 2")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 2")
                    .build();
            lessonRepository.save(MathG9C2L5);

// Chapter 3: Cân bậc hai và cân bậc ba
// Note: "Cân" appears to be a typo for "Căn", but keeping as shown in the image
            Chapter G9Chap3 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(9)
                    .chapterNumber(3)
                    .chapterName("Căn bậc hai và cân bậc ba")
                    .description("Chương 3: Cân bậc hai và cân bậc ba")
                    .build();
            chapterRepository.save(G9Chap3);

            Lesson MathG9C3L1 = Lesson.builder()
                    .chapter(G9Chap3)
                    .lessonNumber(11)
                    .lessonName("Cân bậc hai và cân thức bậc hai")
                    .description("Bài 7: Cân bậc hai và cân thức bậc hai")
                    .build();
            lessonRepository.save(MathG9C3L1);

            Lesson MathG9C3L2 = Lesson.builder()
                    .chapter(G9Chap3)
                    .lessonNumber(12)
                    .lessonName("Khai căn bậc hai với phép nhân và phép chia")
                    .description("Bài 8: Khai căn bậc hai với phép nhân và phép chia")
                    .build();
            lessonRepository.save(MathG9C3L2);

            Lesson MathG9C3L3 = Lesson.builder()
                    .chapter(G9Chap3)
                    .lessonNumber(13)
                    .lessonName("Biến đổi đơn giản và rút gọn biểu thức chứa căn thức bậc hai")
                    .description("Bài 9: Biến đổi đơn giản và rút gọn biểu thức chứa căn thức bậc hai")
                    .build();
            lessonRepository.save(MathG9C3L3);

            Lesson MathG9C3L4 = Lesson.builder()
                    .chapter(G9Chap3)
                    .lessonNumber(14)
                    .lessonName("Cân bậc ba và căn thức bậc ba")
                    .description("Bài 10: Cân bậc ba và căn thức bậc ba")
                    .build();
            lessonRepository.save(MathG9C3L4);

            Lesson MathG9C3L5 = Lesson.builder()
                    .chapter(G9Chap3)
                    .lessonNumber(15)
                    .lessonName("Bài tập cuối chương 3")
                    .description("Bài tập cuối chương 3")
                    .build();
            lessonRepository.save(MathG9C3L5);

            Lesson MathG9C3L6 = Lesson.builder()
                    .chapter(G9Chap3)
                    .lessonNumber(16)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 3")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 3")
                    .build();
            lessonRepository.save(MathG9C3L6);

// Chapter 4: Hệ thức lượng trong tam giác vuông
            Chapter G9Chap4 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(9)
                    .chapterNumber(4)
                    .chapterName("Hệ thức lượng trong tam giác vuông")
                    .description("Chương 4: Hệ thức lượng trong tam giác vuông")
                    .build();
            chapterRepository.save(G9Chap4);

            Lesson MathG9C4L1 = Lesson.builder()
                    .chapter(G9Chap4)
                    .lessonNumber(17)
                    .lessonName("Tỉ số lượng giác của góc nhọn")
                    .description("Bài 11: Tỉ số lượng giác của góc nhọn")
                    .build();
            lessonRepository.save(MathG9C4L1);

            Lesson MathG9C4L2 = Lesson.builder()
                    .chapter(G9Chap4)
                    .lessonNumber(18)
                    .lessonName("Một số hệ thức giữa cạnh, góc trong tam giác vuông và ứng dụng")
                    .description("Bài 12: Một số hệ thức giữa cạnh, góc trong tam giác vuông và ứng dụng")
                    .build();
            lessonRepository.save(MathG9C4L2);

            Lesson MathG9C4L3 = Lesson.builder()
                    .chapter(G9Chap4)
                    .lessonNumber(19)
                    .lessonName("Bài tập cuối chương 4")
                    .description("Bài tập cuối chương 4")
                    .build();
            lessonRepository.save(MathG9C4L3);

            Lesson MathG9C4L4 = Lesson.builder()
                    .chapter(G9Chap4)
                    .lessonNumber(20)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 4")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 4")
                    .build();
            lessonRepository.save(MathG9C4L4);

// Chapter 5: Đường tròn
            Chapter G9Chap5 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(9)
                    .chapterNumber(5)
                    .chapterName("Đường tròn")
                    .description("Chương 5: Đường tròn")
                    .build();
            chapterRepository.save(G9Chap5);

            Lesson MathG9C5L1 = Lesson.builder()
                    .chapter(G9Chap5)
                    .lessonNumber(21)
                    .lessonName("Mở đầu về đường tròn")
                    .description("Bài 13: Mở đầu về đường tròn")
                    .build();
            lessonRepository.save(MathG9C5L1);

            Lesson MathG9C5L2 = Lesson.builder()
                    .chapter(G9Chap5)
                    .lessonNumber(22)
                    .lessonName("Cung và dây của một đường tròn")
                    .description("Bài 14: Cung và dây của một đường tròn")
                    .build();
            lessonRepository.save(MathG9C5L2);

            Lesson MathG9C5L3 = Lesson.builder()
                    .chapter(G9Chap5)
                    .lessonNumber(23)
                    .lessonName("Độ dài của cung tròn. Diện tích hình quạt tròn và hình vành khuyên")
                    .description("Bài 15: Độ dài của cung tròn. Diện tích hình quạt tròn và hình vành khuyên")
                    .build();
            lessonRepository.save(MathG9C5L3);

            Lesson MathG9C5L4 = Lesson.builder()
                    .chapter(G9Chap5)
                    .lessonNumber(24)
                    .lessonName("Vị trí tương đối của đường thẳng và đường tròn")
                    .description("Bài 16: Vị trí tương đối của đường thẳng và đường tròn")
                    .build();
            lessonRepository.save(MathG9C5L4);

            Lesson MathG9C5L5 = Lesson.builder()
                    .chapter(G9Chap5)
                    .lessonNumber(25)
                    .lessonName("Vị trí tương đối của hai đường tròn")
                    .description("Bài 17: Vị trí tương đối của hai đường tròn")
                    .build();
            lessonRepository.save(MathG9C5L5);

            Lesson MathG9C5L6 = Lesson.builder()
                    .chapter(G9Chap5)
                    .lessonNumber(26)
                    .lessonName("Bài tập cuối chương 5")
                    .description("Bài tập cuối chương 5")
                    .build();
            lessonRepository.save(MathG9C5L6);

// Chapter 6: Hàm số y = ax^2 (a ≠ 0). Phương trình bậc hai một ẩn
            Chapter G9Chap6 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(9)
                    .chapterNumber(6)
                    .chapterName("Hàm số y = ax^2 (a ≠ 0). Phương trình bậc hai một ẩn")
                    .description("Chương 6: Hàm số y = ax^2 (a ≠ 0). Phương trình bậc hai một ẩn")
                    .build();
            chapterRepository.save(G9Chap6);

            Lesson MathG9C6L1 = Lesson.builder()
                    .chapter(G9Chap6)
                    .lessonNumber(27)
                    .lessonName("Hàm số y = ax^2 (a ≠ 0)")
                    .description("Bài 18: Hàm số y = ax^2 (a ≠ 0)")
                    .build();
            lessonRepository.save(MathG9C6L1);

            Lesson MathG9C6L2 = Lesson.builder()
                    .chapter(G9Chap6)
                    .lessonNumber(28)
                    .lessonName("Phương trình bậc hai một ẩn")
                    .description("Bài 19: Phương trình bậc hai một ẩn")
                    .build();
            lessonRepository.save(MathG9C6L2);

            Lesson MathG9C6L3 = Lesson.builder()
                    .chapter(G9Chap6)
                    .lessonNumber(29)
                    .lessonName("Định lí Viète và ứng dụng")
                    .description("Bài 20: Định lí Viète và ứng dụng")
                    .build();
            lessonRepository.save(MathG9C6L3);

            Lesson MathG9C6L4 = Lesson.builder()
                    .chapter(G9Chap6)
                    .lessonNumber(30)
                    .lessonName("Giải bài toán bằng cách lập phương trình")
                    .description("Bài 21: Giải bài toán bằng cách lập phương trình")
                    .build();
            lessonRepository.save(MathG9C6L4);

            Lesson MathG9C6L5 = Lesson.builder()
                    .chapter(G9Chap6)
                    .lessonNumber(31)
                    .lessonName("Bài tập cuối chương 6")
                    .description("Bài tập cuối chương 6")
                    .build();
            lessonRepository.save(MathG9C6L5);

// Chapter 7: Tần số và tần số tương đối
            Chapter G9Chap7 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(9)
                    .chapterNumber(7)
                    .chapterName("Tần số và tần số tương đối")
                    .description("Chương 7: Tần số và tần số tương đối")
                    .build();
            chapterRepository.save(G9Chap7);

            Lesson MathG9C7L1 = Lesson.builder()
                    .chapter(G9Chap7)
                    .lessonNumber(32)
                    .lessonName("Bảng tần số và biểu đồ tần số")
                    .description("Bài 22: Bảng tần số và biểu đồ tần số")
                    .build();
            lessonRepository.save(MathG9C7L1);

            Lesson MathG9C7L2 = Lesson.builder()
                    .chapter(G9Chap7)
                    .lessonNumber(33)
                    .lessonName("Bảng tần số tương đối và biểu đồ tần số tương đối")
                    .description("Bài 23: Bảng tần số tương đối và biểu đồ tần số tương đối")
                    .build();
            lessonRepository.save(MathG9C7L2);

            Lesson MathG9C7L3 = Lesson.builder()
                    .chapter(G9Chap7)
                    .lessonNumber(34)
                    .lessonName("Bảng tần số, tần số tương đối ghép nhóm và biểu đồ")
                    .description("Bài 24: Bảng tần số, tần số tương đối ghép nhóm và biểu đồ")
                    .build();
            lessonRepository.save(MathG9C7L3);

            Lesson MathG9C7L4 = Lesson.builder()
                    .chapter(G9Chap7)
                    .lessonNumber(35)
                    .lessonName("Bài tập cuối chương 7")
                    .description("Bài tập cuối chương 7")
                    .build();
            lessonRepository.save(MathG9C7L4);

// Chapter 8: Xác suất của biến cố trong một số mô hình xác suất đơn giản
            Chapter G9Chap8 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(9)
                    .chapterNumber(8)
                    .chapterName("Xác suất của biến cố trong một số mô hình xác suất đơn giản")
                    .description("Chương 8: Xác suất của biến cố trong một số mô hình xác suất đơn giản")
                    .build();
            chapterRepository.save(G9Chap8);

            Lesson MathG9C8L1 = Lesson.builder()
                    .chapter(G9Chap8)
                    .lessonNumber(36)
                    .lessonName("Phép thử ngẫu nhiên và không gian mẫu")
                    .description("Bài 25: Phép thử ngẫu nhiên và không gian mẫu")
                    .build();
            lessonRepository.save(MathG9C8L1);

            Lesson MathG9C8L2 = Lesson.builder()
                    .chapter(G9Chap8)
                    .lessonNumber(37)
                    .lessonName("Xác suất của biến cố liên quan tới phép thử")
                    .description("Bài 26: Xác suất của biến cố liên quan tới phép thử")
                    .build();
            lessonRepository.save(MathG9C8L2);

            Lesson MathG9C8L3 = Lesson.builder()
                    .chapter(G9Chap8)
                    .lessonNumber(38)
                    .lessonName("Bài tập cuối chương 8")
                    .description("Bài tập cuối chương 8")
                    .build();
            lessonRepository.save(MathG9C8L3);

// Chapter 9: Đường tròn ngoại tiếp và đường tròn nội tiếp
            Chapter G9Chap9 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(9)
                    .chapterNumber(9)
                    .chapterName("Đường tròn ngoại tiếp và đường tròn nội tiếp")
                    .description("Chương 9: Đường tròn ngoại tiếp và đường tròn nội tiếp")
                    .build();
            chapterRepository.save(G9Chap9);

            Lesson MathG9C9L1 = Lesson.builder()
                    .chapter(G9Chap9)
                    .lessonNumber(39)
                    .lessonName("Góc nội tiếp")
                    .description("Bài 27: Góc nội tiếp")
                    .build();
            lessonRepository.save(MathG9C9L1);

            Lesson MathG9C9L2 = Lesson.builder()
                    .chapter(G9Chap9)
                    .lessonNumber(40)
                    .lessonName("Đường tròn ngoại tiếp và đường tròn nội tiếp của một tam giác")
                    .description("Bài 28: Đường tròn ngoại tiếp và đường tròn nội tiếp của một tam giác")
                    .build();
            lessonRepository.save(MathG9C9L2);

            Lesson MathG9C9L3 = Lesson.builder()
                    .chapter(G9Chap9)
                    .lessonNumber(41)
                    .lessonName("Tứ giác nội tiếp")
                    .description("Bài 29: Tứ giác nội tiếp")
                    .build();
            lessonRepository.save(MathG9C9L3);

            Lesson MathG9C9L4 = Lesson.builder()
                    .chapter(G9Chap9)
                    .lessonNumber(42)
                    .lessonName("Đa giác đều")
                    .description("Bài 30: Đa giác đều")
                    .build();
            lessonRepository.save(MathG9C9L4);

            Lesson MathG9C9L5 = Lesson.builder()
                    .chapter(G9Chap9)
                    .lessonNumber(43)
                    .lessonName("Bài tập cuối chương 9")
                    .description("Bài tập cuối chương 9")
                    .build();
            lessonRepository.save(MathG9C9L5);

// Chapter 10: Một số hình khối trong thực tiễn
            Chapter G9Chap10 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(9)
                    .chapterNumber(10)
                    .chapterName("Một số hình khối trong thực tiễn")
                    .description("Chương 10: Một số hình khối trong thực tiễn")
                    .build();
            chapterRepository.save(G9Chap10);

            Lesson MathG9C10L1 = Lesson.builder()
                    .chapter(G9Chap10)
                    .lessonNumber(44)
                    .lessonName("Hình trụ và hình nón")
                    .description("Bài 31: Hình trụ và hình nón")
                    .build();
            lessonRepository.save(MathG9C10L1);

            Lesson MathG9C10L2 = Lesson.builder()
                    .chapter(G9Chap10)
                    .lessonNumber(45)
                    .lessonName("Hình cầu")
                    .description("Bài 32: Hình cầu")
                    .build();
            lessonRepository.save(MathG9C10L2);

            Lesson MathG9C10L3 = Lesson.builder()
                    .chapter(G9Chap10)
                    .lessonNumber(46)
                    .lessonName("Bài tập cuối chương 10")
                    .description("Bài tập cuối chương 10")
                    .build();
            lessonRepository.save(MathG9C10L3);
            // Grade 10 Math - Chapter 1: Mệnh đề và tập hợp
            Chapter G10Chap1 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(10)
                    .chapterNumber(1)
                    .chapterName("Mệnh đề và tập hợp")
                    .description("Chương 1: Mệnh đề và tập hợp")
                    .build();
            chapterRepository.save(G10Chap1);

            Lesson MathG10C1L1 = Lesson.builder()
                    .chapter(G10Chap1)
                    .lessonNumber(1)
                    .lessonName("Mệnh đề")
                    .description("Bài 1: Mệnh đề")
                    .build();
            lessonRepository.save(MathG10C1L1);

            Lesson MathG10C1L2 = Lesson.builder()
                    .chapter(G10Chap1)
                    .lessonNumber(2)
                    .lessonName("Tập hợp và các phép toán trên tập hợp")
                    .description("Bài 2: Tập hợp và các phép toán trên tập hợp")
                    .build();
            lessonRepository.save(MathG10C1L2);

            Lesson MathG10C1L3 = Lesson.builder()
                    .chapter(G10Chap1)
                    .lessonNumber(3)
                    .lessonName("Bài tập cuối chương I")
                    .description("Bài tập cuối chương I")
                    .build();
            lessonRepository.save(MathG10C1L3);

            Lesson MathG10C1L4 = Lesson.builder()
                    .chapter(G10Chap1)
                    .lessonNumber(4)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 1")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 1")
                    .build();
            lessonRepository.save(MathG10C1L4);

// Chapter 2: Bất phương trình và hệ bất phương trình bậc nhất hai ẩn
            Chapter G10Chap2 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(10)
                    .chapterNumber(2)
                    .chapterName("Bất phương trình và hệ bất phương trình bậc nhất hai ẩn")
                    .description("Chương 2: Bất phương trình và hệ bất phương trình bậc nhất hai ẩn")
                    .build();
            chapterRepository.save(G10Chap2);

            Lesson MathG10C2L1 = Lesson.builder()
                    .chapter(G10Chap2)
                    .lessonNumber(5)
                    .lessonName("Bất phương trình bậc nhất hai ẩn")
                    .description("Bài 3: Bất phương trình bậc nhất hai ẩn")
                    .build();
            lessonRepository.save(MathG10C2L1);

            Lesson MathG10C2L2 = Lesson.builder()
                    .chapter(G10Chap2)
                    .lessonNumber(6)
                    .lessonName("Hệ bất phương trình bậc nhất hai ẩn")
                    .description("Bài 4: Hệ bất phương trình bậc nhất hai ẩn")
                    .build();
            lessonRepository.save(MathG10C2L2);

            Lesson MathG10C2L3 = Lesson.builder()
                    .chapter(G10Chap2)
                    .lessonNumber(7)
                    .lessonName("Bài tập cuối chương II")
                    .description("Bài tập cuối chương II")
                    .build();
            lessonRepository.save(MathG10C2L3);

            Lesson MathG10C2L4 = Lesson.builder()
                    .chapter(G10Chap2)
                    .lessonNumber(8)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 2")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 2")
                    .build();
            lessonRepository.save(MathG10C2L4);

// Chapter 3: Hệ thức lượng trong tam giác
            Chapter G10Chap3 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(10)
                    .chapterNumber(3)
                    .chapterName("Hệ thức lượng trong tam giác")
                    .description("Chương 3: Hệ thức lượng trong tam giác")
                    .build();
            chapterRepository.save(G10Chap3);

            Lesson MathG10C3L1 = Lesson.builder()
                    .chapter(G10Chap3)
                    .lessonNumber(9)
                    .lessonName("Giá trị lượng giác của một góc từ 0 độ đến 180 độ")
                    .description("Bài 5: Giá trị lượng giác của một góc từ 0 độ đến 180 độ")
                    .build();
            lessonRepository.save(MathG10C3L1);

            Lesson MathG10C3L2 = Lesson.builder()
                    .chapter(G10Chap3)
                    .lessonNumber(10)
                    .lessonName("Hệ thức lượng trong tam giác")
                    .description("Bài 6: Hệ thức lượng trong tam giác")
                    .build();
            lessonRepository.save(MathG10C3L2);

            Lesson MathG10C3L3 = Lesson.builder()
                    .chapter(G10Chap3)
                    .lessonNumber(11)
                    .lessonName("Bài tập cuối chương III")
                    .description("Bài tập cuối chương III")
                    .build();
            lessonRepository.save(MathG10C3L3);

            Lesson MathG10C3L4 = Lesson.builder()
                    .chapter(G10Chap3)
                    .lessonNumber(12)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 3")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 3")
                    .build();
            lessonRepository.save(MathG10C3L4);

// Chapter 4: Vecto
            Chapter G10Chap4 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(10)
                    .chapterNumber(4)
                    .chapterName("Vecto")
                    .description("Chương 4: Vecto")
                    .build();
            chapterRepository.save(G10Chap4);

            Lesson MathG10C4L1 = Lesson.builder()
                    .chapter(G10Chap4)
                    .lessonNumber(13)
                    .lessonName("Các khái niệm mở đầu")
                    .description("Bài 7: Các khái niệm mở đầu")
                    .build();
            lessonRepository.save(MathG10C4L1);

            Lesson MathG10C4L2 = Lesson.builder()
                    .chapter(G10Chap4)
                    .lessonNumber(14)
                    .lessonName("Tổng và hiệu của hai vecto")
                    .description("Bài 8: Tổng và hiệu của hai vecto")
                    .build();
            lessonRepository.save(MathG10C4L2);

            Lesson MathG10C4L3 = Lesson.builder()
                    .chapter(G10Chap4)
                    .lessonNumber(15)
                    .lessonName("Tích của một vecto với một số")
                    .description("Bài 9: Tích của một vecto với một số")
                    .build();
            lessonRepository.save(MathG10C4L3);

            Lesson MathG10C4L4 = Lesson.builder()
                    .chapter(G10Chap4)
                    .lessonNumber(16)
                    .lessonName("Vecto trong mặt phẳng tọa độ")
                    .description("Bài 10: Vecto trong mặt phẳng tọa độ")
                    .build();
            lessonRepository.save(MathG10C4L4);

            Lesson MathG10C4L5 = Lesson.builder()
                    .chapter(G10Chap4)
                    .lessonNumber(17)
                    .lessonName("Tích vô hướng của hai vecto")
                    .description("Bài 11: Tích vô hướng của hai vecto")
                    .build();
            lessonRepository.save(MathG10C4L5);

            Lesson MathG10C4L6 = Lesson.builder()
                    .chapter(G10Chap4)
                    .lessonNumber(18)
                    .lessonName("Bài tập cuối chương IV")
                    .description("Bài tập cuối chương IV")
                    .build();
            lessonRepository.save(MathG10C4L6);

            Lesson MathG10C4L7 = Lesson.builder()
                    .chapter(G10Chap4)
                    .lessonNumber(19)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 4")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 4")
                    .build();
            lessonRepository.save(MathG10C4L7);

// Chapter 5: Các số đặc trưng của mẫu số liệu không ghép nhóm
            Chapter G10Chap5 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(10)
                    .chapterNumber(5)
                    .chapterName("Các số đặc trưng của mẫu số liệu không ghép nhóm")
                    .description("Chương 5: Các số đặc trưng của mẫu số liệu không ghép nhóm")
                    .build();
            chapterRepository.save(G10Chap5);

            Lesson MathG10C5L1 = Lesson.builder()
                    .chapter(G10Chap5)
                    .lessonNumber(20)
                    .lessonName("Số gần đúng và sai số")
                    .description("Bài 12: Số gần đúng và sai số")
                    .build();
            lessonRepository.save(MathG10C5L1);

            Lesson MathG10C5L2 = Lesson.builder()
                    .chapter(G10Chap5)
                    .lessonNumber(21)
                    .lessonName("Các số đặc trưng đo xu thế trung tâm")
                    .description("Bài 13: Các số đặc trưng đo xu thế trung tâm")
                    .build();
            lessonRepository.save(MathG10C5L2);

            Lesson MathG10C5L3 = Lesson.builder()
                    .chapter(G10Chap5)
                    .lessonNumber(22)
                    .lessonName("Các số đặc trưng đo độ phân tán")
                    .description("Bài 14: Các số đặc trưng đo độ phân tán")
                    .build();
            lessonRepository.save(MathG10C5L3);

            Lesson MathG10C5L4 = Lesson.builder()
                    .chapter(G10Chap5)
                    .lessonNumber(23)
                    .lessonName("Bài tập cuối chương V")
                    .description("Bài tập cuối chương V")
                    .build();
            lessonRepository.save(MathG10C5L4);

            Lesson MathG10C5L5 = Lesson.builder()
                    .chapter(G10Chap5)
                    .lessonNumber(24)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 5")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 5")
                    .build();
            lessonRepository.save(MathG10C5L5);

// Chapter 6: Hàm số, đồ thị và ứng dụng
            Chapter G10Chap6 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(10)
                    .chapterNumber(6)
                    .chapterName("Hàm số, đồ thị và ứng dụng")
                    .description("Chương 6: Hàm số, đồ thị và ứng dụng")
                    .build();
            chapterRepository.save(G10Chap6);

            Lesson MathG10C6L1 = Lesson.builder()
                    .chapter(G10Chap6)
                    .lessonNumber(25)
                    .lessonName("Hàm số")
                    .description("Bài 15: Hàm số")
                    .build();
            lessonRepository.save(MathG10C6L1);

            Lesson MathG10C6L2 = Lesson.builder()
                    .chapter(G10Chap6)
                    .lessonNumber(26)
                    .lessonName("Hàm số bậc hai")
                    .description("Bài 16: Hàm số bậc hai")
                    .build();
            lessonRepository.save(MathG10C6L2);

            Lesson MathG10C6L3 = Lesson.builder()
                    .chapter(G10Chap6)
                    .lessonNumber(27)
                    .lessonName("Dấu của tam thức bậc hai")
                    .description("Bài 17: Dấu của tam thức bậc hai")
                    .build();
            lessonRepository.save(MathG10C6L3);

            Lesson MathG10C6L4 = Lesson.builder()
                    .chapter(G10Chap6)
                    .lessonNumber(28)
                    .lessonName("Phương trình quy về phương trình bậc hai")
                    .description("Bài 18: Phương trình quy về phương trình bậc hai")
                    .build();
            lessonRepository.save(MathG10C6L4);

            Lesson MathG10C6L5 = Lesson.builder()
                    .chapter(G10Chap6)
                    .lessonNumber(29)
                    .lessonName("Bài tập cuối chương VI")
                    .description("Bài tập cuối chương VI")
                    .build();
            lessonRepository.save(MathG10C6L5);

            Lesson MathG10C6L6 = Lesson.builder()
                    .chapter(G10Chap6)
                    .lessonNumber(30)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 6")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 6")
                    .build();
            lessonRepository.save(MathG10C6L6);

// Chapter 7: Phương pháp tọa độ trong mặt phẳng
            Chapter G10Chap7 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(10)
                    .chapterNumber(7)
                    .chapterName("Phương pháp tọa độ trong mặt phẳng")
                    .description("Chương 7: Phương pháp tọa độ trong mặt phẳng")
                    .build();
            chapterRepository.save(G10Chap7);

            Lesson MathG10C7L1 = Lesson.builder()
                    .chapter(G10Chap7)
                    .lessonNumber(31)
                    .lessonName("Phương trình đường thẳng")
                    .description("Bài 19: Phương trình đường thẳng")
                    .build();
            lessonRepository.save(MathG10C7L1);

            Lesson MathG10C7L2 = Lesson.builder()
                    .chapter(G10Chap7)
                    .lessonNumber(32)
                    .lessonName("Vị trí tương đối giữa hai đường thẳng. Góc và khoảng cách")
                    .description("Bài 20: Vị trí tương đối giữa hai đường thẳng. Góc và khoảng cách")
                    .build();
            lessonRepository.save(MathG10C7L2);

            Lesson MathG10C7L3 = Lesson.builder()
                    .chapter(G10Chap7)
                    .lessonNumber(33)
                    .lessonName("Đường tròn trong mặt phẳng tọa độ")
                    .description("Bài 21: Đường tròn trong mặt phẳng tọa độ")
                    .build();
            lessonRepository.save(MathG10C7L3);

            Lesson MathG10C7L4 = Lesson.builder()
                    .chapter(G10Chap7)
                    .lessonNumber(34)
                    .lessonName("Ba đường conic")
                    .description("Bài 22: Ba đường conic")
                    .build();
            lessonRepository.save(MathG10C7L4);

            Lesson MathG10C7L5 = Lesson.builder()
                    .chapter(G10Chap7)
                    .lessonNumber(35)
                    .lessonName("Bài tập cuối chương VII")
                    .description("Bài tập cuối chương VII")
                    .build();
            lessonRepository.save(MathG10C7L5);

            Lesson MathG10C7L6 = Lesson.builder()
                    .chapter(G10Chap7)
                    .lessonNumber(36)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 7")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 7")
                    .build();
            lessonRepository.save(MathG10C7L6);

// Chapter 8: Đại số tổ hợp
            Chapter G10Chap8 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(10)
                    .chapterNumber(8)
                    .chapterName("Đại số tổ hợp")
                    .description("Chương 8: Đại số tổ hợp")
                    .build();
            chapterRepository.save(G10Chap8);

            Lesson MathG10C8L1 = Lesson.builder()
                    .chapter(G10Chap8)
                    .lessonNumber(37)
                    .lessonName("Quy tắc đếm")
                    .description("Bài 23: Quy tắc đếm")
                    .build();
            lessonRepository.save(MathG10C8L1);

            Lesson MathG10C8L2 = Lesson.builder()
                    .chapter(G10Chap8)
                    .lessonNumber(38)
                    .lessonName("Hoán vị, chỉnh hợp và tổ hợp")
                    .description("Bài 24: Hoán vị, chỉnh hợp và tổ hợp")
                    .build();
            lessonRepository.save(MathG10C8L2);

            Lesson MathG10C8L3 = Lesson.builder()
                    .chapter(G10Chap8)
                    .lessonNumber(39)
                    .lessonName("Nhị thức Newton")
                    .description("Bài 25: Nhị thức Newton")
                    .build();
            lessonRepository.save(MathG10C8L3);

            Lesson MathG10C8L4 = Lesson.builder()
                    .chapter(G10Chap8)
                    .lessonNumber(40)
                    .lessonName("Bài tập cuối chương VIII")
                    .description("Bài tập cuối chương VIII")
                    .build();
            lessonRepository.save(MathG10C8L4);

            Lesson MathG10C8L5 = Lesson.builder()
                    .chapter(G10Chap8)
                    .lessonNumber(41)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 8")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 8")
                    .build();
            lessonRepository.save(MathG10C8L5);

// Chapter 9: Tính xác suất theo định nghĩa cổ điển
            Chapter G10Chap9 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(10)
                    .chapterNumber(9)
                    .chapterName("Tính xác suất theo định nghĩa cổ điển")
                    .description("Chương 9: Tính xác suất theo định nghĩa cổ điển")
                    .build();
            chapterRepository.save(G10Chap9);

            Lesson MathG10C9L1 = Lesson.builder()
                    .chapter(G10Chap9)
                    .lessonNumber(42)
                    .lessonName("Biến cố và định nghĩa cổ điển của xác suất")
                    .description("Bài 26: Biến cố và định nghĩa cổ điển của xác suất")
                    .build();
            lessonRepository.save(MathG10C9L1);

            Lesson MathG10C9L2 = Lesson.builder()
                    .chapter(G10Chap9)
                    .lessonNumber(43)
                    .lessonName("Thực hành tính xác suất theo định nghĩa cổ điển")
                    .description("Bài 27: Thực hành tính xác suất theo định nghĩa cổ điển")
                    .build();
            lessonRepository.save(MathG10C9L2);

            Lesson MathG10C9L3 = Lesson.builder()
                    .chapter(G10Chap9)
                    .lessonNumber(44)
                    .lessonName("Bài tập cuối chương IX")
                    .description("Bài tập cuối chương IX")
                    .build();
            lessonRepository.save(MathG10C9L3);

            Lesson MathG10C9L4 = Lesson.builder()
                    .chapter(G10Chap9)
                    .lessonNumber(45)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 9")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 9")
                    .build();
            lessonRepository.save(MathG10C9L4);
            // Grade 11 Math - Chapter 1: HÀM SỐ LƯỢNG GIÁC VÀ PHƯƠNG TRÌNH LƯỢNG GIÁC
            Chapter G11Chap1 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(11)
                    .chapterNumber(1)
                    .chapterName("HÀM SỐ LƯỢNG GIÁC VÀ PHƯƠNG TRÌNH LƯỢNG GIÁC")
                    .description("CHƯƠNG I. HÀM SỐ LƯỢNG GIÁC VÀ PHƯƠNG TRÌNH LƯỢNG GIÁC")
                    .build();
            chapterRepository.save(G11Chap1);

            Lesson MathG11C1L1 = Lesson.builder()
                    .chapter(G11Chap1)
                    .lessonNumber(1)
                    .lessonName("Giá trị lượng giác của góc lượng giác")
                    .description("Bài 1. Giá trị lượng giác của góc lượng giác")
                    .build();
            lessonRepository.save(MathG11C1L1);

            Lesson MathG11C1L2 = Lesson.builder()
                    .chapter(G11Chap1)
                    .lessonNumber(2)
                    .lessonName("Công thức lượng giác")
                    .description("Bài 2. Công thức lượng giác")
                    .build();
            lessonRepository.save(MathG11C1L2);

            Lesson MathG11C1L3 = Lesson.builder()
                    .chapter(G11Chap1)
                    .lessonNumber(3)
                    .lessonName("Hàm số lượng giác")
                    .description("Bài 3. Hàm số lượng giác")
                    .build();
            lessonRepository.save(MathG11C1L3);

            Lesson MathG11C1L4 = Lesson.builder()
                    .chapter(G11Chap1)
                    .lessonNumber(4)
                    .lessonName("Phương trình lượng giác cơ bản")
                    .description("Bài 4. Phương trình lượng giác cơ bản")
                    .build();
            lessonRepository.save(MathG11C1L4);

            Lesson MathG11C1L5 = Lesson.builder()
                    .chapter(G11Chap1)
                    .lessonNumber(5)
                    .lessonName("Bài tập cuối chương I")
                    .description("Bài tập cuối chương I")
                    .build();
            lessonRepository.save(MathG11C1L5);

            Lesson MathG11C1L6 = Lesson.builder()
                    .chapter(G11Chap1)
                    .lessonNumber(6)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương I")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương I")
                    .build();
            lessonRepository.save(MathG11C1L6);

// Chapter 2: DÃY SỐ. CẤP SỐ CỘNG VÀ CẤP SỐ NHÂN
            Chapter G11Chap2 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(11)
                    .chapterNumber(2)
                    .chapterName("DÃY SỐ. CẤP SỐ CỘNG VÀ CẤP SỐ NHÂN")
                    .description("CHƯƠNG II. DÃY SỐ. CẤP SỐ CỘNG VÀ CẤP SỐ NHÂN")
                    .build();
            chapterRepository.save(G11Chap2);

            Lesson MathG11C2L1 = Lesson.builder()
                    .chapter(G11Chap2)
                    .lessonNumber(7)
                    .lessonName("Dãy số")
                    .description("Bài 5. Dãy số")
                    .build();
            lessonRepository.save(MathG11C2L1);

            Lesson MathG11C2L2 = Lesson.builder()
                    .chapter(G11Chap2)
                    .lessonNumber(8)
                    .lessonName("Cấp số cộng")
                    .description("Bài 6. Cấp số cộng")
                    .build();
            lessonRepository.save(MathG11C2L2);

            Lesson MathG11C2L3 = Lesson.builder()
                    .chapter(G11Chap2)
                    .lessonNumber(9)
                    .lessonName("Cấp số nhân")
                    .description("Bài 7. Cấp số nhân")
                    .build();
            lessonRepository.save(MathG11C2L3);

            Lesson MathG11C2L4 = Lesson.builder()
                    .chapter(G11Chap2)
                    .lessonNumber(10)
                    .lessonName("Bài tập cuối chương II")
                    .description("Bài tập cuối chương II")
                    .build();
            lessonRepository.save(MathG11C2L4);

            Lesson MathG11C2L5 = Lesson.builder()
                    .chapter(G11Chap2)
                    .lessonNumber(11)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương II")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương II")
                    .build();
            lessonRepository.save(MathG11C2L5);

// Chapter 3: CÁC SỐ ĐẶC TRƯNG ĐO XU THẾ TRUNG TÂM CỦA MẪU SỐ LIỆU GHÉP NHÓM
            Chapter G11Chap3 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(11)
                    .chapterNumber(3)
                    .chapterName("CÁC SỐ ĐẶC TRƯNG ĐO XU THẾ TRUNG TÂM CỦA MẪU SỐ LIỆU GHÉP NHÓM")
                    .description("CHƯƠNG III. CÁC SỐ ĐẶC TRƯNG ĐO XU THẾ TRUNG TÂM CỦA MẪU SỐ LIỆU GHÉP NHÓM")
                    .build();
            chapterRepository.save(G11Chap3);

            Lesson MathG11C3L1 = Lesson.builder()
                    .chapter(G11Chap3)
                    .lessonNumber(12)
                    .lessonName("Mẫu số liệu ghép nhóm")
                    .description("Bài 8. Mẫu số liệu ghép nhóm")
                    .build();
            lessonRepository.save(MathG11C3L1);

            Lesson MathG11C3L2 = Lesson.builder()
                    .chapter(G11Chap3)
                    .lessonNumber(13)
                    .lessonName("Các số đặc trưng đo xu thế trung tâm")
                    .description("Bài 9. Các số đặc trưng đo xu thế trung tâm")
                    .build();
            lessonRepository.save(MathG11C3L2);

            Lesson MathG11C3L3 = Lesson.builder()
                    .chapter(G11Chap3)
                    .lessonNumber(14)
                    .lessonName("Bài tập cuối chương III")
                    .description("Bài tập cuối chương III")
                    .build();
            lessonRepository.save(MathG11C3L3);

            Lesson MathG11C3L4 = Lesson.builder()
                    .chapter(G11Chap3)
                    .lessonNumber(15)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương III")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương III")
                    .build();
            lessonRepository.save(MathG11C3L4);

// Chapter 4: QUAN HỆ SONG SONG TRONG KHÔNG GIAN
            Chapter G11Chap4 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(11)
                    .chapterNumber(4)
                    .chapterName("QUAN HỆ SONG SONG TRONG KHÔNG GIAN")
                    .description("CHƯƠNG IV. QUAN HỆ SONG SONG TRONG KHÔNG GIAN")
                    .build();
            chapterRepository.save(G11Chap4);

            Lesson MathG11C4L1 = Lesson.builder()
                    .chapter(G11Chap4)
                    .lessonNumber(16)
                    .lessonName("Đường thẳng và mặt phẳng trong không gian")
                    .description("Bài 10. Đường thẳng và mặt phẳng trong không gian")
                    .build();
            lessonRepository.save(MathG11C4L1);

            Lesson MathG11C4L2 = Lesson.builder()
                    .chapter(G11Chap4)
                    .lessonNumber(17)
                    .lessonName("Hai đường thẳng song song")
                    .description("Bài 11. Hai đường thẳng song song")
                    .build();
            lessonRepository.save(MathG11C4L2);

            Lesson MathG11C4L3 = Lesson.builder()
                    .chapter(G11Chap4)
                    .lessonNumber(18)
                    .lessonName("Đường thẳng và mặt phẳng song song")
                    .description("Bài 12. Đường thẳng và mặt phẳng song song")
                    .build();
            lessonRepository.save(MathG11C4L3);

            Lesson MathG11C4L4 = Lesson.builder()
                    .chapter(G11Chap4)
                    .lessonNumber(19)
                    .lessonName("Hai mặt phẳng song song")
                    .description("Bài 13. Hai mặt phẳng song song")
                    .build();
            lessonRepository.save(MathG11C4L4);

            Lesson MathG11C4L5 = Lesson.builder()
                    .chapter(G11Chap4)
                    .lessonNumber(20)
                    .lessonName("Phép chiếu song song")
                    .description("Bài 14. Phép chiếu song song")
                    .build();
            lessonRepository.save(MathG11C4L5);

            Lesson MathG11C4L6 = Lesson.builder()
                    .chapter(G11Chap4)
                    .lessonNumber(21)
                    .lessonName("Bài tập cuối chương IV")
                    .description("Bài tập cuối chương IV")
                    .build();
            lessonRepository.save(MathG11C4L6);

            Lesson MathG11C4L7 = Lesson.builder()
                    .chapter(G11Chap4)
                    .lessonNumber(22)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương IV")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương IV")
                    .build();
            lessonRepository.save(MathG11C4L7);

// Chapter 5: GIỚI HẠN. HÀM SỐ LIÊN TỤC
            Chapter G11Chap5 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(11)
                    .chapterNumber(5)
                    .chapterName("GIỚI HẠN. HÀM SỐ LIÊN TỤC")
                    .description("CHƯƠNG V. GIỚI HẠN. HÀM SỐ LIÊN TỤC")
                    .build();
            chapterRepository.save(G11Chap5);

            Lesson MathG11C5L1 = Lesson.builder()
                    .chapter(G11Chap5)
                    .lessonNumber(23)
                    .lessonName("Giới hạn của dãy số")
                    .description("Bài 15. Giới hạn của dãy số")
                    .build();
            lessonRepository.save(MathG11C5L1);

            Lesson MathG11C5L2 = Lesson.builder()
                    .chapter(G11Chap5)
                    .lessonNumber(24)
                    .lessonName("Giới hạn của hàm số")
                    .description("Bài 16. Giới hạn của hàm số")
                    .build();
            lessonRepository.save(MathG11C5L2);

            Lesson MathG11C5L3 = Lesson.builder()
                    .chapter(G11Chap5)
                    .lessonNumber(25)
                    .lessonName("Hàm số liên tục")
                    .description("Bài 17. Hàm số liên tục")
                    .build();
            lessonRepository.save(MathG11C5L3);

            Lesson MathG11C5L4 = Lesson.builder()
                    .chapter(G11Chap5)
                    .lessonNumber(26)
                    .lessonName("Bài tập cuối chương V")
                    .description("Bài tập cuối chương V")
                    .build();
            lessonRepository.save(MathG11C5L4);

            Lesson MathG11C5L5 = Lesson.builder()
                    .chapter(G11Chap5)
                    .lessonNumber(27)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương V")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương V")
                    .build();
            lessonRepository.save(MathG11C5L5);

// Chapter 6: HÀM SỐ MŨ VÀ HÀM SỐ LÔGARIT
            Chapter G11Chap6 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(11)
                    .chapterNumber(6)
                    .chapterName("HÀM SỐ MŨ VÀ HÀM SỐ LÔGARIT")
                    .description("CHƯƠNG VI. HÀM SỐ MŨ VÀ HÀM SỐ LÔGARIT")
                    .build();
            chapterRepository.save(G11Chap6);

            Lesson MathG11C6L1 = Lesson.builder()
                    .chapter(G11Chap6)
                    .lessonNumber(28)
                    .lessonName("Luỹ thừa với số mũ thực")
                    .description("Bài 18. Luỹ thừa với số mũ thực")
                    .build();
            lessonRepository.save(MathG11C6L1);

            Lesson MathG11C6L2 = Lesson.builder()
                    .chapter(G11Chap6)
                    .lessonNumber(29)
                    .lessonName("Lôgarit")
                    .description("Bài 19. Lôgarit")
                    .build();
            lessonRepository.save(MathG11C6L2);

            Lesson MathG11C6L3 = Lesson.builder()
                    .chapter(G11Chap6)
                    .lessonNumber(30)
                    .lessonName("Hàm số mũ và hàm số lôgarit")
                    .description("Bài 20. Hàm số mũ và hàm số lôgarit")
                    .build();
            lessonRepository.save(MathG11C6L3);

            Lesson MathG11C6L4 = Lesson.builder()
                    .chapter(G11Chap6)
                    .lessonNumber(31)
                    .lessonName("Phương trình, bất phương trình mũ và lôgarit")
                    .description("Bài 21. Phương trình, bất phương trình mũ và lôgarit")
                    .build();
            lessonRepository.save(MathG11C6L4);

            Lesson MathG11C6L5 = Lesson.builder()
                    .chapter(G11Chap6)
                    .lessonNumber(32)
                    .lessonName("Bài tập cuối chương VI")
                    .description("Bài tập cuối chương VI")
                    .build();
            lessonRepository.save(MathG11C6L5);

            Lesson MathG11C6L6 = Lesson.builder()
                    .chapter(G11Chap6)
                    .lessonNumber(33)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương VI")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương VI")
                    .build();
            lessonRepository.save(MathG11C6L6);

// Chapter 7: QUAN HỆ VUÔNG GÓC TRONG KHÔNG GIAN
            Chapter G11Chap7 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(11)
                    .chapterNumber(7)
                    .chapterName("QUAN HỆ VUÔNG GÓC TRONG KHÔNG GIAN")
                    .description("CHƯƠNG VII. QUAN HỆ VUÔNG GÓC TRONG KHÔNG GIAN")
                    .build();
            chapterRepository.save(G11Chap7);

            Lesson MathG11C7L1 = Lesson.builder()
                    .chapter(G11Chap7)
                    .lessonNumber(34)
                    .lessonName("Hai đường thẳng vuông góc")
                    .description("Bài 22. Hai đường thẳng vuông góc")
                    .build();
            lessonRepository.save(MathG11C7L1);

            Lesson MathG11C7L2 = Lesson.builder()
                    .chapter(G11Chap7)
                    .lessonNumber(35)
                    .lessonName("Đường thẳng vuông góc với mặt phẳng")
                    .description("Bài 23. Đường thẳng vuông góc với mặt phẳng")
                    .build();
            lessonRepository.save(MathG11C7L2);

            Lesson MathG11C7L3 = Lesson.builder()
                    .chapter(G11Chap7)
                    .lessonNumber(36)
                    .lessonName("Phép chiếu vuông góc. Góc giữa đường thẳng và mặt phẳng")
                    .description("Bài 24. Phép chiếu vuông góc. Góc giữa đường thẳng và mặt phẳng")
                    .build();
            lessonRepository.save(MathG11C7L3);

            Lesson MathG11C7L4 = Lesson.builder()
                    .chapter(G11Chap7)
                    .lessonNumber(37)
                    .lessonName("Hai mặt phẳng vuông góc")
                    .description("Bài 25. Hai mặt phẳng vuông góc")
                    .build();
            lessonRepository.save(MathG11C7L4);

            Lesson MathG11C7L5 = Lesson.builder()
                    .chapter(G11Chap7)
                    .lessonNumber(38)
                    .lessonName("Khoảng cách")
                    .description("Bài 26. Khoảng cách")
                    .build();
            lessonRepository.save(MathG11C7L5);

            Lesson MathG11C7L6 = Lesson.builder()
                    .chapter(G11Chap7)
                    .lessonNumber(39)
                    .lessonName("Thể tích")
                    .description("Bài 27. Thể tích")
                    .build();
            lessonRepository.save(MathG11C7L6);

            Lesson MathG11C7L7 = Lesson.builder()
                    .chapter(G11Chap7)
                    .lessonNumber(40)
                    .lessonName("Bài tập cuối chương VII")
                    .description("Bài tập cuối chương VII")
                    .build();
            lessonRepository.save(MathG11C7L7);

            Lesson MathG11C7L8 = Lesson.builder()
                    .chapter(G11Chap7)
                    .lessonNumber(41)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương VII")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương VII")
                    .build();
            lessonRepository.save(MathG11C7L8);

// Chapter 8: CÁC QUY TẮC TÍNH XÁC SUẤT
            Chapter G11Chap8 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(11)
                    .chapterNumber(8)
                    .chapterName("CÁC QUY TẮC TÍNH XÁC SUẤT")
                    .description("CHƯƠNG VIII. CÁC QUY TẮC TÍNH XÁC SUẤT")
                    .build();
            chapterRepository.save(G11Chap8);

            Lesson MathG11C8L1 = Lesson.builder()
                    .chapter(G11Chap8)
                    .lessonNumber(42)
                    .lessonName("Biến cố hợp, biến cố giao, biến cố độc lập")
                    .description("Bài 28. Biến cố hợp, biến cố giao, biến cố độc lập")
                    .build();
            lessonRepository.save(MathG11C8L1);

            Lesson MathG11C8L2 = Lesson.builder()
                    .chapter(G11Chap8)
                    .lessonNumber(43)
                    .lessonName("Công thức cộng xác suất")
                    .description("Bài 29. Công thức cộng xác suất")
                    .build();
            lessonRepository.save(MathG11C8L2);

            Lesson MathG11C8L3 = Lesson.builder()
                    .chapter(G11Chap8)
                    .lessonNumber(44)
                    .lessonName("Công thức nhân xác suất cho hai biến cố độc lập")
                    .description("Bài 30. Công thức nhân xác suất cho hai biến cố độc lập")
                    .build();
            lessonRepository.save(MathG11C8L3);

            Lesson MathG11C8L4 = Lesson.builder()
                    .chapter(G11Chap8)
                    .lessonNumber(45)
                    .lessonName("Bài tập cuối chương VIII")
                    .description("Bài tập cuối chương VIII")
                    .build();
            lessonRepository.save(MathG11C8L4);

            Lesson MathG11C8L5 = Lesson.builder()
                    .chapter(G11Chap8)
                    .lessonNumber(46)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương VIII")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương VIII")
                    .build();
            lessonRepository.save(MathG11C8L5);

// Chapter 9: ĐẠO HÀM
            Chapter G11Chap9 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(11)
                    .chapterNumber(9)
                    .chapterName("ĐẠO HÀM")
                    .description("CHƯƠNG IX. ĐẠO HÀM")
                    .build();
            chapterRepository.save(G11Chap9);

            Lesson MathG11C9L1 = Lesson.builder()
                    .chapter(G11Chap9)
                    .lessonNumber(47)
                    .lessonName("Định nghĩa và ý nghĩa của đạo hàm")
                    .description("Bài 31. Định nghĩa và ý nghĩa của đạo hàm")
                    .build();
            lessonRepository.save(MathG11C9L1);

            Lesson MathG11C9L2 = Lesson.builder()
                    .chapter(G11Chap9)
                    .lessonNumber(48)
                    .lessonName("Các quy tắc tính đạo hàm")
                    .description("Bài 32. Các quy tắc tính đạo hàm")
                    .build();
            lessonRepository.save(MathG11C9L2);

            Lesson MathG11C9L3 = Lesson.builder()
                    .chapter(G11Chap9)
                    .lessonNumber(49)
                    .lessonName("Đạo hàm cấp hai")
                    .description("Bài 33. Đạo hàm cấp hai")
                    .build();
            lessonRepository.save(MathG11C9L3);

            Lesson MathG11C9L4 = Lesson.builder()
                    .chapter(G11Chap9)
                    .lessonNumber(50)
                    .lessonName("Bài tập cuối chương IX")
                    .description("Bài tập cuối chương IX")
                    .build();
            lessonRepository.save(MathG11C9L4);

            Lesson MathG11C9L5 = Lesson.builder()
                    .chapter(G11Chap9)
                    .lessonNumber(51)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương IX")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương IX")
                    .build();
            lessonRepository.save(MathG11C9L5);
            // Grade 12 Math - Chapter 1: Ứng dụng đạo hàm đề khảo sát và vẽ đồ thị hàm số
            Chapter G12Chap1 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(12)
                    .chapterNumber(1)
                    .chapterName("Ứng dụng đạo hàm đề khảo sát và vẽ đồ thị hàm số")
                    .description("Chương 1: Ứng dụng đạo hàm đề khảo sát và vẽ đồ thị hàm số")
                    .build();
            chapterRepository.save(G12Chap1);

            Lesson MathG12C1L1 = Lesson.builder()
                    .chapter(G12Chap1)
                    .lessonNumber(1)
                    .lessonName("Tính đơn điệu và cực trị của hàm số")
                    .description("Bài 1: Tính đơn điệu và cực trị của hàm số")
                    .build();
            lessonRepository.save(MathG12C1L1);

            Lesson MathG12C1L2 = Lesson.builder()
                    .chapter(G12Chap1)
                    .lessonNumber(2)
                    .lessonName("Giá trị lớn nhất và giá trị nhỏ nhất của hàm số")
                    .description("Bài 2: Giá trị lớn nhất và giá trị nhỏ nhất của hàm số")
                    .build();
            lessonRepository.save(MathG12C1L2);

            Lesson MathG12C1L3 = Lesson.builder()
                    .chapter(G12Chap1)
                    .lessonNumber(3)
                    .lessonName("Đường tiệm cận của đồ thị hàm số")
                    .description("Bài 3: Đường tiệm cận của đồ thị hàm số")
                    .build();
            lessonRepository.save(MathG12C1L3);

            Lesson MathG12C1L4 = Lesson.builder()
                    .chapter(G12Chap1)
                    .lessonNumber(4)
                    .lessonName("Khảo sát sự biến thiên và vẽ đồ thị của hàm số")
                    .description("Bài 4: Khảo sát sự biến thiên và vẽ đồ thị của hàm số")
                    .build();
            lessonRepository.save(MathG12C1L4);

            Lesson MathG12C1L5 = Lesson.builder()
                    .chapter(G12Chap1)
                    .lessonNumber(5)
                    .lessonName("Ứng dụng đạo hàm để giải quyết một số vấn đề liên quan đến thực tiễn")
                    .description("Bài 5: Ứng dụng đạo hàm để giải quyết một số vấn đề liên quan đến thực tiễn")
                    .build();
            lessonRepository.save(MathG12C1L5);

            Lesson MathG12C1L6 = Lesson.builder()
                    .chapter(G12Chap1)
                    .lessonNumber(6)
                    .lessonName("Bài tập cuối chương 1")
                    .description("Bài tập cuối chương 1")
                    .build();
            lessonRepository.save(MathG12C1L6);

            Lesson MathG12C1L7 = Lesson.builder()
                    .chapter(G12Chap1)
                    .lessonNumber(7)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 1")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 1")
                    .build();
            lessonRepository.save(MathG12C1L7);

// Chapter 2: Vectơ và hệ trục tọa độ trong không gian
            Chapter G12Chap2 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(12)
                    .chapterNumber(2)
                    .chapterName("Vectơ và hệ trục tọa độ trong không gian")
                    .description("Chương 2: Vectơ và hệ trục tọa độ trong không gian")
                    .build();
            chapterRepository.save(G12Chap2);

            Lesson MathG12C2L1 = Lesson.builder()
                    .chapter(G12Chap2)
                    .lessonNumber(8)
                    .lessonName("Vectơ trong không gian")
                    .description("Bài 6: Vectơ trong không gian")
                    .build();
            lessonRepository.save(MathG12C2L1);

            Lesson MathG12C2L2 = Lesson.builder()
                    .chapter(G12Chap2)
                    .lessonNumber(9)
                    .lessonName("Hệ trục tọa độ trong không gian")
                    .description("Bài 7: Hệ trục tọa độ trong không gian")
                    .build();
            lessonRepository.save(MathG12C2L2);

            Lesson MathG12C2L3 = Lesson.builder()
                    .chapter(G12Chap2)
                    .lessonNumber(10)
                    .lessonName("Biểu thức tọa độ của các phép toán vectơ")
                    .description("Bài 8: Biểu thức tọa độ của các phép toán vectơ")
                    .build();
            lessonRepository.save(MathG12C2L3);

            Lesson MathG12C2L4 = Lesson.builder()
                    .chapter(G12Chap2)
                    .lessonNumber(11)
                    .lessonName("Bài tập cuối chương 2")
                    .description("Bài tập cuối chương 2")
                    .build();
            lessonRepository.save(MathG12C2L4);

            Lesson MathG12C2L5 = Lesson.builder()
                    .chapter(G12Chap2)
                    .lessonNumber(12)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 2")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 2")
                    .build();
            lessonRepository.save(MathG12C2L5);

// Chapter 3: Các số đặc trưng đo mức độ phân tán của mẫu số liệu ghép nhóm
            Chapter G12Chap3 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(12)
                    .chapterNumber(3)
                    .chapterName("Các số đặc trưng đo mức độ phân tán của mẫu số liệu ghép nhóm")
                    .description("Chương 3. Các số đặc trưng đo mức độ phân tán của mẫu số liệu ghép nhóm")
                    .build();
            chapterRepository.save(G12Chap3);

            Lesson MathG12C3L1 = Lesson.builder()
                    .chapter(G12Chap3)
                    .lessonNumber(13)
                    .lessonName("Khoảng biến thiên và khoảng tứ phân vị")
                    .description("Bài 9. Khoảng biến thiên và khoảng tứ phân vị")
                    .build();
            lessonRepository.save(MathG12C3L1);

            Lesson MathG12C3L2 = Lesson.builder()
                    .chapter(G12Chap3)
                    .lessonNumber(14)
                    .lessonName("Phương sai và độ lệch chuẩn")
                    .description("Bài 10. Phương sai và độ lệch chuẩn")
                    .build();
            lessonRepository.save(MathG12C3L2);

            Lesson MathG12C3L3 = Lesson.builder()
                    .chapter(G12Chap3)
                    .lessonNumber(15)
                    .lessonName("Bài tập cuối chương 3")
                    .description("Bài tập cuối chương 3")
                    .build();
            lessonRepository.save(MathG12C3L3);

            Lesson MathG12C3L4 = Lesson.builder()
                    .chapter(G12Chap3)
                    .lessonNumber(16)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 3")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 3")
                    .build();
            lessonRepository.save(MathG12C3L4);

// Chapter 4: Nguyên hàm và tích phân
            Chapter G12Chap4 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(12)
                    .chapterNumber(4)
                    .chapterName("Nguyên hàm và tích phân")
                    .description("Chương 4: Nguyên hàm và tích phân")
                    .build();
            chapterRepository.save(G12Chap4);

            Lesson MathG12C4L1 = Lesson.builder()
                    .chapter(G12Chap4)
                    .lessonNumber(17)
                    .lessonName("Nguyên hàm")
                    .description("Bài 11: Nguyên hàm")
                    .build();
            lessonRepository.save(MathG12C4L1);

            Lesson MathG12C4L2 = Lesson.builder()
                    .chapter(G12Chap4)
                    .lessonNumber(18)
                    .lessonName("Tích phân")
                    .description("Bài 12: Tích phân")
                    .build();
            lessonRepository.save(MathG12C4L2);

            Lesson MathG12C4L3 = Lesson.builder()
                    .chapter(G12Chap4)
                    .lessonNumber(19)
                    .lessonName("Ứng dụng hình học của tích phân")
                    .description("Bài 13: Ứng dụng hình học của tích phân")
                    .build();
            lessonRepository.save(MathG12C4L3);

            Lesson MathG12C4L4 = Lesson.builder()
                    .chapter(G12Chap4)
                    .lessonNumber(20)
                    .lessonName("Bài tập cuối chương 4")
                    .description("Bài tập cuối chương 4")
                    .build();
            lessonRepository.save(MathG12C4L4);

            Lesson MathG12C4L5 = Lesson.builder()
                    .chapter(G12Chap4)
                    .lessonNumber(21)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 4")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 4")
                    .build();
            lessonRepository.save(MathG12C4L5);

// Chapter 5: Phương pháp tọa độ trong không gian
            Chapter G12Chap5 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(12)
                    .chapterNumber(5)
                    .chapterName("Phương pháp tọa độ trong không gian")
                    .description("Chương 5: Phương pháp tọa độ trong không gian")
                    .build();
            chapterRepository.save(G12Chap5);

            Lesson MathG12C5L1 = Lesson.builder()
                    .chapter(G12Chap5)
                    .lessonNumber(22)
                    .lessonName("Phương trình mặt phẳng")
                    .description("Bài 14: Phương trình mặt phẳng")
                    .build();
            lessonRepository.save(MathG12C5L1);

            Lesson MathG12C5L2 = Lesson.builder()
                    .chapter(G12Chap5)
                    .lessonNumber(23)
                    .lessonName("Phương trình đường thẳng trong không gian")
                    .description("Bài 15: Phương trình đường thẳng trong không gian")
                    .build();
            lessonRepository.save(MathG12C5L2);

            Lesson MathG12C5L3 = Lesson.builder()
                    .chapter(G12Chap5)
                    .lessonNumber(24)
                    .lessonName("Công thức tính góc trong không gian")
                    .description("Bài 16: Công thức tính góc trong không gian")
                    .build();
            lessonRepository.save(MathG12C5L3);

            Lesson MathG12C5L4 = Lesson.builder()
                    .chapter(G12Chap5)
                    .lessonNumber(25)
                    .lessonName("Phương trình mặt cầu")
                    .description("Bài 17: Phương trình mặt cầu")
                    .build();
            lessonRepository.save(MathG12C5L4);

            Lesson MathG12C5L5 = Lesson.builder()
                    .chapter(G12Chap5)
                    .lessonNumber(26)
                    .lessonName("Bài tập cuối chương 5")
                    .description("Bài tập cuối chương 5")
                    .build();
            lessonRepository.save(MathG12C5L5);

            Lesson MathG12C5L6 = Lesson.builder()
                    .chapter(G12Chap5)
                    .lessonNumber(27)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 5")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 5")
                    .build();
            lessonRepository.save(MathG12C5L6);

// Chapter 6: Xác suất có điều kiện
            Chapter G12Chap6 = Chapter.builder()
                    .subject(math)
                    .gradeLevel(12)
                    .chapterNumber(6)
                    .chapterName("Xác suất có điều kiện")
                    .description("Chương 6: Xác suất có điều kiện")
                    .build();
            chapterRepository.save(G12Chap6);

            Lesson MathG12C6L1 = Lesson.builder()
                    .chapter(G12Chap6)
                    .lessonNumber(28)
                    .lessonName("Xác suất có điều kiện")
                    .description("Bài 18: Xác suất có điều kiện")
                    .build();
            lessonRepository.save(MathG12C6L1);

            Lesson MathG12C6L2 = Lesson.builder()
                    .chapter(G12Chap6)
                    .lessonNumber(29)
                    .lessonName("Công thức xác suất toàn phần và công thức Bayes")
                    .description("Bài 19: Công thức xác suất toàn phần và công thức Bayes")
                    .build();
            lessonRepository.save(MathG12C6L2);

            Lesson MathG12C6L3 = Lesson.builder()
                    .chapter(G12Chap6)
                    .lessonNumber(30)
                    .lessonName("Bài tập cuối chương 6")
                    .description("Bài tập cuối chương 6")
                    .build();
            lessonRepository.save(MathG12C6L3);

            Lesson MathG12C6L4 = Lesson.builder()
                    .chapter(G12Chap6)
                    .lessonNumber(31)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 6")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 6")
                    .build();
            lessonRepository.save(MathG12C6L4);
            // Grade 6 Science - Chapter 1: Mở đầu về Khoa học tự nhiên
            Chapter S6Chap1 = Chapter.builder()
                    .subject(science)
                    .gradeLevel(6)
                    .chapterNumber(1)
                    .chapterName("Mở đầu về Khoa học tự nhiên")
                    .description("Chương 1: Mở đầu về Khoa học tự nhiên")
                    .build();
            chapterRepository.save(S6Chap1);

            Lesson SciG6C1L1 = Lesson.builder()
                    .chapter(S6Chap1)
                    .lessonNumber(1)
                    .lessonName("Giới thiệu về Khoa học tự nhiên")
                    .description("Bài 1: Giới thiệu về Khoa học tự nhiên")
                    .build();
            lessonRepository.save(SciG6C1L1);

            Lesson SciG6C1L2 = Lesson.builder()
                    .chapter(S6Chap1)
                    .lessonNumber(2)
                    .lessonName("An toàn trong phòng thực hành")
                    .description("Bài 2: An toàn trong phòng thực hành")
                    .build();
            lessonRepository.save(SciG6C1L2);

            Lesson SciG6C1L3 = Lesson.builder()
                    .chapter(S6Chap1)
                    .lessonNumber(3)
                    .lessonName("Sử dụng kính lúp")
                    .description("Bài 3: Sử dụng kính lúp")
                    .build();
            lessonRepository.save(SciG6C1L3);

            Lesson SciG6C1L4 = Lesson.builder()
                    .chapter(S6Chap1)
                    .lessonNumber(4)
                    .lessonName("Sử dụng kính hiển vi quang học")
                    .description("Bài 4: Sử dụng kính hiển vi quang học")
                    .build();
            lessonRepository.save(SciG6C1L4);

            Lesson SciG6C1L5 = Lesson.builder()
                    .chapter(S6Chap1)
                    .lessonNumber(5)
                    .lessonName("Đo chiều dài")
                    .description("Bài 5: Đo chiều dài")
                    .build();
            lessonRepository.save(SciG6C1L5);

            Lesson SciG6C1L6 = Lesson.builder()
                    .chapter(S6Chap1)
                    .lessonNumber(6)
                    .lessonName("Đo khối lượng")
                    .description("Bài 6: Đo khối lượng")
                    .build();
            lessonRepository.save(SciG6C1L6);

            Lesson SciG6C1L7 = Lesson.builder()
                    .chapter(S6Chap1)
                    .lessonNumber(7)
                    .lessonName("Đo thời gian")
                    .description("Bài 7: Đo thời gian")
                    .build();
            lessonRepository.save(SciG6C1L7);

            Lesson SciG6C1L8 = Lesson.builder()
                    .chapter(S6Chap1)
                    .lessonNumber(8)
                    .lessonName("Đo nhiệt độ")
                    .description("Bài 8: Đo nhiệt độ")
                    .build();
            lessonRepository.save(SciG6C1L8);

// Chapter 2: Chất quanh ta
            Chapter S6Chap2 = Chapter.builder()
                    .subject(science)
                    .gradeLevel(6)
                    .chapterNumber(2)
                    .chapterName("Chất quanh ta")
                    .description("Chương 2: Chất quanh ta")
                    .build();
            chapterRepository.save(S6Chap2);

            Lesson SciG6C2L1 = Lesson.builder()
                    .chapter(S6Chap2)
                    .lessonNumber(9)
                    .lessonName("Sự đa dạng của chất")
                    .description("Bài 9: Sự đa dạng của chất")
                    .build();
            lessonRepository.save(SciG6C2L1);

            Lesson SciG6C2L2 = Lesson.builder()
                    .chapter(S6Chap2)
                    .lessonNumber(10)
                    .lessonName("Các thể của chất và sự chuyển thể")
                    .description("Bài 10: Các thể của chất và sự chuyển thể")
                    .build();
            lessonRepository.save(SciG6C2L2);

            Lesson SciG6C2L3 = Lesson.builder()
                    .chapter(S6Chap2)
                    .lessonNumber(11)
                    .lessonName("Oxygen. Không khí")
                    .description("Bài 11: Oxygen. Không khí")
                    .build();
            lessonRepository.save(SciG6C2L3);

// Chapter 3: Một số vật liệu, nguyên liệu, nhiên liệu, lượng thực - thực phẩm thông dụng
            Chapter S6Chap3 = Chapter.builder()
                    .subject(science)
                    .gradeLevel(6)
                    .chapterNumber(3)
                    .chapterName("Một số vật liệu, nguyên liệu, nhiên liệu, lượng thực - thực phẩm thông dụng")
                    .description("Chương 3: Một số vật liệu, nguyên liệu, nhiên liệu, lượng thực - thực phẩm thông dụng")
                    .build();
            chapterRepository.save(S6Chap3);

            Lesson SciG6C3L1 = Lesson.builder()
                    .chapter(S6Chap3)
                    .lessonNumber(12)
                    .lessonName("Một số vật liệu")
                    .description("Bài 12: Một số vật liệu")
                    .build();
            lessonRepository.save(SciG6C3L1);

            Lesson SciG6C3L2 = Lesson.builder()
                    .chapter(S6Chap3)
                    .lessonNumber(13)
                    .lessonName("Một số nguyên liệu")
                    .description("Bài 13: Một số nguyên liệu")
                    .build();
            lessonRepository.save(SciG6C3L2);

            Lesson SciG6C3L3 = Lesson.builder()
                    .chapter(S6Chap3)
                    .lessonNumber(14)
                    .lessonName("Một số nhiên liệu")
                    .description("Bài 14: Một số nhiên liệu")
                    .build();
            lessonRepository.save(SciG6C3L3);

            Lesson SciG6C3L4 = Lesson.builder()
                    .chapter(S6Chap3)
                    .lessonNumber(15)
                    .lessonName("Một số lượng thực, thực phẩm")
                    .description("Bài 15: Một số lượng thực, thực phẩm")
                    .build();
            lessonRepository.save(SciG6C3L4);

// Chapter 4: Hỗn hợp. Tách chất ra khỏi hỗn hợp
            Chapter S6Chap4 = Chapter.builder()
                    .subject(science)
                    .gradeLevel(6)
                    .chapterNumber(4)
                    .chapterName("Hỗn hợp. Tách chất ra khỏi hỗn hợp")
                    .description("Chương 4: Hỗn hợp. Tách chất ra khỏi hỗn hợp")
                    .build();
            chapterRepository.save(S6Chap4);

            Lesson SciG6C4L1 = Lesson.builder()
                    .chapter(S6Chap4)
                    .lessonNumber(16)
                    .lessonName("Hỗn hợp các chất")
                    .description("Bài 16: Hỗn hợp các chất")
                    .build();
            lessonRepository.save(SciG6C4L1);

            Lesson SciG6C4L2 = Lesson.builder()
                    .chapter(S6Chap4)
                    .lessonNumber(17)
                    .lessonName("Tách chất khỏi hỗn hợp")
                    .description("Bài 17: Tách chất khỏi hỗn hợp")
                    .build();
            lessonRepository.save(SciG6C4L2);

// Chapter 5: Tế bào
            Chapter S6Chap5 = Chapter.builder()
                    .subject(science)
                    .gradeLevel(6)
                    .chapterNumber(5)
                    .chapterName("Tế bào")
                    .description("Chương 5: Tế bào")
                    .build();
            chapterRepository.save(S6Chap5);

            Lesson SciG6C5L1 = Lesson.builder()
                    .chapter(S6Chap5)
                    .lessonNumber(18)
                    .lessonName("Tế bào – Đơn vị cơ bản của sự sống")
                    .description("Bài 18: Tế bào – Đơn vị cơ bản của sự sống")
                    .build();
            lessonRepository.save(SciG6C5L1);

            Lesson SciG6C5L2 = Lesson.builder()
                    .chapter(S6Chap5)
                    .lessonNumber(19)
                    .lessonName("Cấu tạo và chức năng các thành phần của tế bào")
                    .description("Bài 19: Cấu tạo và chức năng các thành phần của tế bào")
                    .build();
            lessonRepository.save(SciG6C5L2);

            Lesson SciG6C5L3 = Lesson.builder()
                    .chapter(S6Chap5)
                    .lessonNumber(20)
                    .lessonName("Sự lớn lên và sinh sản của tế bào")
                    .description("Bài 20: Sự lớn lên và sinh sản của tế bào")
                    .build();
            lessonRepository.save(SciG6C5L3);

// Chapter 6: Từ tế bào đến cơ thể
            Chapter S6Chap6 = Chapter.builder()
                    .subject(science)
                    .gradeLevel(6)
                    .chapterNumber(6)
                    .chapterName("Từ tế bào đến cơ thể")
                    .description("Chương 6: Từ tế bào đến cơ thể")
                    .build();
            chapterRepository.save(S6Chap6);

            Lesson SciG6C6L1 = Lesson.builder()
                    .chapter(S6Chap6)
                    .lessonNumber(21)
                    .lessonName("Cơ thể sinh vật")
                    .description("Bài 22: Cơ thể sinh vật")
                    .build();
            lessonRepository.save(SciG6C6L1);

            Lesson SciG6C6L2 = Lesson.builder()
                    .chapter(S6Chap6)
                    .lessonNumber(22)
                    .lessonName("Tổ chức cơ thể đa bào")
                    .description("Bài 23: Tổ chức cơ thể đa bào")
                    .build();
            lessonRepository.save(SciG6C6L2);

// Chapter 9: Năng lượng
            Chapter S6Chap9 = Chapter.builder()
                    .subject(science)
                    .gradeLevel(6)
                    .chapterNumber(9)
                    .chapterName("Năng lượng")
                    .description("Chương 9: Năng lượng")
                    .build();
            chapterRepository.save(S6Chap9);

            Lesson SciG6C9L1 = Lesson.builder()
                    .chapter(S6Chap9)
                    .lessonNumber(23)
                    .lessonName("Năng lượng và sự truyền năng lượng")
                    .description("Bài 46: Năng lượng và sự truyền năng lượng")
                    .build();
            lessonRepository.save(SciG6C9L1);

            Lesson SciG6C9L2 = Lesson.builder()
                    .chapter(S6Chap9)
                    .lessonNumber(24)
                    .lessonName("Một số dạng năng lượng")
                    .description("Bài 47: Một số dạng năng lượng")
                    .build();
            lessonRepository.save(SciG6C9L2);

            Lesson SciG6C9L3 = Lesson.builder()
                    .chapter(S6Chap9)
                    .lessonNumber(25)
                    .lessonName("Sự chuyển hóa năng lượng")
                    .description("Bài 48: Sự chuyển hóa năng lượng")
                    .build();
            lessonRepository.save(SciG6C9L3);

            Lesson SciG6C9L4 = Lesson.builder()
                    .chapter(S6Chap9)
                    .lessonNumber(26)
                    .lessonName("Năng lượng hao phí")
                    .description("Bài 49: Năng lượng hao phí")
                    .build();
            lessonRepository.save(SciG6C9L4);

            Lesson SciG6C9L5 = Lesson.builder()
                    .chapter(S6Chap9)
                    .lessonNumber(27)
                    .lessonName("Năng lượng tái tạo")
                    .description("Bài 50: Năng lượng tái tạo")
                    .build();
            lessonRepository.save(SciG6C9L5);

            Lesson SciG6C9L6 = Lesson.builder()
                    .chapter(S6Chap9)
                    .lessonNumber(28)
                    .lessonName("Tiết kiệm năng lượng")
                    .description("Bài 51: Tiết kiệm năng lượng")
                    .build();
            lessonRepository.save(SciG6C9L6);

// Chapter 10: Trái đất và bầu trời
            Chapter S6Chap10 = Chapter.builder()
                    .subject(science)
                    .gradeLevel(6)
                    .chapterNumber(10)
                    .chapterName("Trái đất và bầu trời")
                    .description("Chương 10: Trái đất và bầu trời")
                    .build();
            chapterRepository.save(S6Chap10);

            Lesson SciG6C10L1 = Lesson.builder()
                    .chapter(S6Chap10)
                    .lessonNumber(29)
                    .lessonName("Chuyển động nhìn thấy của Mặt Trời. Thiên thể")
                    .description("Bài 52: Chuyển động nhìn thấy của Mặt Trời. Thiên thể")
                    .build();
            lessonRepository.save(SciG6C10L1);

            Lesson SciG6C10L2 = Lesson.builder()
                    .chapter(S6Chap10)
                    .lessonNumber(30)
                    .lessonName("Mặt Trăng")
                    .description("Bài 53: Mặt Trăng")
                    .build();
            lessonRepository.save(SciG6C10L2);

            Lesson SciG6C10L3 = Lesson.builder()
                    .chapter(S6Chap10)
                    .lessonNumber(31)
                    .lessonName("Hệ Mặt Trời")
                    .description("Bài 54: Hệ Mặt Trời")
                    .build();
            lessonRepository.save(SciG6C10L3);

            Lesson SciG6C10L4 = Lesson.builder()
                    .chapter(S6Chap10)
                    .lessonNumber(32)
                    .lessonName("Ngân hà")
                    .description("Bài 55: Ngân hà")
                    .build();
            lessonRepository.save(SciG6C10L4);
            // Grade 7 Science - Chapter 1: Nguyên tử. Sơ lược về bảng tuần hoàn các nguyên tố hóa học
            Chapter S7Chap1 = Chapter.builder()
                    .subject(science)
                    .gradeLevel(7)
                    .chapterNumber(1)
                    .chapterName("Nguyên tử. Sơ lược về bảng tuần hoàn các nguyên tố hóa học")
                    .description("Chương 1: Nguyên tử. Sơ lược về bảng tuần hoàn các nguyên tố hóa học")
                    .build();
            chapterRepository.save(S7Chap1);

            Lesson SciG7C1L1 = Lesson.builder()
                    .chapter(S7Chap1)
                    .lessonNumber(1)
                    .lessonName("Nguyên tử")
                    .description("Bài 2: Nguyên tử")
                    .build();
            lessonRepository.save(SciG7C1L1);

            Lesson SciG7C1L2 = Lesson.builder()
                    .chapter(S7Chap1)
                    .lessonNumber(2)
                    .lessonName("Nguyên tố hóa học")
                    .description("Bài 3: Nguyên tố hóa học")
                    .build();
            lessonRepository.save(SciG7C1L2);

            Lesson SciG7C1L3 = Lesson.builder()
                    .chapter(S7Chap1)
                    .lessonNumber(3)
                    .lessonName("Sơ lược về bảng tuần hoàn nguyên tố hóa học")
                    .description("Bài 4: Sơ lược về bảng tuần hoàn nguyên tố hóa học")
                    .build();
            lessonRepository.save(SciG7C1L3);

// Chapter 2: Phân tử. Liên kết hóa học
            Chapter S7Chap2 = Chapter.builder()
                    .subject(science)
                    .gradeLevel(7)
                    .chapterNumber(2)
                    .chapterName("Phân tử. Liên kết hóa học")
                    .description("Chương 2: Phân tử. Liên kết hóa học")
                    .build();
            chapterRepository.save(S7Chap2);

            Lesson SciG7C2L1 = Lesson.builder()
                    .chapter(S7Chap2)
                    .lessonNumber(4)
                    .lessonName("Phân tử - Đơn chất - Hợp chất")
                    .description("Bài 5: Phân tử - Đơn chất - Hợp chất")
                    .build();
            lessonRepository.save(SciG7C2L1);

            Lesson SciG7C2L2 = Lesson.builder()
                    .chapter(S7Chap2)
                    .lessonNumber(5)
                    .lessonName("Giới thiệu về liên kết hóa học")
                    .description("Bài 6: Giới thiệu về liên kết hóa học")
                    .build();
            lessonRepository.save(SciG7C2L2);

            Lesson SciG7C2L3 = Lesson.builder()
                    .chapter(S7Chap2)
                    .lessonNumber(6)
                    .lessonName("Hóa trị và công thức hóa học")
                    .description("Bài 7: Hóa trị và công thức hóa học")
                    .build();
            lessonRepository.save(SciG7C2L3);

// Chapter 3: Tốc độ
            Chapter S7Chap3 = Chapter.builder()
                    .subject(science)
                    .gradeLevel(7)
                    .chapterNumber(3)
                    .chapterName("Tốc độ")
                    .description("Chương 3: Tốc độ")
                    .build();
            chapterRepository.save(S7Chap3);

            Lesson SciG7C3L1 = Lesson.builder()
                    .chapter(S7Chap3)
                    .lessonNumber(7)
                    .lessonName("Tốc độ ánh sáng")
                    .description("Bài 8: Tốc độ ánh sáng")
                    .build();
            lessonRepository.save(SciG7C3L1);

            Lesson SciG7C3L2 = Lesson.builder()
                    .chapter(S7Chap3)
                    .lessonNumber(8)
                    .lessonName("Đo tốc độ")
                    .description("Bài 9: Đo tốc độ")
                    .build();
            lessonRepository.save(SciG7C3L2);

            Lesson SciG7C3L3 = Lesson.builder()
                    .chapter(S7Chap3)
                    .lessonNumber(9)
                    .lessonName("Đồ thị quãng đường - thời gian")
                    .description("Bài 10: Đồ thị quãng đường - thời gian")
                    .build();
            lessonRepository.save(SciG7C3L3);

            Lesson SciG7C3L4 = Lesson.builder()
                    .chapter(S7Chap3)
                    .lessonNumber(10)
                    .lessonName("Thảo luận về ảnh hưởng của tốc độ trong an toàn giao thông")
                    .description("Bài 11: Thảo luận về ảnh hưởng của tốc độ trong an toàn giao thông")
                    .build();
            lessonRepository.save(SciG7C3L4);

// Chapter 4: Âm thanh
            Chapter S7Chap4 = Chapter.builder()
                    .subject(science)
                    .gradeLevel(7)
                    .chapterNumber(4)
                    .chapterName("Âm thanh")
                    .description("Chương 4: Âm thanh")
                    .build();
            chapterRepository.save(S7Chap4);

            Lesson SciG7C4L1 = Lesson.builder()
                    .chapter(S7Chap4)
                    .lessonNumber(11)
                    .lessonName("Sóng âm")
                    .description("Bài 12: Sóng âm")
                    .build();
            lessonRepository.save(SciG7C4L1);

            Lesson SciG7C4L2 = Lesson.builder()
                    .chapter(S7Chap4)
                    .lessonNumber(12)
                    .lessonName("Độ to và độ cao của âm")
                    .description("Bài 13: Độ to và độ cao của âm")
                    .build();
            lessonRepository.save(SciG7C4L2);

            Lesson SciG7C4L3 = Lesson.builder()
                    .chapter(S7Chap4)
                    .lessonNumber(13)
                    .lessonName("Phản xạ âm, chống ô nhiễm tiếng ồn")
                    .description("Bài 14: Phản xạ âm, chống ô nhiễm tiếng ồn")
                    .build();
            lessonRepository.save(SciG7C4L3);

// Chapter 5: Ánh sáng
            Chapter S7Chap5 = Chapter.builder()
                    .subject(science)
                    .gradeLevel(7)
                    .chapterNumber(5)
                    .chapterName("Ánh sáng")
                    .description("Chương 5: Ánh sáng")
                    .build();
            chapterRepository.save(S7Chap5);

            Lesson SciG7C5L1 = Lesson.builder()
                    .chapter(S7Chap5)
                    .lessonNumber(14)
                    .lessonName("Năng lượng ánh sáng. Tia sáng, vùng tối")
                    .description("Bài 15: Năng lượng ánh sáng. Tia sáng, vùng tối")
                    .build();
            lessonRepository.save(SciG7C5L1);

            Lesson SciG7C5L2 = Lesson.builder()
                    .chapter(S7Chap5)
                    .lessonNumber(15)
                    .lessonName("Sự phản xạ ánh sáng")
                    .description("Bài 16: Sự phản xạ ánh sáng")
                    .build();
            lessonRepository.save(SciG7C5L2);

            Lesson SciG7C5L3 = Lesson.builder()
                    .chapter(S7Chap5)
                    .lessonNumber(16)
                    .lessonName("Ảnh của vật qua gương phẳng")
                    .description("Bài 17: Ảnh của vật qua gương phẳng")
                    .build();
            lessonRepository.save(SciG7C5L3);

// Chapter 6: Từ
            Chapter S7Chap6 = Chapter.builder()
                    .subject(science)
                    .gradeLevel(7)
                    .chapterNumber(6)
                    .chapterName("Từ")
                    .description("Chương 6: Từ")
                    .build();
            chapterRepository.save(S7Chap6);

            Lesson SciG7C6L1 = Lesson.builder()
                    .chapter(S7Chap6)
                    .lessonNumber(17)
                    .lessonName("Nam châm")
                    .description("Bài 18: Nam châm")
                    .build();
            lessonRepository.save(SciG7C6L1);

            Lesson SciG7C6L2 = Lesson.builder()
                    .chapter(S7Chap6)
                    .lessonNumber(18)
                    .lessonName("Từ trường")
                    .description("Bài 19: Từ trường")
                    .build();
            lessonRepository.save(SciG7C6L2);

            Lesson SciG7C6L3 = Lesson.builder()
                    .chapter(S7Chap6)
                    .lessonNumber(19)
                    .lessonName("Chế tạo nam châm điện đơn giản")
                    .description("Bài 20: Chế tạo nam châm điện đơn giản")
                    .build();
            lessonRepository.save(SciG7C6L3);

// Chapter 7: Trao đổi chất và chuyển hóa năng lượng ở sinh vật
            Chapter S7Chap7 = Chapter.builder()
                    .subject(science)
                    .gradeLevel(7)
                    .chapterNumber(7)
                    .chapterName("Trao đổi chất và chuyển hóa năng lượng ở sinh vật")
                    .description("Chương 7: Trao đổi chất và chuyển hóa năng lượng ở sinh vật")
                    .build();
            chapterRepository.save(S7Chap7);

            Lesson SciG7C7L1 = Lesson.builder()
                    .chapter(S7Chap7)
                    .lessonNumber(20)
                    .lessonName("Khái quát về trao đổi chất và chuyển hóa năng lượng")
                    .description("Bài 21: Khái quát về trao đổi chất và chuyển hóa năng lượng")
                    .build();
            lessonRepository.save(SciG7C7L1);

            Lesson SciG7C7L2 = Lesson.builder()
                    .chapter(S7Chap7)
                    .lessonNumber(21)
                    .lessonName("Quang hợp ở thực vật")
                    .description("Bài 22: Quang hợp ở thực vật")
                    .build();
            lessonRepository.save(SciG7C7L2);

            Lesson SciG7C7L3 = Lesson.builder()
                    .chapter(S7Chap7)
                    .lessonNumber(22)
                    .lessonName("Một số yếu tố ảnh hưởng đến quang hợp")
                    .description("Bài 23: Một số yếu tố ảnh hưởng đến quang hợp")
                    .build();
            lessonRepository.save(SciG7C7L3);

            Lesson SciG7C7L4 = Lesson.builder()
                    .chapter(S7Chap7)
                    .lessonNumber(23)
                    .lessonName("Hô hấp tế bào")
                    .description("Bài 25: Hô hấp tế bào")
                    .build();
            lessonRepository.save(SciG7C7L4);

            Lesson SciG7C7L5 = Lesson.builder()
                    .chapter(S7Chap7)
                    .lessonNumber(24)
                    .lessonName("Một số yếu tố ảnh hưởng đến hô hấp tế bào")
                    .description("Bài 26: Một số yếu tố ảnh hưởng đến hô hấp tế bào")
                    .build();
            lessonRepository.save(SciG7C7L5);

            Lesson SciG7C7L6 = Lesson.builder()
                    .chapter(S7Chap7)
                    .lessonNumber(25)
                    .lessonName("Trao đổi khí ở sinh vật")
                    .description("Bài 28: Trao đổi khí ở sinh vật")
                    .build();
            lessonRepository.save(SciG7C7L6);

            Lesson SciG7C7L7 = Lesson.builder()
                    .chapter(S7Chap7)
                    .lessonNumber(26)
                    .lessonName("Vai trò của nước và chất dinh dưỡng ở thực vật")
                    .description("Bài 29: Vai trò của nước và chất dinh dưỡng ở thực vật")
                    .build();
            lessonRepository.save(SciG7C7L7);

            Lesson SciG7C7L8 = Lesson.builder()
                    .chapter(S7Chap7)
                    .lessonNumber(27)
                    .lessonName("Trao đổi nước và chất dinh dưỡng ở thực vật")
                    .description("Bài 30: Trao đổi nước và chất dinh dưỡng ở thực vật")
                    .build();
            lessonRepository.save(SciG7C7L8);

            Lesson SciG7C7L9 = Lesson.builder()
                    .chapter(S7Chap7)
                    .lessonNumber(28)
                    .lessonName("Trao đổi nước và chất dinh dưỡng ở động vật")
                    .description("Bài 31: Trao đổi nước và chất dinh dưỡng ở động vật")
                    .build();
            lessonRepository.save(SciG7C7L9);

// Chapter 8: Cảm ứng ở sinh vật
            Chapter S7Chap8 = Chapter.builder()
                    .subject(science)
                    .gradeLevel(7)
                    .chapterNumber(8)
                    .chapterName("Cảm ứng ở sinh vật")
                    .description("Chương 8: Cảm ứng ở sinh vật")
                    .build();
            chapterRepository.save(S7Chap8);

            Lesson SciG7C8L1 = Lesson.builder()
                    .chapter(S7Chap8)
                    .lessonNumber(29)
                    .lessonName("Cảm ứng ở sinh vật và tập tính ở động vật")
                    .description("Bài 33: Cảm ứng ở sinh vật và tập tính ở động vật")
                    .build();
            lessonRepository.save(SciG7C8L1);

            Lesson SciG7C8L2 = Lesson.builder()
                    .chapter(S7Chap8)
                    .lessonNumber(30)
                    .lessonName("Vận dụng cảm ứng ở sinh vật vào thực tiễn")
                    .description("Bài 34: Vận dụng cảm ứng ở sinh vật vào thực tiễn")
                    .build();
            lessonRepository.save(SciG7C8L2);

// Chapter 9: Sinh trưởng và phát triển ở sinh vật
            Chapter S7Chap9 = Chapter.builder()
                    .subject(science)
                    .gradeLevel(7)
                    .chapterNumber(9)
                    .chapterName("Sinh trưởng và phát triển ở sinh vật")
                    .description("Chương 9: Sinh trưởng và phát triển ở sinh vật")
                    .build();
            chapterRepository.save(S7Chap9);

            Lesson SciG7C9L1 = Lesson.builder()
                    .chapter(S7Chap9)
                    .lessonNumber(31)
                    .lessonName("Khát quát về sinh trưởng và phát triển ở sinh vật")
                    .description("Bài 36: Khát quát về sinh trưởng và phát triển ở sinh vật")
                    .build();
            lessonRepository.save(SciG7C9L1);

            Lesson SciG7C9L2 = Lesson.builder()
                    .chapter(S7Chap9)
                    .lessonNumber(32)
                    .lessonName("Ứng dụng sinh trưởng và phát triển ở sinh vật vào thực tiễn")
                    .description("Bài 37: Ứng dụng sinh trưởng và phát triển ở sinh vật vào thực tiễn")
                    .build();
            lessonRepository.save(SciG7C9L2);

// Chapter 10: Sinh sản ở sinh vật
            Chapter S7Chap10 = Chapter.builder()
                    .subject(science)
                    .gradeLevel(7)
                    .chapterNumber(10)
                    .chapterName("Sinh sản ở sinh vật")
                    .description("Chương 10: Sinh sản ở sinh vật")
                    .build();
            chapterRepository.save(S7Chap10);

            Lesson SciG7C10L1 = Lesson.builder()
                    .chapter(S7Chap10)
                    .lessonNumber(33)
                    .lessonName("Sinh sản vô tính ở sinh vật")
                    .description("Bài 39: Sinh sản vô tính ở sinh vật")
                    .build();
            lessonRepository.save(SciG7C10L1);

            Lesson SciG7C10L2 = Lesson.builder()
                    .chapter(S7Chap10)
                    .lessonNumber(34)
                    .lessonName("Sinh sản hữu tính ở sinh vật")
                    .description("Bài 40: Sinh sản hữu tính ở sinh vật")
                    .build();
            lessonRepository.save(SciG7C10L2);

            Lesson SciG7C10L3 = Lesson.builder()
                    .chapter(S7Chap10)
                    .lessonNumber(35)
                    .lessonName("Một số yếu tố ảnh hưởng và điều hòa, điều khiến sinh sản ở sinh vật")
                    .description("Bài 41: Một số yếu tố ảnh hưởng và điều hòa, điều khiến sinh sản ở sinh vật")
                    .build();
            lessonRepository.save(SciG7C10L3);

            Lesson SciG7C10L4 = Lesson.builder()
                    .chapter(S7Chap10)
                    .lessonNumber(36)
                    .lessonName("Cơ thể sinh vật là một thể thống nhất")
                    .description("Bài 42: Cơ thể sinh vật là một thể thống nhất")
                    .build();
            lessonRepository.save(SciG7C10L4);
            // Grade 8 Science - Chapter 1: Phản ứng hóa học
            Chapter S8Chap1 = Chapter.builder()
                    .subject(science)
                    .gradeLevel(8)
                    .chapterNumber(1)
                    .chapterName("Phản ứng hóa học")
                    .description("Chương 1: Phản ứng hóa học")
                    .build();
            chapterRepository.save(S8Chap1);

            Lesson SciG8C1L1 = Lesson.builder()
                    .chapter(S8Chap1)
                    .lessonNumber(1)
                    .lessonName("Phản ứng hóa học")
                    .description("Bài 2: Phản ứng hóa học")
                    .build();
            lessonRepository.save(SciG8C1L1);

            Lesson SciG8C1L2 = Lesson.builder()
                    .chapter(S8Chap1)
                    .lessonNumber(2)
                    .lessonName("Mol và tỉ khối chất khí")
                    .description("Bài 3: Mol và tỉ khối chất khí")
                    .build();
            lessonRepository.save(SciG8C1L2);

            Lesson SciG8C1L3 = Lesson.builder()
                    .chapter(S8Chap1)
                    .lessonNumber(3)
                    .lessonName("Dung dịch và nồng độ")
                    .description("Bài 4: Dung dịch và nồng độ")
                    .build();
            lessonRepository.save(SciG8C1L3);

            Lesson SciG8C1L4 = Lesson.builder()
                    .chapter(S8Chap1)
                    .lessonNumber(4)
                    .lessonName("Định luật bảo toàn khối lượng và phương trình hóa học")
                    .description("Bài 5: Định luật bảo toàn khối lượng và phương trình hóa học")
                    .build();
            lessonRepository.save(SciG8C1L4);

            Lesson SciG8C1L5 = Lesson.builder()
                    .chapter(S8Chap1)
                    .lessonNumber(5)
                    .lessonName("Tính theo phương trình hóa học")
                    .description("Bài 6: Tính theo phương trình hóa học")
                    .build();
            lessonRepository.save(SciG8C1L5);

            Lesson SciG8C1L6 = Lesson.builder()
                    .chapter(S8Chap1)
                    .lessonNumber(6)
                    .lessonName("Tốc độ phản ứng và chất xúc tác")
                    .description("Bài 7: Tốc độ phản ứng và chất xúc tác")
                    .build();
            lessonRepository.save(SciG8C1L6);

// Chapter 2: Một số hợp chất thông dụng
            Chapter S8Chap2 = Chapter.builder()
                    .subject(science)
                    .gradeLevel(8)
                    .chapterNumber(2)
                    .chapterName("Một số hợp chất thông dụng")
                    .description("Chương 2: Một số hợp chất thông dụng")
                    .build();
            chapterRepository.save(S8Chap2);

            Lesson SciG8C2L1 = Lesson.builder()
                    .chapter(S8Chap2)
                    .lessonNumber(7)
                    .lessonName("Acid")
                    .description("Bài 8: Acid")
                    .build();
            lessonRepository.save(SciG8C2L1);

            Lesson SciG8C2L2 = Lesson.builder()
                    .chapter(S8Chap2)
                    .lessonNumber(8)
                    .lessonName("Base. Thang pH")
                    .description("Bài 9: Base. Thang pH")
                    .build();
            lessonRepository.save(SciG8C2L2);

            Lesson SciG8C2L3 = Lesson.builder()
                    .chapter(S8Chap2)
                    .lessonNumber(9)
                    .lessonName("Oxide")
                    .description("Bài 10: Oxide")
                    .build();
            lessonRepository.save(SciG8C2L3);

            Lesson SciG8C2L4 = Lesson.builder()
                    .chapter(S8Chap2)
                    .lessonNumber(10)
                    .lessonName("Muối")
                    .description("Bài 11: Muối")
                    .build();
            lessonRepository.save(SciG8C2L4);

            Lesson SciG8C2L5 = Lesson.builder()
                    .chapter(S8Chap2)
                    .lessonNumber(11)
                    .lessonName("Phân bón hóa học")
                    .description("Bài 12: Phân bón hóa học")
                    .build();
            lessonRepository.save(SciG8C2L5);

// Chapter 3: Khối lượng riêng và áp suất
            Chapter S8Chap3 = Chapter.builder()
                    .subject(science)
                    .gradeLevel(8)
                    .chapterNumber(3)
                    .chapterName("Khối lượng riêng và áp suất")
                    .description("Chương 3: Khối lượng riêng và áp suất")
                    .build();
            chapterRepository.save(S8Chap3);

            Lesson SciG8C3L1 = Lesson.builder()
                    .chapter(S8Chap3)
                    .lessonNumber(12)
                    .lessonName("Khối lượng riêng")
                    .description("Bài 13: Khối lượng riêng")
                    .build();
            lessonRepository.save(SciG8C3L1);

            Lesson SciG8C3L2 = Lesson.builder()
                    .chapter(S8Chap3)
                    .lessonNumber(13)
                    .lessonName("Thực hành xác định khối lượng riêng")
                    .description("Bài 14: Thực hành xác định khối lượng riêng")
                    .build();
            lessonRepository.save(SciG8C3L2);

            Lesson SciG8C3L3 = Lesson.builder()
                    .chapter(S8Chap3)
                    .lessonNumber(14)
                    .lessonName("Áp suất trên một bề mặt")
                    .description("Bài 15: Áp suất trên một bề mặt")
                    .build();
            lessonRepository.save(SciG8C3L3);

            Lesson SciG8C3L4 = Lesson.builder()
                    .chapter(S8Chap3)
                    .lessonNumber(15)
                    .lessonName("Áp suất chất lỏng. Áp suất khí quyển")
                    .description("Bài 16: Áp suất chất lỏng. Áp suất khí quyển")
                    .build();
            lessonRepository.save(SciG8C3L4);

            Lesson SciG8C3L5 = Lesson.builder()
                    .chapter(S8Chap3)
                    .lessonNumber(16)
                    .lessonName("Lực đẩy Archimedes")
                    .description("Bài 17: Lực đẩy Archimedes")
                    .build();
            lessonRepository.save(SciG8C3L5);

// Chapter 4: Tác dụng làm quay của lực
            Chapter S8Chap4 = Chapter.builder()
                    .subject(science)
                    .gradeLevel(8)
                    .chapterNumber(4)
                    .chapterName("Tác dụng làm quay của lực")
                    .description("Chương 4: Tác dụng làm quay của lực")
                    .build();
            chapterRepository.save(S8Chap4);

            Lesson SciG8C4L1 = Lesson.builder()
                    .chapter(S8Chap4)
                    .lessonNumber(17)
                    .lessonName("Tác dụng làm quay của lực. Moment lực")
                    .description("Bài 18: Tác dụng làm quay của lực. Moment lực")
                    .build();
            lessonRepository.save(SciG8C4L1);

            Lesson SciG8C4L2 = Lesson.builder()
                    .chapter(S8Chap4)
                    .lessonNumber(18)
                    .lessonName("Đòn bẩy và ứng dụng")
                    .description("Bài 19: Đòn bẩy và ứng dụng")
                    .build();
            lessonRepository.save(SciG8C4L2);

// Chapter 5: Điện
            Chapter S8Chap5 = Chapter.builder()
                    .subject(science)
                    .gradeLevel(8)
                    .chapterNumber(5)
                    .chapterName("Điện")
                    .description("Chương 5: Điện")
                    .build();
            chapterRepository.save(S8Chap5);

            Lesson SciG8C5L1 = Lesson.builder()
                    .chapter(S8Chap5)
                    .lessonNumber(19)
                    .lessonName("Nhiễm điện do co xát")
                    .description("Bài 20: Nhiễm điện do co xát")
                    .build();
            lessonRepository.save(SciG8C5L1);

            Lesson SciG8C5L2 = Lesson.builder()
                    .chapter(S8Chap5)
                    .lessonNumber(20)
                    .lessonName("Dòng điện, nguồn điện")
                    .description("Bài 21: Dòng điện, nguồn điện")
                    .build();
            lessonRepository.save(SciG8C5L2);

            Lesson SciG8C5L3 = Lesson.builder()
                    .chapter(S8Chap5)
                    .lessonNumber(21)
                    .lessonName("Mạch điện đơn giản")
                    .description("Bài 22: Mạch điện đơn giản")
                    .build();
            lessonRepository.save(SciG8C5L3);

            Lesson SciG8C5L4 = Lesson.builder()
                    .chapter(S8Chap5)
                    .lessonNumber(22)
                    .lessonName("Tác dụng của dòng điện")
                    .description("Bài 23: Tác dụng của dòng điện")
                    .build();
            lessonRepository.save(SciG8C5L4);

            Lesson SciG8C5L5 = Lesson.builder()
                    .chapter(S8Chap5)
                    .lessonNumber(23)
                    .lessonName("Cường độ dòng điện và hiệu điện thế")
                    .description("Bài 24: Cường độ dòng điện và hiệu điện thế")
                    .build();
            lessonRepository.save(SciG8C5L5);

            Lesson SciG8C5L6 = Lesson.builder()
                    .chapter(S8Chap5)
                    .lessonNumber(24)
                    .lessonName("Thực hành đo cường độ dòng điện và hiệu điện thế")
                    .description("Bài 25: Thực hành đo cường độ dòng điện và hiệu điện thế")
                    .build();
            lessonRepository.save(SciG8C5L6);

// Chapter 6: Nhiệt
            Chapter S8Chap6 = Chapter.builder()
                    .subject(science)
                    .gradeLevel(8)
                    .chapterNumber(6)
                    .chapterName("Nhiệt")
                    .description("Chương 6: Nhiệt")
                    .build();
            chapterRepository.save(S8Chap6);

            Lesson SciG8C6L1 = Lesson.builder()
                    .chapter(S8Chap6)
                    .lessonNumber(25)
                    .lessonName("Năng lượng nhiệt và nội năng")
                    .description("Bài 26: Năng lượng nhiệt và nội năng")
                    .build();
            lessonRepository.save(SciG8C6L1);

            Lesson SciG8C6L2 = Lesson.builder()
                    .chapter(S8Chap6)
                    .lessonNumber(26)
                    .lessonName("Sự truyền nhiệt")
                    .description("Bài 28: Sự truyền nhiệt")
                    .build();
            lessonRepository.save(SciG8C6L2);

            Lesson SciG8C6L3 = Lesson.builder()
                    .chapter(S8Chap6)
                    .lessonNumber(27)
                    .lessonName("Sự nở vì nhiệt")
                    .description("Bài 29: Sự nở vì nhiệt")
                    .build();
            lessonRepository.save(SciG8C6L3);

// Chapter 7: Sinh học cơ thể người
            Chapter S8Chap7 = Chapter.builder()
                    .subject(science)
                    .gradeLevel(8)
                    .chapterNumber(7)
                    .chapterName("Sinh học cơ thể người")
                    .description("Chương 7: Sinh học cơ thể người")
                    .build();
            chapterRepository.save(S8Chap7);

            Lesson SciG8C7L1 = Lesson.builder()
                    .chapter(S8Chap7)
                    .lessonNumber(28)
                    .lessonName("Khát quát về cơ thể người")
                    .description("Bài 30: Khát quát về cơ thể người")
                    .build();
            lessonRepository.save(SciG8C7L1);

            Lesson SciG8C7L2 = Lesson.builder()
                    .chapter(S8Chap7)
                    .lessonNumber(29)
                    .lessonName("Hệ vận động ở người")
                    .description("Bài 31: Hệ vận động ở người")
                    .build();
            lessonRepository.save(SciG8C7L2);

            Lesson SciG8C7L3 = Lesson.builder()
                    .chapter(S8Chap7)
                    .lessonNumber(30)
                    .lessonName("Dinh dưỡng và tiêu hóa ở người")
                    .description("Bài 32: Dinh dưỡng và tiêu hóa ở người")
                    .build();
            lessonRepository.save(SciG8C7L3);

            Lesson SciG8C7L4 = Lesson.builder()
                    .chapter(S8Chap7)
                    .lessonNumber(31)
                    .lessonName("Máu và hệ tuần hoàn ở cơ thể người")
                    .description("Bài 33: Máu và hệ tuần hoàn ở cơ thể người")
                    .build();
            lessonRepository.save(SciG8C7L4);

            Lesson SciG8C7L5 = Lesson.builder()
                    .chapter(S8Chap7)
                    .lessonNumber(32)
                    .lessonName("Hệ hô hấp ở người")
                    .description("Bài 34: Hệ hô hấp ở người")
                    .build();
            lessonRepository.save(SciG8C7L5);

            Lesson SciG8C7L6 = Lesson.builder()
                    .chapter(S8Chap7)
                    .lessonNumber(33)
                    .lessonName("Hệ bài tiết ở người")
                    .description("Bài 35: Hệ bài tiết ở người")
                    .build();
            lessonRepository.save(SciG8C7L6);

            Lesson SciG8C7L7 = Lesson.builder()
                    .chapter(S8Chap7)
                    .lessonNumber(34)
                    .lessonName("Điều hòa môi trường trong của cơ thể người")
                    .description("Bài 36: Điều hòa môi trường trong của cơ thể người")
                    .build();
            lessonRepository.save(SciG8C7L7);

            Lesson SciG8C7L8 = Lesson.builder()
                    .chapter(S8Chap7)
                    .lessonNumber(35)
                    .lessonName("Hệ thần kinh và các giác quan ở người")
                    .description("Bài 37: Hệ thần kinh và các giác quan ở người")
                    .build();
            lessonRepository.save(SciG8C7L8);

            Lesson SciG8C7L9 = Lesson.builder()
                    .chapter(S8Chap7)
                    .lessonNumber(36)
                    .lessonName("Hệ nội tiết ở người")
                    .description("Bài 38: Hệ nội tiết ở người")
                    .build();
            lessonRepository.save(SciG8C7L9);

            Lesson SciG8C7L10 = Lesson.builder()
                    .chapter(S8Chap7)
                    .lessonNumber(37)
                    .lessonName("Da và điều hòa thân nhiệt ở người")
                    .description("Bài 39: Da và điều hòa thân nhiệt ở người")
                    .build();
            lessonRepository.save(SciG8C7L10);

            Lesson SciG8C7L11 = Lesson.builder()
                    .chapter(S8Chap7)
                    .lessonNumber(38)
                    .lessonName("Sinh sản ở người")
                    .description("Bài 40: Sinh sản ở người")
                    .build();
            lessonRepository.save(SciG8C7L11);

// Chapter 8: Sinh vật và môi trường
            Chapter S8Chap8 = Chapter.builder()
                    .subject(science)
                    .gradeLevel(8)
                    .chapterNumber(8)
                    .chapterName("Sinh vật và môi trường")
                    .description("Chương 8: Sinh vật và môi trường")
                    .build();
            chapterRepository.save(S8Chap8);

            Lesson SciG8C8L1 = Lesson.builder()
                    .chapter(S8Chap8)
                    .lessonNumber(39)
                    .lessonName("Môi trường và các nhân tố sinh thái")
                    .description("Bài 41: Môi trường và các nhân tố sinh thái")
                    .build();
            lessonRepository.save(SciG8C8L1);

            Lesson SciG8C8L2 = Lesson.builder()
                    .chapter(S8Chap8)
                    .lessonNumber(40)
                    .lessonName("Quần thể sinh vật")
                    .description("Bài 42: Quần thể sinh vật")
                    .build();
            lessonRepository.save(SciG8C8L2);

            Lesson SciG8C8L3 = Lesson.builder()
                    .chapter(S8Chap8)
                    .lessonNumber(41)
                    .lessonName("Quần xã sinh vật")
                    .description("Bài 43: Quần xã sinh vật")
                    .build();
            lessonRepository.save(SciG8C8L3);

            Lesson SciG8C8L4 = Lesson.builder()
                    .chapter(S8Chap8)
                    .lessonNumber(42)
                    .lessonName("Hệ sinh thái")
                    .description("Bài 44: Hệ sinh thái")
                    .build();
            lessonRepository.save(SciG8C8L4);

            Lesson SciG8C8L5 = Lesson.builder()
                    .chapter(S8Chap8)
                    .lessonNumber(43)
                    .lessonName("Sinh quyển")
                    .description("Bài 45: Sinh quyển")
                    .build();
            lessonRepository.save(SciG8C8L5);

            Lesson SciG8C8L6 = Lesson.builder()
                    .chapter(S8Chap8)
                    .lessonNumber(44)
                    .lessonName("Cân bằng tự nhiên")
                    .description("Bài 46: Cân bằng tự nhiên")
                    .build();
            lessonRepository.save(SciG8C8L6);

            Lesson SciG8C8L7 = Lesson.builder()
                    .chapter(S8Chap8)
                    .lessonNumber(45)
                    .lessonName("Bảo vệ môi trường")
                    .description("Bài 47: Bảo vệ môi trường")
                    .build();
            lessonRepository.save(SciG8C8L7);
            if (physics != null) {
                // Vật lý 10 - Chương 1
                // Grade 9 Science - Chapter I: NĂNG LƯỢNG CƠ HỌC
                Chapter S9Chap1 = Chapter.builder()
                        .subject(science)
                        .gradeLevel(9)
                        .chapterNumber(1)
                        .chapterName("NĂNG LƯỢNG CƠ HỌC")
                        .description("Chương I. NĂNG LƯỢNG CƠ HỌC")
                        .build();
                chapterRepository.save(S9Chap1);

                Lesson SciG9C1L1 = Lesson.builder()
                        .chapter(S9Chap1)
                        .lessonNumber(1)
                        .lessonName("Nhận biết một số dụng cụ, hoá chất. Thuyết trình một vấn đề khoa học")
                        .description("Bài 1: Nhận biết một số dụng cụ, hoá chất. Thuyết trình một vấn đề khoa học")
                        .build();
                lessonRepository.save(SciG9C1L1);

                Lesson SciG9C1L2 = Lesson.builder()
                        .chapter(S9Chap1)
                        .lessonNumber(2)
                        .lessonName("Động năng")
                        .description("Bài 2. Động năng")
                        .build();
                lessonRepository.save(SciG9C1L2);

                Lesson SciG9C1L3 = Lesson.builder()
                        .chapter(S9Chap1)
                        .lessonNumber(3)
                        .lessonName("Cơ năng")
                        .description("Bài 3. Cơ năng")
                        .build();
                lessonRepository.save(SciG9C1L3);

                Lesson SciG9C1L4 = Lesson.builder()
                        .chapter(S9Chap1)
                        .lessonNumber(4)
                        .lessonName("Công và công suất")
                        .description("Bài 4. Công và công suất")
                        .build();
                lessonRepository.save(SciG9C1L4);

// Chapter II: ÁNH SÁNG
                Chapter S9Chap2 = Chapter.builder()
                        .subject(science)
                        .gradeLevel(9)
                        .chapterNumber(2)
                        .chapterName("ÁNH SÁNG")
                        .description("Chương II. ÁNH SÁNG")
                        .build();
                chapterRepository.save(S9Chap2);

                Lesson SciG9C2L1 = Lesson.builder()
                        .chapter(S9Chap2)
                        .lessonNumber(5)
                        .lessonName("Khúc xạ ánh sáng")
                        .description("Bài 5. Khúc xạ ánh sáng")
                        .build();
                lessonRepository.save(SciG9C2L1);

                Lesson SciG9C2L2 = Lesson.builder()
                        .chapter(S9Chap2)
                        .lessonNumber(6)
                        .lessonName("Phản xạ toàn phần")
                        .description("Bài 6. Phản xạ toàn phần")
                        .build();
                lessonRepository.save(SciG9C2L2);

                Lesson SciG9C2L3 = Lesson.builder()
                        .chapter(S9Chap2)
                        .lessonNumber(7)
                        .lessonName("Lăng kính")
                        .description("Bài 7. Lăng kính")
                        .build();
                lessonRepository.save(SciG9C2L3);

                Lesson SciG9C2L4 = Lesson.builder()
                        .chapter(S9Chap2)
                        .lessonNumber(8)
                        .lessonName("Thấu kính")
                        .description("Bài 8. Thấu kính")
                        .build();
                lessonRepository.save(SciG9C2L4);

                Lesson SciG9C2L5 = Lesson.builder()
                        .chapter(S9Chap2)
                        .lessonNumber(9)
                        .lessonName("Kính lúp. Bài tập thấu kính")
                        .description("Bài 10. Kính lúp. Bài tập thấu kính")
                        .build();
                lessonRepository.save(SciG9C2L5);

// Chapter III: ĐIỆN
                Chapter S9Chap3 = Chapter.builder()
                        .subject(science)
                        .gradeLevel(9)
                        .chapterNumber(3)
                        .chapterName("ĐIỆN")
                        .description("Chương III. ĐIỆN")
                        .build();
                chapterRepository.save(S9Chap3);

                Lesson SciG9C3L1 = Lesson.builder()
                        .chapter(S9Chap3)
                        .lessonNumber(10)
                        .lessonName("Điện trở. Định luật Ohm")
                        .description("Bài 11. Điện trở. Định luật Ohm")
                        .build();
                lessonRepository.save(SciG9C3L1);

                Lesson SciG9C3L2 = Lesson.builder()
                        .chapter(S9Chap3)
                        .lessonNumber(11)
                        .lessonName("Đoạn mạch nối tiếp, song song")
                        .description("Bài 12. Đoạn mạch nối tiếp, song song")
                        .build();
                lessonRepository.save(SciG9C3L2);

                Lesson SciG9C3L3 = Lesson.builder()
                        .chapter(S9Chap3)
                        .lessonNumber(12)
                        .lessonName("Năng lượng của dòng điện và công suất điện")
                        .description("Bài 13. Năng lượng của dòng điện và công suất điện")
                        .build();
                lessonRepository.save(SciG9C3L3);

// Chapter IV: ĐIỆN TỪ
                Chapter S9Chap4 = Chapter.builder()
                        .subject(science)
                        .gradeLevel(9)
                        .chapterNumber(4)
                        .chapterName("ĐIỆN TỪ")
                        .description("Chương IV. ĐIỆN TỪ")
                        .build();
                chapterRepository.save(S9Chap4);

                Lesson SciG9C4L1 = Lesson.builder()
                        .chapter(S9Chap4)
                        .lessonNumber(13)
                        .lessonName("Cảm ứng điện từ. Nguyên tắc tạo ra dòng điện xoay chiều")
                        .description("Bài 14. Cảm ứng điện từ. Nguyên tắc tạo ra dòng điện xoay chiều")
                        .build();
                lessonRepository.save(SciG9C4L1);

                Lesson SciG9C4L2 = Lesson.builder()
                        .chapter(S9Chap4)
                        .lessonNumber(14)
                        .lessonName("Tác dụng của dòng điện xoay chiều")
                        .description("Bài 15. Tác dụng của dòng điện xoay chiều")
                        .build();
                lessonRepository.save(SciG9C4L2);

// Chapter V: NĂNG LƯỢNG VỚI CUỘC SỐNG
                Chapter S9Chap5 = Chapter.builder()
                        .subject(science)
                        .gradeLevel(9)
                        .chapterNumber(5)
                        .chapterName("NĂNG LƯỢNG VỚI CUỘC SỐNG")
                        .description("Chương V. NĂNG LƯỢNG VỚI CUỘC SỐNG")
                        .build();
                chapterRepository.save(S9Chap5);

                Lesson SciG9C5L1 = Lesson.builder()
                        .chapter(S9Chap5)
                        .lessonNumber(15)
                        .lessonName("Vòng năng lượng trên Trái Đất. Năng lượng hoá thạch")
                        .description("Bài 16. Vòng năng lượng trên Trái Đất. Năng lượng hoá thạch")
                        .build();
                lessonRepository.save(SciG9C5L1);

                Lesson SciG9C5L2 = Lesson.builder()
                        .chapter(S9Chap5)
                        .lessonNumber(16)
                        .lessonName("Một số dạng năng lượng tái tạo")
                        .description("Bài 17. Một số dạng năng lượng tái tạo")
                        .build();
                lessonRepository.save(SciG9C5L2);

// Chapter VI: KIM LOẠI. SỰ KHÁC NHAU CƠ BẢN GIỮA PHI KIM VÀ KIM LOẠI
                Chapter S9Chap6 = Chapter.builder()
                        .subject(science)
                        .gradeLevel(9)
                        .chapterNumber(6)
                        .chapterName("KIM LOẠI. SỰ KHÁC NHAU CƠ BẢN GIỮA PHI KIM VÀ KIM LOẠI")
                        .description("Chương VI. KIM LOẠI. SỰ KHÁC NHAU CƠ BẢN GIỮA PHI KIM VÀ KIM LOẠI")
                        .build();
                chapterRepository.save(S9Chap6);

                Lesson SciG9C6L1 = Lesson.builder()
                        .chapter(S9Chap6)
                        .lessonNumber(17)
                        .lessonName("Tính chất chung của kim loại")
                        .description("Bài 18. Tính chất chung của kim loại")
                        .build();
                lessonRepository.save(SciG9C6L1);

                Lesson SciG9C6L2 = Lesson.builder()
                        .chapter(S9Chap6)
                        .lessonNumber(18)
                        .lessonName("Dây hoạt động hoá học")
                        .description("Bài 19. Dây hoạt động hoá học")
                        .build();
                lessonRepository.save(SciG9C6L2);

                Lesson SciG9C6L3 = Lesson.builder()
                        .chapter(S9Chap6)
                        .lessonNumber(19)
                        .lessonName("Tách kim loại và việc sử dụng hợp kim")
                        .description("Bài 20. Tách kim loại và việc sử dụng hợp kim")
                        .build();
                lessonRepository.save(SciG9C6L3);

                Lesson SciG9C6L4 = Lesson.builder()
                        .chapter(S9Chap6)
                        .lessonNumber(20)
                        .lessonName("Sự khác nhau cơ bản giữa phi kim và kim loại")
                        .description("Bài 21. Sự khác nhau cơ bản giữa phi kim và kim loại")
                        .build();
                lessonRepository.save(SciG9C6L4);

// Chapter VII: GIỚI THIỆU VỀ CHẤT HỦU CƠ. HYDROCARBON VÀ NGUỒN NHIÊN LIỆU
                Chapter S9Chap7 = Chapter.builder()
                        .subject(science)
                        .gradeLevel(9)
                        .chapterNumber(7)
                        .chapterName("GIỚI THIỆU VỀ CHẤT HỦU CƠ. HYDROCARBON VÀ NGUỒN NHIÊN LIỆU")
                        .description("Chương VII. GIỚI THIỆU VỀ CHẤT HỦU CƠ. HYDROCARBON VÀ NGUỒN NHIÊN LIỆU")
                        .build();
                chapterRepository.save(S9Chap7);

                Lesson SciG9C7L1 = Lesson.builder()
                        .chapter(S9Chap7)
                        .lessonNumber(21)
                        .lessonName("Giới thiệu về hợp chất hữu cơ")
                        .description("Bài 22. Giới thiệu về hợp chất hữu cơ")
                        .build();
                lessonRepository.save(SciG9C7L1);

                Lesson SciG9C7L2 = Lesson.builder()
                        .chapter(S9Chap7)
                        .lessonNumber(22)
                        .lessonName("Alkane")
                        .description("Bài 23. Alkane")
                        .build();
                lessonRepository.save(SciG9C7L2);

                Lesson SciG9C7L3 = Lesson.builder()
                        .chapter(S9Chap7)
                        .lessonNumber(23)
                        .lessonName("Alkene")
                        .description("Bài 24. Alkene")
                        .build();
                lessonRepository.save(SciG9C7L3);

                Lesson SciG9C7L4 = Lesson.builder()
                        .chapter(S9Chap7)
                        .lessonNumber(24)
                        .lessonName("Nguồn nhiên liệu")
                        .description("Bài 25. Nguồn nhiên liệu")
                        .build();
                lessonRepository.save(SciG9C7L4);

// Chapter VIII: ETHYLIC ALCOHOL VÀ ACETIC ACID
                Chapter S9Chap8 = Chapter.builder()
                        .subject(science)
                        .gradeLevel(9)
                        .chapterNumber(8)
                        .chapterName("ETHYLIC ALCOHOL VÀ ACETIC ACID")
                        .description("Chương VIII. ETHYLIC ALCOHOL VÀ ACETIC ACID")
                        .build();
                chapterRepository.save(S9Chap8);

                Lesson SciG9C8L1 = Lesson.builder()
                        .chapter(S9Chap8)
                        .lessonNumber(25)
                        .lessonName("Ethylic alcohol")
                        .description("Bài 26. Ethylic alcohol")
                        .build();
                lessonRepository.save(SciG9C8L1);

                Lesson SciG9C8L2 = Lesson.builder()
                        .chapter(S9Chap8)
                        .lessonNumber(26)
                        .lessonName("Acetic acid")
                        .description("Bài 27. Acetic acid")
                        .build();
                lessonRepository.save(SciG9C8L2);
                // Chapter IX: LIPID. CARBOHYDRATE. PROTEIN. POLYMER
                Chapter S9Chap9 = Chapter.builder()
                        .subject(science)
                        .gradeLevel(9)
                        .chapterNumber(9)
                        .chapterName("LIPID. CARBOHYDRATE. PROTEIN. POLYMER")
                        .description("Chương IX. LIPID. CARBOHYDRATE. PROTEIN. POLYMER")
                        .build();
                chapterRepository.save(S9Chap9);

                Lesson SciG9C9L1 = Lesson.builder()
                        .chapter(S9Chap9)
                        .lessonNumber(27)
                        .lessonName("Lipid")
                        .description("Bài 28. Lipid")
                        .build();
                lessonRepository.save(SciG9C9L1);

                Lesson SciG9C9L2 = Lesson.builder()
                        .chapter(S9Chap9)
                        .lessonNumber(28)
                        .lessonName("Carbohydrate. Glucose và saccharose")
                        .description("Bài 29. Carbohydrate. Glucose và saccharose")
                        .build();
                lessonRepository.save(SciG9C9L2);

                Lesson SciG9C9L3 = Lesson.builder()
                        .chapter(S9Chap9)
                        .lessonNumber(29)
                        .lessonName("Tinh bột và cellulose")
                        .description("Bài 30. Tinh bột và cellulose")
                        .build();
                lessonRepository.save(SciG9C9L3);

                Lesson SciG9C9L4 = Lesson.builder()
                        .chapter(S9Chap9)
                        .lessonNumber(30)
                        .lessonName("Protein")
                        .description("Bài 31. Protein")
                        .build();
                lessonRepository.save(SciG9C9L4);

                Lesson SciG9C9L5 = Lesson.builder()
                        .chapter(S9Chap9)
                        .lessonNumber(31)
                        .lessonName("Polymer")
                        .description("Bài 32. Polymer")
                        .build();
                lessonRepository.save(SciG9C9L5);

// Chapter X: KHAI THÁC TÀI NGUYÊN TỪ VỎ TRÁI ĐẤT
                Chapter S9Chap10 = Chapter.builder()
                        .subject(science)
                        .gradeLevel(9)
                        .chapterNumber(10)
                        .chapterName("KHAI THÁC TÀI NGUYÊN TỪ VỎ TRÁI ĐẤT")
                        .description("Chương X. KHAI THÁC TÀI NGUYÊN TỪ VỎ TRÁI ĐẤT")
                        .build();
                chapterRepository.save(S9Chap10);

                Lesson SciG9C10L1 = Lesson.builder()
                        .chapter(S9Chap10)
                        .lessonNumber(32)
                        .lessonName("Sơ lược về hoá học vỏ Trái Đất và khai thác tài nguyên từ vỏ Trái Đất")
                        .description("Bài 33. Sơ lược về hoá học vỏ Trái Đất và khai thác tài nguyên từ vỏ Trái Đất")
                        .build();
                lessonRepository.save(SciG9C10L1);

                Lesson SciG9C10L2 = Lesson.builder()
                        .chapter(S9Chap10)
                        .lessonNumber(33)
                        .lessonName("Khai thác đá vôi. Công nghiệp silicate")
                        .description("Bài 34. Khai thác đá vôi. Công nghiệp silicate")
                        .build();
                lessonRepository.save(SciG9C10L2);

                Lesson SciG9C10L3 = Lesson.builder()
                        .chapter(S9Chap10)
                        .lessonNumber(34)
                        .lessonName("Khai thác nhiên liệu hoá thạch. Nguồn carbon. Chu trình carbon và sự ấm lên toàn cầu")
                        .description("Bài 35. Khai thác nhiên liệu hoá thạch. Nguồn carbon. Chu trình carbon và sự ấm lên toàn cầu")
                        .build();
                lessonRepository.save(SciG9C10L3);

// Chapter XI: DI TRUYỀN HỌC MENDEL. CƠ SỞ PHÂN TỬ CỦA HIỆN TƯỢNG DI TRUYỀN
                Chapter S9Chap11 = Chapter.builder()
                        .subject(science)
                        .gradeLevel(9)
                        .chapterNumber(11)
                        .chapterName("DI TRUYỀN HỌC MENDEL. CƠ SỞ PHÂN TỬ CỦA HIỆN TƯỢNG DI TRUYỀN")
                        .description("Chương XI. DI TRUYỀN HỌC MENDEL. CƠ SỞ PHÂN TỬ CỦA HIỆN TƯỢNG DI TRUYỀN")
                        .build();
                chapterRepository.save(S9Chap11);

                Lesson SciG9C11L1 = Lesson.builder()
                        .chapter(S9Chap11)
                        .lessonNumber(35)
                        .lessonName("Khái quát về di truyền học")
                        .description("Bài 36. Khái quát về di truyền học")
                        .build();
                lessonRepository.save(SciG9C11L1);

                Lesson SciG9C11L2 = Lesson.builder()
                        .chapter(S9Chap11)
                        .lessonNumber(36)
                        .lessonName("Các quy luật di truyền của Mendel")
                        .description("Bài 37. Các quy luật di truyền của Mendel")
                        .build();
                lessonRepository.save(SciG9C11L2);

                Lesson SciG9C11L3 = Lesson.builder()
                        .chapter(S9Chap11)
                        .lessonNumber(37)
                        .lessonName("Nucleic acid và gene")
                        .description("Bài 38. Nucleic acid và gene")
                        .build();
                lessonRepository.save(SciG9C11L3);

                Lesson SciG9C11L4 = Lesson.builder()
                        .chapter(S9Chap11)
                        .lessonNumber(38)
                        .lessonName("Tái bản DNA và phiên mã tạo RNA")
                        .description("Bài 39. Tái bản DNA và phiên mã tạo RNA")
                        .build();
                lessonRepository.save(SciG9C11L4);

                Lesson SciG9C11L5 = Lesson.builder()
                        .chapter(S9Chap11)
                        .lessonNumber(39)
                        .lessonName("Dịch mã và mối quan hệ từ gene đến tính trạng")
                        .description("Bài 40. Dịch mã và mối quan hệ từ gene đến tính trạng")
                        .build();
                lessonRepository.save(SciG9C11L5);

                Lesson SciG9C11L6 = Lesson.builder()
                        .chapter(S9Chap11)
                        .lessonNumber(40)
                        .lessonName("Đột biến gene")
                        .description("Bài 41. Đột biến gene")
                        .build();
                lessonRepository.save(SciG9C11L6);

// Chapter XII: DI TRUYỀN NHIỄM SẮC THỂ
                Chapter S9Chap12 = Chapter.builder()
                        .subject(science)
                        .gradeLevel(9)
                        .chapterNumber(12)
                        .chapterName("DI TRUYỀN NHIỄM SẮC THỂ")
                        .description("Chương XII. DI TRUYỀN NHIỄM SẮC THỂ")
                        .build();
                chapterRepository.save(S9Chap12);

                Lesson SciG9C12L1 = Lesson.builder()
                        .chapter(S9Chap12)
                        .lessonNumber(41)
                        .lessonName("Nhiễm sắc thể và bộ nhiễm sắc thể")
                        .description("Bài 42. Nhiễm sắc thể và bộ nhiễm sắc thể")
                        .build();
                lessonRepository.save(SciG9C12L1);

                Lesson SciG9C12L2 = Lesson.builder()
                        .chapter(S9Chap12)
                        .lessonNumber(42)
                        .lessonName("Nguyên phân và giảm phân")
                        .description("Bài 43. Nguyên phân và giảm phân")
                        .build();
                lessonRepository.save(SciG9C12L2);

                Lesson SciG9C12L3 = Lesson.builder()
                        .chapter(S9Chap12)
                        .lessonNumber(43)
                        .lessonName("Nhiễm sắc thể giới tính và cơ chế xác định giới tính")
                        .description("Bài 44. Nhiễm sắc thể giới tính và cơ chế xác định giới tính")
                        .build();
                lessonRepository.save(SciG9C12L3);

                Lesson SciG9C12L4 = Lesson.builder()
                        .chapter(S9Chap12)
                        .lessonNumber(44)
                        .lessonName("Di truyền liên kết")
                        .description("Bài 45. Di truyền liên kết")
                        .build();
                lessonRepository.save(SciG9C12L4);

                Lesson SciG9C12L5 = Lesson.builder()
                        .chapter(S9Chap12)
                        .lessonNumber(45)
                        .lessonName("Đột biến nhiễm sắc thể")
                        .description("Bài 46. Đột biến nhiễm sắc thể")
                        .build();
                lessonRepository.save(SciG9C12L5);

// Chapter XIII: DI TRUYỀN HỌC VỚI CON NGƯỜI VÀ ĐỜI SỐNG
                Chapter S9Chap13 = Chapter.builder()
                        .subject(science)
                        .gradeLevel(9)
                        .chapterNumber(13)
                        .chapterName("DI TRUYỀN HỌC VỚI CON NGƯỜI VÀ ĐỜI SỐNG")
                        .description("Chương XIII. DI TRUYỀN HỌC VỚI CON NGƯỜI VÀ ĐỜI SỐNG")
                        .build();
                chapterRepository.save(S9Chap13);

                Lesson SciG9C13L1 = Lesson.builder()
                        .chapter(S9Chap13)
                        .lessonNumber(46)
                        .lessonName("Di truyền học với con người")
                        .description("Bài 47. Di truyền học với con người")
                        .build();
                lessonRepository.save(SciG9C13L1);
// Physics Grade 10 - Chapter 1: Mở đầu
                Chapter P10Chap1 = Chapter.builder()
                        .subject(physics)
                        .gradeLevel(10)
                        .chapterNumber(1)
                        .chapterName("Mở đầu")
                        .description("Chương 1: Mở đầu")
                        .build();
                chapterRepository.save(P10Chap1);

                Lesson PhyG10C1L1 = Lesson.builder()
                        .chapter(P10Chap1)
                        .lessonNumber(1)
                        .lessonName("Làm quen với Vật lí")
                        .description("Bài 1: Làm quen với Vật lí")
                        .build();
                lessonRepository.save(PhyG10C1L1);

                Lesson PhyG10C1L2 = Lesson.builder()
                        .chapter(P10Chap1)
                        .lessonNumber(2)
                        .lessonName("Các quy tắc an toàn trong phòng thực hành Vật lí")
                        .description("Bài 2: Các quy tắc an toàn trong phòng thực hành Vật lí")
                        .build();
                lessonRepository.save(PhyG10C1L2);

                Lesson PhyG10C1L3 = Lesson.builder()
                        .chapter(P10Chap1)
                        .lessonNumber(3)
                        .lessonName("Thực hành tính sai số trong phép đo. Ghi kết quả đo")
                        .description("Bài 3: Thực hành tính sai số trong phép đo. Ghi kết quả đo")
                        .build();
                lessonRepository.save(PhyG10C1L3);

                Lesson PhyG10C1L4 = Lesson.builder()
                        .chapter(P10Chap1)
                        .lessonNumber(4)
                        .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 1")
                        .description("Câu hỏi ôn tập - Đề kiểm tra Chương 1")
                        .build();
                lessonRepository.save(PhyG10C1L4);

// Physics Grade 10 - Chapter 2: Động học
                Chapter P10Chap2 = Chapter.builder()
                        .subject(physics)
                        .gradeLevel(10)
                        .chapterNumber(2)
                        .chapterName("Động học")
                        .description("Chương 2: Động học")
                        .build();
                chapterRepository.save(P10Chap2);

                Lesson PhyG10C2L1 = Lesson.builder()
                        .chapter(P10Chap2)
                        .lessonNumber(4)
                        .lessonName("Độ dịch chuyển và quãng đường đi được")
                        .description("Bài 4: Độ dịch chuyển và quãng đường đi được")
                        .build();
                lessonRepository.save(PhyG10C2L1);

                Lesson PhyG10C2L2 = Lesson.builder()
                        .chapter(P10Chap2)
                        .lessonNumber(5)
                        .lessonName("Tốc độ và vận tốc")
                        .description("Bài 5: Tốc độ và vận tốc")
                        .build();
                lessonRepository.save(PhyG10C2L2);

                Lesson PhyG10C2L3 = Lesson.builder()
                        .chapter(P10Chap2)
                        .lessonNumber(6)
                        .lessonName("Đồ thị độ dịch chuyển - thời gian")
                        .description("Bài 6: Đồ thị độ dịch chuyển - thời gian")
                        .build();
                lessonRepository.save(PhyG10C2L3);

                Lesson PhyG10C2L4 = Lesson.builder()
                        .chapter(P10Chap2)
                        .lessonNumber(7)
                        .lessonName("Chuyển động biến đổi. Gia tốc")
                        .description("Bài 7: Chuyển động biến đổi. Gia tốc")
                        .build();
                lessonRepository.save(PhyG10C2L4);

                Lesson PhyG10C2L5 = Lesson.builder()
                        .chapter(P10Chap2)
                        .lessonNumber(8)
                        .lessonName("Chuyển động thẳng biến đổi đều")
                        .description("Bài 8: Chuyển động thẳng biến đổi đều")
                        .build();
                lessonRepository.save(PhyG10C2L5);

                Lesson PhyG10C2L6 = Lesson.builder()
                        .chapter(P10Chap2)
                        .lessonNumber(9)
                        .lessonName("Sự rơi tự do")
                        .description("Bài 9: Sự rơi tự do")
                        .build();
                lessonRepository.save(PhyG10C2L6);

                Lesson PhyG10C2L7 = Lesson.builder()
                        .chapter(P10Chap2)
                        .lessonNumber(10)
                        .lessonName("Chuyển động ném")
                        .description("Bài 10: Chuyển động ném")
                        .build();
                lessonRepository.save(PhyG10C2L7);

                Lesson PhyG10C2L8 = Lesson.builder()
                        .chapter(P10Chap2)
                        .lessonNumber(11)
                        .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 2")
                        .description("Câu hỏi ôn tập - Đề kiểm tra Chương 2")
                        .build();
                lessonRepository.save(PhyG10C2L8);
                // Physics Grade 10 - Chapter 3: Động lực học
                Chapter P10Chap3 = Chapter.builder()
                        .subject(physics)
                        .gradeLevel(10)
                        .chapterNumber(3)
                        .chapterName("Động lực học")
                        .description("Chương 3: Động lực học")
                        .build();
                chapterRepository.save(P10Chap3);

                Lesson PhyG10C3L1 = Lesson.builder()
                        .chapter(P10Chap3)
                        .lessonNumber(13)
                        .lessonName("Tổng hợp và phân tích lực. Cân bằng lực")
                        .description("Bài 13: Tổng hợp và phân tích lực. Cân bằng lực")
                        .build();
                lessonRepository.save(PhyG10C3L1);

                Lesson PhyG10C3L2 = Lesson.builder()
                        .chapter(P10Chap3)
                        .lessonNumber(14)
                        .lessonName("Định luật 1 Newton")
                        .description("Bài 14: Định luật 1 Newton")
                        .build();
                lessonRepository.save(PhyG10C3L2);

                Lesson PhyG10C3L3 = Lesson.builder()
                        .chapter(P10Chap3)
                        .lessonNumber(15)
                        .lessonName("Định luật 2 Newton")
                        .description("Bài 15: Định luật 2 Newton")
                        .build();
                lessonRepository.save(PhyG10C3L3);

                Lesson PhyG10C3L4 = Lesson.builder()
                        .chapter(P10Chap3)
                        .lessonNumber(16)
                        .lessonName("Định luật 3 Newton")
                        .description("Bài 16: Định luật 3 Newton")
                        .build();
                lessonRepository.save(PhyG10C3L4);

                Lesson PhyG10C3L5 = Lesson.builder()
                        .chapter(P10Chap3)
                        .lessonNumber(17)
                        .lessonName("Trọng lực và lực căng")
                        .description("Bài 17: Trọng lực và lực căng")
                        .build();
                lessonRepository.save(PhyG10C3L5);

                Lesson PhyG10C3L6 = Lesson.builder()
                        .chapter(P10Chap3)
                        .lessonNumber(18)
                        .lessonName("Lực ma sát")
                        .description("Bài 18: Lực ma sát")
                        .build();
                lessonRepository.save(PhyG10C3L6);

                Lesson PhyG10C3L7 = Lesson.builder()
                        .chapter(P10Chap3)
                        .lessonNumber(19)
                        .lessonName("Lực cân và lực nâng")
                        .description("Bài 19: Lực cân và lực nâng")
                        .build();
                lessonRepository.save(PhyG10C3L7);

                Lesson PhyG10C3L8 = Lesson.builder()
                        .chapter(P10Chap3)
                        .lessonNumber(20)
                        .lessonName("Một số ví dụ về cách giải các bài toán thuộc phần động lực học")
                        .description("Bài 20: Một số ví dụ về cách giải các bài toán thuộc phần động lực học")
                        .build();
                lessonRepository.save(PhyG10C3L8);

                Lesson PhyG10C3L9 = Lesson.builder()
                        .chapter(P10Chap3)
                        .lessonNumber(21)
                        .lessonName("Moment lực. Cân bằng của vật rắn")
                        .description("Bài 21: Moment lực. Cân bằng của vật rắn")
                        .build();
                lessonRepository.save(PhyG10C3L9);

                Lesson PhyG10C3L10 = Lesson.builder()
                        .chapter(P10Chap3)
                        .lessonNumber(22)
                        .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 3")
                        .description("Câu hỏi ôn tập - Đề kiểm tra Chương 3")
                        .build();
                lessonRepository.save(PhyG10C3L10);

// Physics Grade 10 - Chapter 4: Năng lực, công, công suất
                Chapter P10Chap4 = Chapter.builder()
                        .subject(physics)
                        .gradeLevel(10)
                        .chapterNumber(4)
                        .chapterName("Năng lực, công, công suất")
                        .description("Chương 4: Năng lực, công, công suất")
                        .build();
                chapterRepository.save(P10Chap4);

                Lesson PhyG10C4L1 = Lesson.builder()
                        .chapter(P10Chap4)
                        .lessonNumber(23)
                        .lessonName("Năng lượng. Công cơ học")
                        .description("Bài 23: Năng lượng. Công cơ học")
                        .build();
                lessonRepository.save(PhyG10C4L1);

                Lesson PhyG10C4L2 = Lesson.builder()
                        .chapter(P10Chap4)
                        .lessonNumber(24)
                        .lessonName("Công suất")
                        .description("Bài 24: Công suất")
                        .build();
                lessonRepository.save(PhyG10C4L2);

                Lesson PhyG10C4L3 = Lesson.builder()
                        .chapter(P10Chap4)
                        .lessonNumber(25)
                        .lessonName("Động năng. Thế năng")
                        .description("Bài 25: Động năng. Thế năng")
                        .build();
                lessonRepository.save(PhyG10C4L3);

                Lesson PhyG10C4L4 = Lesson.builder()
                        .chapter(P10Chap4)
                        .lessonNumber(26)
                        .lessonName("Cơ năng và định luật bảo toàn cơ năng")
                        .description("Bài 26: Cơ năng và định luật bảo toàn cơ năng")
                        .build();
                lessonRepository.save(PhyG10C4L4);

                Lesson PhyG10C4L5 = Lesson.builder()
                        .chapter(P10Chap4)
                        .lessonNumber(27)
                        .lessonName("Hiệu suất")
                        .description("Bài 27: Hiệu suất")
                        .build();
                lessonRepository.save(PhyG10C4L5);

                Lesson PhyG10C4L6 = Lesson.builder()
                        .chapter(P10Chap4)
                        .lessonNumber(28)
                        .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 4")
                        .description("Câu hỏi ôn tập - Đề kiểm tra Chương 4")
                        .build();
                lessonRepository.save(PhyG10C4L6);

// Physics Grade 10 - Chapter 5: Động lượng
                Chapter P10Chap5 = Chapter.builder()
                        .subject(physics)
                        .gradeLevel(10)
                        .chapterNumber(5)
                        .chapterName("Động lượng")
                        .description("Chương 5: Động lượng")
                        .build();
                chapterRepository.save(P10Chap5);

                Lesson PhyG10C5L1 = Lesson.builder()
                        .chapter(P10Chap5)
                        .lessonNumber(28)
                        .lessonName("Động lượng")
                        .description("Bài 28: Động lượng")
                        .build();
                lessonRepository.save(PhyG10C5L1);

                Lesson PhyG10C5L2 = Lesson.builder()
                        .chapter(P10Chap5)
                        .lessonNumber(29)
                        .lessonName("Định luật bảo toàn động lượng")
                        .description("Bài 29: Định luật bảo toàn động lượng")
                        .build();
                lessonRepository.save(PhyG10C5L2);

                Lesson PhyG10C5L3 = Lesson.builder()
                        .chapter(P10Chap5)
                        .lessonNumber(30)
                        .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 5")
                        .description("Câu hỏi ôn tập - Đề kiểm tra Chương 5")
                        .build();
                lessonRepository.save(PhyG10C5L3);

// Physics Grade 10 - Chapter 6: Chuyển động tròn
                Chapter P10Chap6 = Chapter.builder()
                        .subject(physics)
                        .gradeLevel(10)
                        .chapterNumber(6)
                        .chapterName("Chuyển động tròn")
                        .description("Chương 6: Chuyển động tròn")
                        .build();
                chapterRepository.save(P10Chap6);

                Lesson PhyG10C6L1 = Lesson.builder()
                        .chapter(P10Chap6)
                        .lessonNumber(31)
                        .lessonName("Động học của chuyển động tròn đều")
                        .description("Bài 31: Động học của chuyển động tròn đều")
                        .build();
                lessonRepository.save(PhyG10C6L1);

                Lesson PhyG10C6L2 = Lesson.builder()
                        .chapter(P10Chap6)
                        .lessonNumber(32)
                        .lessonName("Lực hướng tâm và gia tốc hướng tâm")
                        .description("Bài 32: Lực hướng tâm và gia tốc hướng tâm")
                        .build();
                lessonRepository.save(PhyG10C6L2);

                Lesson PhyG10C6L3 = Lesson.builder()
                        .chapter(P10Chap6)
                        .lessonNumber(33)
                        .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 6")
                        .description("Câu hỏi ôn tập - Đề kiểm tra Chương 6")
                        .build();
                lessonRepository.save(PhyG10C6L3);

// Physics Grade 10 - Chapter 7: Biến dạng của vật rắn. Áp suất chất lỏng
                Chapter P10Chap7 = Chapter.builder()
                        .subject(physics)
                        .gradeLevel(10)
                        .chapterNumber(7)
                        .chapterName("Biến dạng của vật rắn. Áp suất chất lỏng")
                        .description("Chương 7: Biến dạng của vật rắn. Áp suất chất lỏng")
                        .build();
                chapterRepository.save(P10Chap7);

                Lesson PhyG10C7L1 = Lesson.builder()
                        .chapter(P10Chap7)
                        .lessonNumber(33)
                        .lessonName("Biến dạng của vật rắn")
                        .description("Bài 33: Biến dạng của vật rắn")
                        .build();
                lessonRepository.save(PhyG10C7L1);

                Lesson PhyG10C7L2 = Lesson.builder()
                        .chapter(P10Chap7)
                        .lessonNumber(34)
                        .lessonName("Khối lượng riêng. Áp suất chất lỏng")
                        .description("Bài 34: Khối lượng riêng. Áp suất chất lỏng")
                        .build();
                lessonRepository.save(PhyG10C7L2);

                Lesson PhyG10C7L3 = Lesson.builder()
                        .chapter(P10Chap7)
                        .lessonNumber(35)
                        .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 7")
                        .description("Câu hỏi ôn tập - Đề kiểm tra Chương 7")
                        .build();
                lessonRepository.save(PhyG10C7L3);
                // Physics Grade 11 - Chapter 1: Dao động
                Chapter P11Chap1 = Chapter.builder()
                        .subject(physics)
                        .gradeLevel(11)
                        .chapterNumber(1)
                        .chapterName("Dao động")
                        .description("Chương 1: Dao động")
                        .build();
                chapterRepository.save(P11Chap1);

                Lesson PhyG11C1L1 = Lesson.builder()
                        .chapter(P11Chap1)
                        .lessonNumber(1)
                        .lessonName("Dao động điều hòa")
                        .description("Bài 1: Dao động điều hòa")
                        .build();
                lessonRepository.save(PhyG11C1L1);

                Lesson PhyG11C1L2 = Lesson.builder()
                        .chapter(P11Chap1)
                        .lessonNumber(2)
                        .lessonName("Mô tả dao động điều hòa")
                        .description("Bài 2: Mô tả dao động điều hòa")
                        .build();
                lessonRepository.save(PhyG11C1L2);

                Lesson PhyG11C1L3 = Lesson.builder()
                        .chapter(P11Chap1)
                        .lessonNumber(3)
                        .lessonName("Vận tốc, gia tốc trong điều hòa dao động")
                        .description("Bài 3: Vận tốc, gia tốc trong điều hòa dao động")
                        .build();
                lessonRepository.save(PhyG11C1L3);

                Lesson PhyG11C1L4 = Lesson.builder()
                        .chapter(P11Chap1)
                        .lessonNumber(4)
                        .lessonName("Bài tập về điều hòa dao động")
                        .description("Bài 4: Bài tập về điều hòa dao động")
                        .build();
                lessonRepository.save(PhyG11C1L4);

                Lesson PhyG11C1L5 = Lesson.builder()
                        .chapter(P11Chap1)
                        .lessonNumber(5)
                        .lessonName("Động năng. Thế năng. Sự chuyển hóa giữa động năng và thế năng trong dao động điều hòa")
                        .description("Bài 5: Động năng. Thế năng. Sự chuyển hóa giữa động năng và thế năng trong dao động điều hòa")
                        .build();
                lessonRepository.save(PhyG11C1L5);

                Lesson PhyG11C1L6 = Lesson.builder()
                        .chapter(P11Chap1)
                        .lessonNumber(6)
                        .lessonName("Dao động tắt dần. Dao động cưỡng bức. Hiện tượng cộng hưởng")
                        .description("Bài 6: Dao động tắt dần. Dao động cưỡng bức. Hiện tượng cộng hưởng")
                        .build();
                lessonRepository.save(PhyG11C1L6);

                Lesson PhyG11C1L7 = Lesson.builder()
                        .chapter(P11Chap1)
                        .lessonNumber(7)
                        .lessonName("Bài tập về sự chuyển năng lượng trong dao động điều hòa")
                        .description("Bài 7: Bài tập về sự chuyển năng lượng trong dao động điều hòa")
                        .build();
                lessonRepository.save(PhyG11C1L7);

                Lesson PhyG11C1L8 = Lesson.builder()
                        .chapter(P11Chap1)
                        .lessonNumber(8)
                        .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 1")
                        .description("Câu hỏi ôn tập - Đề kiểm tra Chương 1")
                        .build();
                lessonRepository.save(PhyG11C1L8);

// Physics Grade 11 - Chapter 2: Sóng
                Chapter P11Chap2 = Chapter.builder()
                        .subject(physics)
                        .gradeLevel(11)
                        .chapterNumber(2)
                        .chapterName("Sóng")
                        .description("Chương 2: Sóng")
                        .build();
                chapterRepository.save(P11Chap2);

                Lesson PhyG11C2L1 = Lesson.builder()
                        .chapter(P11Chap2)
                        .lessonNumber(9)
                        .lessonName("Mô tả sóng")
                        .description("Bài 8: Mô tả sóng")
                        .build();
                lessonRepository.save(PhyG11C2L1);

                Lesson PhyG11C2L2 = Lesson.builder()
                        .chapter(P11Chap2)
                        .lessonNumber(10)
                        .lessonName("Sóng ngang, sóng dọc, sự truyền năng lượng của sóng cơ")
                        .description("Bài 9: Sóng ngang, sóng dọc, sự truyền năng lượng của sóng cơ")
                        .build();
                lessonRepository.save(PhyG11C2L2);

                Lesson PhyG11C2L3 = Lesson.builder()
                        .chapter(P11Chap2)
                        .lessonNumber(11)
                        .lessonName("Thực hành: Đo tần số của sóng âm")
                        .description("Bài 10: Thực hành: Đo tần số của sóng âm")
                        .build();
                lessonRepository.save(PhyG11C2L3);

                Lesson PhyG11C2L4 = Lesson.builder()
                        .chapter(P11Chap2)
                        .lessonNumber(12)
                        .lessonName("Sóng điện từ")
                        .description("Bài 11: Sóng điện từ")
                        .build();
                lessonRepository.save(PhyG11C2L4);

                Lesson PhyG11C2L5 = Lesson.builder()
                        .chapter(P11Chap2)
                        .lessonNumber(13)
                        .lessonName("Giao thoa sóng")
                        .description("Bài 12: Giao thoa sóng")
                        .build();
                lessonRepository.save(PhyG11C2L5);

                Lesson PhyG11C2L6 = Lesson.builder()
                        .chapter(P11Chap2)
                        .lessonNumber(14)
                        .lessonName("Sóng dừng")
                        .description("Bài 13: Sóng dừng")
                        .build();
                lessonRepository.save(PhyG11C2L6);

                Lesson PhyG11C2L7 = Lesson.builder()
                        .chapter(P11Chap2)
                        .lessonNumber(15)
                        .lessonName("Bài tập về sóng")
                        .description("Bài 14: Bài tập về sóng")
                        .build();
                lessonRepository.save(PhyG11C2L7);

                Lesson PhyG11C2L8 = Lesson.builder()
                        .chapter(P11Chap2)
                        .lessonNumber(16)
                        .lessonName("Thực hành: Đo tốc độ truyền âm")
                        .description("Bài 15: Thực hành: Đo tốc độ truyền âm")
                        .build();
                lessonRepository.save(PhyG11C2L8);

                Lesson PhyG11C2L9 = Lesson.builder()
                        .chapter(P11Chap2)
                        .lessonNumber(17)
                        .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 2")
                        .description("Câu hỏi ôn tập - Đề kiểm tra Chương 2")
                        .build();
                lessonRepository.save(PhyG11C2L9);

// Physics Grade 11 - Chapter 3: Điện trường
                Chapter P11Chap3 = Chapter.builder()
                        .subject(physics)
                        .gradeLevel(11)
                        .chapterNumber(3)
                        .chapterName("Điện trường")
                        .description("Chương 3: Điện trường")
                        .build();
                chapterRepository.save(P11Chap3);

                Lesson PhyG11C3L1 = Lesson.builder()
                        .chapter(P11Chap3)
                        .lessonNumber(18)
                        .lessonName("Lực tương tác giữa hai điện tích")
                        .description("Bài 16: Lực tương tác giữa hai điện tích")
                        .build();
                lessonRepository.save(PhyG11C3L1);

                Lesson PhyG11C3L2 = Lesson.builder()
                        .chapter(P11Chap3)
                        .lessonNumber(19)
                        .lessonName("Khái niệm điện trường")
                        .description("Bài 17: Khái niệm điện trường")
                        .build();
                lessonRepository.save(PhyG11C3L2);

                Lesson PhyG11C3L3 = Lesson.builder()
                        .chapter(P11Chap3)
                        .lessonNumber(20)
                        .lessonName("Điện trường đều")
                        .description("Bài 18: Điện trường đều")
                        .build();
                lessonRepository.save(PhyG11C3L3);

                Lesson PhyG11C3L4 = Lesson.builder()
                        .chapter(P11Chap3)
                        .lessonNumber(21)
                        .lessonName("Thế năng điện")
                        .description("Bài 19: Thế năng điện")
                        .build();
                lessonRepository.save(PhyG11C3L4);

                Lesson PhyG11C3L5 = Lesson.builder()
                        .chapter(P11Chap3)
                        .lessonNumber(22)
                        .lessonName("Điện thế")
                        .description("Bài 20: Điện thế")
                        .build();
                lessonRepository.save(PhyG11C3L5);

                Lesson PhyG11C3L6 = Lesson.builder()
                        .chapter(P11Chap3)
                        .lessonNumber(23)
                        .lessonName("Tụ điện")
                        .description("Bài 21: Tụ điện")
                        .build();
                lessonRepository.save(PhyG11C3L6);

                Lesson PhyG11C3L7 = Lesson.builder()
                        .chapter(P11Chap3)
                        .lessonNumber(24)
                        .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 3")
                        .description("Câu hỏi ôn tập - Đề kiểm tra Chương 3")
                        .build();
                lessonRepository.save(PhyG11C3L7);

// Physics Grade 11 - Chapter 4: Dòng điện. Mạch điện
                Chapter P11Chap4 = Chapter.builder()
                        .subject(physics)
                        .gradeLevel(11)
                        .chapterNumber(4)
                        .chapterName("Dòng điện. Mạch điện")
                        .description("Chương 4: Dòng điện. Mạch điện")
                        .build();
                chapterRepository.save(P11Chap4);

                Lesson PhyG11C4L1 = Lesson.builder()
                        .chapter(P11Chap4)
                        .lessonNumber(25)
                        .lessonName("Cường độ dòng điện")
                        .description("Bài 22: Cường độ dòng điện")
                        .build();
                lessonRepository.save(PhyG11C4L1);

                Lesson PhyG11C4L2 = Lesson.builder()
                        .chapter(P11Chap4)
                        .lessonNumber(26)
                        .lessonName("Điện trở. Định luật Ohm")
                        .description("Bài 23: Điện trở. Định luật Ohm")
                        .build();
                lessonRepository.save(PhyG11C4L2);

                Lesson PhyG11C4L3 = Lesson.builder()
                        .chapter(P11Chap4)
                        .lessonNumber(27)
                        .lessonName("Nguồn điện")
                        .description("Bài 24: Nguồn điện")
                        .build();
                lessonRepository.save(PhyG11C4L3);

                Lesson PhyG11C4L4 = Lesson.builder()
                        .chapter(P11Chap4)
                        .lessonNumber(28)
                        .lessonName("Năng lượng điện và công suất điện")
                        .description("Bài 25: Năng lượng điện và công suất điện")
                        .build();
                lessonRepository.save(PhyG11C4L4);

                Lesson PhyG11C4L5 = Lesson.builder()
                        .chapter(P11Chap4)
                        .lessonNumber(29)
                        .lessonName("Thực hành: Đo suất điện động và điện trở trong của pin điện hóa")
                        .description("Bài 26: Thực hành: Đo suất điện động và điện trở trong của pin điện hóa")
                        .build();
                lessonRepository.save(PhyG11C4L5);

                Lesson PhyG11C4L6 = Lesson.builder()
                        .chapter(P11Chap4)
                        .lessonNumber(30)
                        .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 4")
                        .description("Câu hỏi ôn tập - Đề kiểm tra Chương 4")
                        .build();
                lessonRepository.save(PhyG11C4L6);
                // Physics Grade 12 - Chapter 1: Vật lí nhiệt
                Chapter P12Chap1 = Chapter.builder()
                        .subject(physics)
                        .gradeLevel(12)
                        .chapterNumber(1)
                        .chapterName("Vật lí nhiệt")
                        .description("Chương 1: Vật lí nhiệt")
                        .build();
                chapterRepository.save(P12Chap1);

                Lesson PhyG12C1L1 = Lesson.builder()
                        .chapter(P12Chap1)
                        .lessonNumber(1)
                        .lessonName("Cấu trúc của chất. Sự chuyển thể")
                        .description("Bài 1: Cấu trúc của chất. Sự chuyển thể")
                        .build();
                lessonRepository.save(PhyG12C1L1);

                Lesson PhyG12C1L2 = Lesson.builder()
                        .chapter(P12Chap1)
                        .lessonNumber(2)
                        .lessonName("Nội năng. Định luật I của nhiệt động lực học")
                        .description("Bài 2: Nội năng. Định luật I của nhiệt động lực học")
                        .build();
                lessonRepository.save(PhyG12C1L2);

                Lesson PhyG12C1L3 = Lesson.builder()
                        .chapter(P12Chap1)
                        .lessonNumber(3)
                        .lessonName("Nhiệt độ. Thang nhiệt độ - Nhiệt kế")
                        .description("Bài 3: Nhiệt độ. Thang nhiệt độ - Nhiệt kế")
                        .build();
                lessonRepository.save(PhyG12C1L3);

                Lesson PhyG12C1L4 = Lesson.builder()
                        .chapter(P12Chap1)
                        .lessonNumber(4)
                        .lessonName("Nhiệt dung riêng")
                        .description("Bài 4: Nhiệt dung riêng")
                        .build();
                lessonRepository.save(PhyG12C1L4);

                Lesson PhyG12C1L5 = Lesson.builder()
                        .chapter(P12Chap1)
                        .lessonNumber(5)
                        .lessonName("Nhiệt nóng chảy riêng")
                        .description("Bài 5: Nhiệt nóng chảy riêng")
                        .build();
                lessonRepository.save(PhyG12C1L5);

                Lesson PhyG12C1L6 = Lesson.builder()
                        .chapter(P12Chap1)
                        .lessonNumber(6)
                        .lessonName("Nhiệt hoá hơi riêng")
                        .description("Bài 6: Nhiệt hoá hơi riêng")
                        .build();
                lessonRepository.save(PhyG12C1L6);

                Lesson PhyG12C1L7 = Lesson.builder()
                        .chapter(P12Chap1)
                        .lessonNumber(7)
                        .lessonName("Ôn tập cuối chương 1")
                        .description("Ôn tập cuối chương 1")
                        .build();
                lessonRepository.save(PhyG12C1L7);

                Lesson PhyG12C1L8 = Lesson.builder()
                        .chapter(P12Chap1)
                        .lessonNumber(8)
                        .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 1")
                        .description("Câu hỏi ôn tập - Đề kiểm tra Chương 1")
                        .build();
                lessonRepository.save(PhyG12C1L8);

// Physics Grade 12 - Chapter 2: Khí lí tưởng
                Chapter P12Chap2 = Chapter.builder()
                        .subject(physics)
                        .gradeLevel(12)
                        .chapterNumber(2)
                        .chapterName("Khí lí tưởng")
                        .description("Chương 2: Khí lí tưởng")
                        .build();
                chapterRepository.save(P12Chap2);

                Lesson PhyG12C2L1 = Lesson.builder()
                        .chapter(P12Chap2)
                        .lessonNumber(9)
                        .lessonName("Mô hình động học phân tử chất khí")
                        .description("Bài 8: Mô hình động học phân tử chất khí")
                        .build();
                lessonRepository.save(PhyG12C2L1);

                Lesson PhyG12C2L2 = Lesson.builder()
                        .chapter(P12Chap2)
                        .lessonNumber(10)
                        .lessonName("Định luật Boyle")
                        .description("Bài 9: Định luật Boyle")
                        .build();
                lessonRepository.save(PhyG12C2L2);

                Lesson PhyG12C2L3 = Lesson.builder()
                        .chapter(P12Chap2)
                        .lessonNumber(11)
                        .lessonName("Định luật Charles")
                        .description("Bài 10: Định luật Charles")
                        .build();
                lessonRepository.save(PhyG12C2L3);

                Lesson PhyG12C2L4 = Lesson.builder()
                        .chapter(P12Chap2)
                        .lessonNumber(12)
                        .lessonName("Phương trình trạng thái của khí lí tưởng")
                        .description("Bài 11: Phương trình trạng thái của khí lí tưởng")
                        .build();
                lessonRepository.save(PhyG12C2L4);

                Lesson PhyG12C2L5 = Lesson.builder()
                        .chapter(P12Chap2)
                        .lessonNumber(13)
                        .lessonName("Áp suất khí theo mô hình động học phân tử. Quan hệ giữa động năng phân tử và nhiệt độ")
                        .description("Bài 12: Áp suất khí theo mô hình động học phân tử. Quan hệ giữa động năng phân tử và nhiệt độ")
                        .build();
                lessonRepository.save(PhyG12C2L5);

                Lesson PhyG12C2L6 = Lesson.builder()
                        .chapter(P12Chap2)
                        .lessonNumber(14)
                        .lessonName("Ôn tập cuối chương 2")
                        .description("Ôn tập cuối chương 2")
                        .build();
                lessonRepository.save(PhyG12C2L6);

                Lesson PhyG12C2L7 = Lesson.builder()
                        .chapter(P12Chap2)
                        .lessonNumber(15)
                        .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 2")
                        .description("Câu hỏi ôn tập - Đề kiểm tra Chương 2")
                        .build();
                lessonRepository.save(PhyG12C2L7);

// Physics Grade 12 - Chapter 3: Từ trường
                Chapter P12Chap3 = Chapter.builder()
                        .subject(physics)
                        .gradeLevel(12)
                        .chapterNumber(3)
                        .chapterName("Từ trường")
                        .description("Chương 3: Từ trường")
                        .build();
                chapterRepository.save(P12Chap3);

                Lesson PhyG12C3L1 = Lesson.builder()
                        .chapter(P12Chap3)
                        .lessonNumber(16)
                        .lessonName("Từ trường")
                        .description("Bài 14: Từ trường")
                        .build();
                lessonRepository.save(PhyG12C3L1);

                Lesson PhyG12C3L2 = Lesson.builder()
                        .chapter(P12Chap3)
                        .lessonNumber(17)
                        .lessonName("Lực từ tác dụng lên dây dẫn mang dòng điện. Cảm ứng từ")
                        .description("Bài 15: Lực từ tác dụng lên dây dẫn mang dòng điện. Cảm ứng từ")
                        .build();
                lessonRepository.save(PhyG12C3L2);

                Lesson PhyG12C3L3 = Lesson.builder()
                        .chapter(P12Chap3)
                        .lessonNumber(18)
                        .lessonName("Từ thông. Hiện tượng cảm ứng điện từ")
                        .description("Bài 16: Từ thông. Hiện tượng cảm ứng điện từ")
                        .build();
                lessonRepository.save(PhyG12C3L3);

                Lesson PhyG12C3L4 = Lesson.builder()
                        .chapter(P12Chap3)
                        .lessonNumber(19)
                        .lessonName("Máy phát điện xoay chiều")
                        .description("Bài 17: Máy phát điện xoay chiều")
                        .build();
                lessonRepository.save(PhyG12C3L4);

                Lesson PhyG12C3L5 = Lesson.builder()
                        .chapter(P12Chap3)
                        .lessonNumber(20)
                        .lessonName("Ứng dụng hiện tượng cảm ứng điện từ")
                        .description("Bài 18: Ứng dụng hiện tượng cảm ứng điện từ")
                        .build();
                lessonRepository.save(PhyG12C3L5);

                Lesson PhyG12C3L6 = Lesson.builder()
                        .chapter(P12Chap3)
                        .lessonNumber(21)
                        .lessonName("Điện từ trường. Mô hình sóng điện từ")
                        .description("Bài 19: Điện từ trường. Mô hình sóng điện từ")
                        .build();
                lessonRepository.save(PhyG12C3L6);

                Lesson PhyG12C3L7 = Lesson.builder()
                        .chapter(P12Chap3)
                        .lessonNumber(22)
                        .lessonName("Ôn tập cuối chương 3")
                        .description("Ôn tập cuối chương 3")
                        .build();
                lessonRepository.save(PhyG12C3L7);

                Lesson PhyG12C3L8 = Lesson.builder()
                        .chapter(P12Chap3)
                        .lessonNumber(23)
                        .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 3")
                        .description("Câu hỏi ôn tập - Đề kiểm tra Chương 3")
                        .build();
                lessonRepository.save(PhyG12C3L8);

// Physics Grade 12 - Chapter 4: Vật lí hạt nhân
                Chapter P12Chap4 = Chapter.builder()
                        .subject(physics)
                        .gradeLevel(12)
                        .chapterNumber(4)
                        .chapterName("Vật lí hạt nhân")
                        .description("Chương 4: Vật lí hạt nhân")
                        .build();
                chapterRepository.save(P12Chap4);

                Lesson PhyG12C4L1 = Lesson.builder()
                        .chapter(P12Chap4)
                        .lessonNumber(24)
                        .lessonName("Cấu trúc hạt nhân")
                        .description("Bài 21: Cấu trúc hạt nhân")
                        .build();
                lessonRepository.save(PhyG12C4L1);

                Lesson PhyG12C4L2 = Lesson.builder()
                        .chapter(P12Chap4)
                        .lessonNumber(25)
                        .lessonName("Phản ứng hạt nhân và năng lượng liên kết")
                        .description("Bài 22: Phản ứng hạt nhân và năng lượng liên kết")
                        .build();
                lessonRepository.save(PhyG12C4L2);

                Lesson PhyG12C4L3 = Lesson.builder()
                        .chapter(P12Chap4)
                        .lessonNumber(26)
                        .lessonName("Hiện tượng phóng xạ")
                        .description("Bài 23: Hiện tượng phóng xạ")
                        .build();
                lessonRepository.save(PhyG12C4L3);

                Lesson PhyG12C4L4 = Lesson.builder()
                        .chapter(P12Chap4)
                        .lessonNumber(27)
                        .lessonName("Công nghiệp hạt nhân")
                        .description("Bài 24: Công nghiệp hạt nhân")
                        .build();
                lessonRepository.save(PhyG12C4L4);

                Lesson PhyG12C4L5 = Lesson.builder()
                        .chapter(P12Chap4)
                        .lessonNumber(28)
                        .lessonName("Ôn tập cuối chương 4")
                        .description("Ôn tập cuối chương 4")
                        .build();
                lessonRepository.save(PhyG12C4L5);

                Lesson PhyG12C4L6 = Lesson.builder()
                        .chapter(P12Chap4)
                        .lessonNumber(29)
                        .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 4")
                        .description("Câu hỏi ôn tập - Đề kiểm tra Chương 4")
                        .build();
                lessonRepository.save(PhyG12C4L6);

            }

// Chemistry Grade 10 - Chapter 1: Cấu tạo nguyên tử
            Chapter C10Chap1 = Chapter.builder()
                    .subject(chemistry)
                    .gradeLevel(10)
                    .chapterNumber(1)
                    .chapterName("Cấu tạo nguyên tử")
                    .description("Chương 1: Cấu tạo nguyên tử")
                    .build();
            chapterRepository.save(C10Chap1);

            Lesson ChemG10C1L1 = Lesson.builder()
                    .chapter(C10Chap1)
                    .lessonNumber(1)
                    .lessonName("Thành phần của nguyên tử")
                    .description("Bài 1: Thành phần của nguyên tử")
                    .build();
            lessonRepository.save(ChemG10C1L1);

            Lesson ChemG10C1L2 = Lesson.builder()
                    .chapter(C10Chap1)
                    .lessonNumber(2)
                    .lessonName("Nguyên tố hóa học")
                    .description("Bài 2: Nguyên tố hóa học")
                    .build();
            lessonRepository.save(ChemG10C1L2);

            Lesson ChemG10C1L3 = Lesson.builder()
                    .chapter(C10Chap1)
                    .lessonNumber(3)
                    .lessonName("Cấu trúc lớp vỏ electron nguyên tử")
                    .description("Bài 3: Cấu trúc lớp vỏ electron nguyên tử")
                    .build();
            lessonRepository.save(ChemG10C1L3);

            Lesson ChemG10C1L4 = Lesson.builder()
                    .chapter(C10Chap1)
                    .lessonNumber(4)
                    .lessonName("Ôn tập chương 1")
                    .description("Bài 4: Ôn tập chương 1")
                    .build();
            lessonRepository.save(ChemG10C1L4);

            Lesson ChemG10C1L5 = Lesson.builder()
                    .chapter(C10Chap1)
                    .lessonNumber(5)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 1")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 1")
                    .build();
            lessonRepository.save(ChemG10C1L5);

// Chemistry Grade 10 - Chapter 2: Bảng tuần hoàn các nguyên tố hóa học và định luật bảo toàn
            Chapter C10Chap2 = Chapter.builder()
                    .subject(chemistry)
                    .gradeLevel(10)
                    .chapterNumber(2)
                    .chapterName("Bảng tuần hoàn các nguyên tố hóa học và định luật bảo toàn")
                    .description("Chương 2: Bảng tuần hoàn các nguyên tố hóa học và định luật bảo toàn")
                    .build();
            chapterRepository.save(C10Chap2);

            Lesson ChemG10C2L1 = Lesson.builder()
                    .chapter(C10Chap2)
                    .lessonNumber(6)
                    .lessonName("Cấu tạo của bảng tuần hoàn các nguyên tố hóa học")
                    .description("Bài 5: Cấu tạo của bảng tuần hoàn các nguyên tố hóa học")
                    .build();
            lessonRepository.save(ChemG10C2L1);

            Lesson ChemG10C2L2 = Lesson.builder()
                    .chapter(C10Chap2)
                    .lessonNumber(7)
                    .lessonName("Xu hướng biến đổi một số tính chất của nguyên tử các nguyên tố trong một chu kì và trong một nhóm")
                    .description("Bài 6: Xu hướng biến đổi một số tính chất của nguyên tử các nguyên tố trong một chu kì và trong một nhóm")
                    .build();
            lessonRepository.save(ChemG10C2L2);

            Lesson ChemG10C2L3 = Lesson.builder()
                    .chapter(C10Chap2)
                    .lessonNumber(8)
                    .lessonName("Xu hướng biến đổi thành phần và một số tính chất của hợp chất trong một chu kì")
                    .description("Bài 7: Xu hướng biến đổi thành phần và một số tính chất của hợp chất trong một chu kì")
                    .build();
            lessonRepository.save(ChemG10C2L3);

            Lesson ChemG10C2L4 = Lesson.builder()
                    .chapter(C10Chap2)
                    .lessonNumber(9)
                    .lessonName("Định luật bảo toàn. Ý nghĩa của bảng tuần hoàn các nguyên tố hóa học")
                    .description("Bài 8: Định luật bảo toàn. Ý nghĩa của bảng tuần hoàn các nguyên tố hóa học")
                    .build();
            lessonRepository.save(ChemG10C2L4);

            Lesson ChemG10C2L5 = Lesson.builder()
                    .chapter(C10Chap2)
                    .lessonNumber(10)
                    .lessonName("Ôn tập chương 2")
                    .description("Bài 9: Ôn tập chương 2")
                    .build();
            lessonRepository.save(ChemG10C2L5);

            Lesson ChemG10C2L6 = Lesson.builder()
                    .chapter(C10Chap2)
                    .lessonNumber(11)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 2")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 2")
                    .build();
            lessonRepository.save(ChemG10C2L6);

// Chemistry Grade 10 - Chapter 3: Liên kết hóa học
            Chapter C10Chap3 = Chapter.builder()
                    .subject(chemistry)
                    .gradeLevel(10)
                    .chapterNumber(3)
                    .chapterName("Liên kết hóa học")
                    .description("Chương 3: Liên kết hóa học")
                    .build();
            chapterRepository.save(C10Chap3);

            Lesson ChemG10C3L1 = Lesson.builder()
                    .chapter(C10Chap3)
                    .lessonNumber(12)
                    .lessonName("Quy tắc octet")
                    .description("Bài 10: Quy tắc octet")
                    .build();
            lessonRepository.save(ChemG10C3L1);

            Lesson ChemG10C3L2 = Lesson.builder()
                    .chapter(C10Chap3)
                    .lessonNumber(13)
                    .lessonName("Liên kết ion")
                    .description("Bài 11: Liên kết ion")
                    .build();
            lessonRepository.save(ChemG10C3L2);

            Lesson ChemG10C3L3 = Lesson.builder()
                    .chapter(C10Chap3)
                    .lessonNumber(14)
                    .lessonName("Liên kết cộng hóa trị")
                    .description("Bài 12: Liên kết cộng hóa trị")
                    .build();
            lessonRepository.save(ChemG10C3L3);

            Lesson ChemG10C3L4 = Lesson.builder()
                    .chapter(C10Chap3)
                    .lessonNumber(15)
                    .lessonName("Liên kết hydrogen và tương tác van der Waals")
                    .description("Bài 13: Liên kết hydrogen và tương tác van der Waals")
                    .build();
            lessonRepository.save(ChemG10C3L4);

            Lesson ChemG10C3L5 = Lesson.builder()
                    .chapter(C10Chap3)
                    .lessonNumber(16)
                    .lessonName("Ôn tập chương 3")
                    .description("Bài 14: Ôn tập chương 3")
                    .build();
            lessonRepository.save(ChemG10C3L5);

            Lesson ChemG10C3L6 = Lesson.builder()
                    .chapter(C10Chap3)
                    .lessonNumber(17)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 3")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 3")
                    .build();
            lessonRepository.save(ChemG10C3L6);

// Chemistry Grade 10 - Chapter 4: Phản ứng oxi hóa - khử
            Chapter C10Chap4 = Chapter.builder()
                    .subject(chemistry)
                    .gradeLevel(10)
                    .chapterNumber(4)
                    .chapterName("Phản ứng oxi hóa - khử")
                    .description("Chương 4: Phản ứng oxi hóa - khử")
                    .build();
            chapterRepository.save(C10Chap4);

            Lesson ChemG10C4L1 = Lesson.builder()
                    .chapter(C10Chap4)
                    .lessonNumber(18)
                    .lessonName("Phản ứng oxi hóa - khử")
                    .description("Bài 15: Phản ứng oxi hóa - khử")
                    .build();
            lessonRepository.save(ChemG10C4L1);

            Lesson ChemG10C4L2 = Lesson.builder()
                    .chapter(C10Chap4)
                    .lessonNumber(19)
                    .lessonName("Ôn tập chương 4")
                    .description("Bài 16: Ôn tập chương 4")
                    .build();
            lessonRepository.save(ChemG10C4L2);

            Lesson ChemG10C4L3 = Lesson.builder()
                    .chapter(C10Chap4)
                    .lessonNumber(20)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 4")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 4")
                    .build();
            lessonRepository.save(ChemG10C4L3);

// Chemistry Grade 10 - Chapter 5: Năng lượng hóa học
            Chapter C10Chap5 = Chapter.builder()
                    .subject(chemistry)
                    .gradeLevel(10)
                    .chapterNumber(5)
                    .chapterName("Năng lượng hóa học")
                    .description("Chương 5: Năng lượng hóa học")
                    .build();
            chapterRepository.save(C10Chap5);

            Lesson ChemG10C5L1 = Lesson.builder()
                    .chapter(C10Chap5)
                    .lessonNumber(21)
                    .lessonName("Biến thiên enthalpy trong các phản ứng hóa học")
                    .description("Bài 17: Biến thiên enthalpy trong các phản ứng hóa học")
                    .build();
            lessonRepository.save(ChemG10C5L1);

            Lesson ChemG10C5L2 = Lesson.builder()
                    .chapter(C10Chap5)
                    .lessonNumber(22)
                    .lessonName("Ôn tập chương 5")
                    .description("Bài 18: Ôn tập chương 5")
                    .build();
            lessonRepository.save(ChemG10C5L2);

            Lesson ChemG10C5L3 = Lesson.builder()
                    .chapter(C10Chap5)
                    .lessonNumber(23)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 5")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 5")
                    .build();
            lessonRepository.save(ChemG10C5L3);

// Chemistry Grade 10 - Chapter 6: Tốc độ phản ứng
            Chapter C10Chap6 = Chapter.builder()
                    .subject(chemistry)
                    .gradeLevel(10)
                    .chapterNumber(6)
                    .chapterName("Tốc độ phản ứng")
                    .description("Chương 6: Tốc độ phản ứng")
                    .build();
            chapterRepository.save(C10Chap6);

            Lesson ChemG10C6L1 = Lesson.builder()
                    .chapter(C10Chap6)
                    .lessonNumber(24)
                    .lessonName("Tốc độ phản ứng")
                    .description("Bài 19: Tốc độ phản ứng")
                    .build();
            lessonRepository.save(ChemG10C6L1);

            Lesson ChemG10C6L2 = Lesson.builder()
                    .chapter(C10Chap6)
                    .lessonNumber(25)
                    .lessonName("Ôn tập chương 6")
                    .description("Bài 20: Ôn tập chương 6")
                    .build();
            lessonRepository.save(ChemG10C6L2);

            Lesson ChemG10C6L3 = Lesson.builder()
                    .chapter(C10Chap6)
                    .lessonNumber(26)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 6")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 6")
                    .build();
            lessonRepository.save(ChemG10C6L3);

// Chemistry Grade 10 - Chapter 7: Nguyên tố nhóm halogen
            Chapter C10Chap7 = Chapter.builder()
                    .subject(chemistry)
                    .gradeLevel(10)
                    .chapterNumber(7)
                    .chapterName("Nguyên tố nhóm halogen")
                    .description("Chương 7: Nguyên tố nhóm halogen")
                    .build();
            chapterRepository.save(C10Chap7);

            Lesson ChemG10C7L1 = Lesson.builder()
                    .chapter(C10Chap7)
                    .lessonNumber(27)
                    .lessonName("Nhóm halogen")
                    .description("Bài 21: Nhóm halogen")
                    .build();
            lessonRepository.save(ChemG10C7L1);

            Lesson ChemG10C7L2 = Lesson.builder()
                    .chapter(C10Chap7)
                    .lessonNumber(28)
                    .lessonName("Hydrogen halide. Muối halide")
                    .description("Bài 22: Hydrogen halide. Muối halide")
                    .build();
            lessonRepository.save(ChemG10C7L2);

            Lesson ChemG10C7L3 = Lesson.builder()
                    .chapter(C10Chap7)
                    .lessonNumber(29)
                    .lessonName("Ôn tập chương 7")
                    .description("Bài 23: Ôn tập chương 7")
                    .build();
            lessonRepository.save(ChemG10C7L3);

            Lesson ChemG10C7L4 = Lesson.builder()
                    .chapter(C10Chap7)
                    .lessonNumber(30)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 7")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 7")
                    .build();
            lessonRepository.save(ChemG10C7L4);
// Chemistry Grade 11 - Chapter 1: Cân bằng hóa học
            Chapter C11Chap1 = Chapter.builder()
                    .subject(chemistry)
                    .gradeLevel(11)
                    .chapterNumber(1)
                    .chapterName("Cân bằng hóa học")
                    .description("Chương 1: Cân bằng hóa học")
                    .build();
            chapterRepository.save(C11Chap1);

            Lesson ChemG11C1L1 = Lesson.builder()
                    .chapter(C11Chap1)
                    .lessonNumber(1)
                    .lessonName("Khái niệm về cân bằng hóa học")
                    .description("Bài 1: Khái niệm về cân bằng hóa học")
                    .build();
            lessonRepository.save(ChemG11C1L1);

            Lesson ChemG11C1L2 = Lesson.builder()
                    .chapter(C11Chap1)
                    .lessonNumber(2)
                    .lessonName("Cân bằng trong dung dịch nước")
                    .description("Bài 2: Cân bằng trong dung dịch nước")
                    .build();
            lessonRepository.save(ChemG11C1L2);

            Lesson ChemG11C1L3 = Lesson.builder()
                    .chapter(C11Chap1)
                    .lessonNumber(3)
                    .lessonName("Ôn tập chương 1")
                    .description("Bài 3: Ôn tập chương 1")
                    .build();
            lessonRepository.save(ChemG11C1L3);

            Lesson ChemG11C1L4 = Lesson.builder()
                    .chapter(C11Chap1)
                    .lessonNumber(4)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 1")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 1")
                    .build();
            lessonRepository.save(ChemG11C1L4);

// Chemistry Grade 11 - Chapter 2: Nitrogen – Sulfur
            Chapter C11Chap2 = Chapter.builder()
                    .subject(chemistry)
                    .gradeLevel(11)
                    .chapterNumber(2)
                    .chapterName("Nitrogen – Sulfur")
                    .description("Chương 2: Nitrogen – Sulfur")
                    .build();
            chapterRepository.save(C11Chap2);

            Lesson ChemG11C2L1 = Lesson.builder()
                    .chapter(C11Chap2)
                    .lessonNumber(5)
                    .lessonName("Nitrogen")
                    .description("Bài 4: Nitrogen")
                    .build();
            lessonRepository.save(ChemG11C2L1);

            Lesson ChemG11C2L2 = Lesson.builder()
                    .chapter(C11Chap2)
                    .lessonNumber(6)
                    .lessonName("Ammonia - Muối Ammonium")
                    .description("Bài 5: Ammonia - Muối Ammonium")
                    .build();
            lessonRepository.save(ChemG11C2L2);

            Lesson ChemG11C2L3 = Lesson.builder()
                    .chapter(C11Chap2)
                    .lessonNumber(7)
                    .lessonName("Một số chất của nitrogen với oxygen")
                    .description("Bài 6: Một số chất của nitrogen với oxygen")
                    .build();
            lessonRepository.save(ChemG11C2L3);

            Lesson ChemG11C2L4 = Lesson.builder()
                    .chapter(C11Chap2)
                    .lessonNumber(8)
                    .lessonName("Sulfur và sulfur dioxide")
                    .description("Bài 7: Sulfur và sulfur dioxide")
                    .build();
            lessonRepository.save(ChemG11C2L4);

            Lesson ChemG11C2L5 = Lesson.builder()
                    .chapter(C11Chap2)
                    .lessonNumber(9)
                    .lessonName("Sulfuric acid và muối sulfate")
                    .description("Bài 8: Sulfuric acid và muối sulfate")
                    .build();
            lessonRepository.save(ChemG11C2L5);

            Lesson ChemG11C2L6 = Lesson.builder()
                    .chapter(C11Chap2)
                    .lessonNumber(10)
                    .lessonName("Ôn tập chương 2")
                    .description("Bài 9: Ôn tập chương 2")
                    .build();
            lessonRepository.save(ChemG11C2L6);

            Lesson ChemG11C2L7 = Lesson.builder()
                    .chapter(C11Chap2)
                    .lessonNumber(11)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 2")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 2")
                    .build();
            lessonRepository.save(ChemG11C2L7);

// Chemistry Grade 11 - Chapter 3: Đại cương về hóa học hữu cơ
            Chapter C11Chap3 = Chapter.builder()
                    .subject(chemistry)
                    .gradeLevel(11)
                    .chapterNumber(3)
                    .chapterName("Đại cương về hóa học hữu cơ")
                    .description("Chương 3: Đại cương về hóa học hữu cơ")
                    .build();
            chapterRepository.save(C11Chap3);

            Lesson ChemG11C3L1 = Lesson.builder()
                    .chapter(C11Chap3)
                    .lessonNumber(12)
                    .lessonName("Hợp chất hữu cơ và hóa học hữu cơ")
                    .description("Bài 10: Hợp chất hữu cơ và hóa học hữu cơ")
                    .build();
            lessonRepository.save(ChemG11C3L1);

            Lesson ChemG11C3L2 = Lesson.builder()
                    .chapter(C11Chap3)
                    .lessonNumber(13)
                    .lessonName("Phương pháp tách biệt và tinh chế hợp chất hữu cơ")
                    .description("Bài 11: Phương pháp tách biệt và tinh chế hợp chất hữu cơ")
                    .build();
            lessonRepository.save(ChemG11C3L2);

            Lesson ChemG11C3L3 = Lesson.builder()
                    .chapter(C11Chap3)
                    .lessonNumber(14)
                    .lessonName("Công thức phân tử hợp chất hữu cơ")
                    .description("Bài 12: Công thức phân tử hợp chất hữu cơ")
                    .build();
            lessonRepository.save(ChemG11C3L3);

            Lesson ChemG11C3L4 = Lesson.builder()
                    .chapter(C11Chap3)
                    .lessonNumber(15)
                    .lessonName("Cấu tạo hóa học hợp chất hữu cơ")
                    .description("Bài 13: Cấu tạo hóa học hợp chất hữu cơ")
                    .build();
            lessonRepository.save(ChemG11C3L4);

            Lesson ChemG11C3L5 = Lesson.builder()
                    .chapter(C11Chap3)
                    .lessonNumber(16)
                    .lessonName("Ôn tập chương 3")
                    .description("Bài 14: Ôn tập chương 3")
                    .build();
            lessonRepository.save(ChemG11C3L5);

            Lesson ChemG11C3L6 = Lesson.builder()
                    .chapter(C11Chap3)
                    .lessonNumber(17)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 3")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 3")
                    .build();
            lessonRepository.save(ChemG11C3L6);

// Chemistry Grade 11 - Chapter 4: Hydrocarbon
            Chapter C11Chap4 = Chapter.builder()
                    .subject(chemistry)
                    .gradeLevel(11)
                    .chapterNumber(4)
                    .chapterName("Hydrocarbon")
                    .description("Chương 4: Hydrocarbon")
                    .build();
            chapterRepository.save(C11Chap4);

            Lesson ChemG11C4L1 = Lesson.builder()
                    .chapter(C11Chap4)
                    .lessonNumber(18)
                    .lessonName("Alkane")
                    .description("Bài 15: Alkane")
                    .build();
            lessonRepository.save(ChemG11C4L1);

            Lesson ChemG11C4L2 = Lesson.builder()
                    .chapter(C11Chap4)
                    .lessonNumber(19)
                    .lessonName("Hydrocarbon không no")
                    .description("Bài 16: Hydrocarbon không no")
                    .build();
            lessonRepository.save(ChemG11C4L2);

            Lesson ChemG11C4L3 = Lesson.builder()
                    .chapter(C11Chap4)
                    .lessonNumber(20)
                    .lessonName("Arene (Hydrocarbon thơm)")
                    .description("Bài 17: Arene (Hydrocarbon thơm)")
                    .build();
            lessonRepository.save(ChemG11C4L3);

            Lesson ChemG11C4L4 = Lesson.builder()
                    .chapter(C11Chap4)
                    .lessonNumber(21)
                    .lessonName("Ôn tập chương 4")
                    .description("Bài 18: Ôn tập chương 4")
                    .build();
            lessonRepository.save(ChemG11C4L4);

            Lesson ChemG11C4L5 = Lesson.builder()
                    .chapter(C11Chap4)
                    .lessonNumber(22)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 4")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 4")
                    .build();
            lessonRepository.save(ChemG11C4L5);

// Chemistry Grade 11 - Chapter 5: Dẫn xuất Halogen – Alcohol – Phenol
            Chapter C11Chap5 = Chapter.builder()
                    .subject(chemistry)
                    .gradeLevel(11)
                    .chapterNumber(5)
                    .chapterName("Dẫn xuất Halogen – Alcohol – Phenol")
                    .description("Chương 5: Dẫn xuất Halogen – Alcohol – Phenol")
                    .build();
            chapterRepository.save(C11Chap5);

            Lesson ChemG11C5L1 = Lesson.builder()
                    .chapter(C11Chap5)
                    .lessonNumber(23)
                    .lessonName("Dẫn xuất halogen")
                    .description("Bài 19: Dẫn xuất halogen")
                    .build();
            lessonRepository.save(ChemG11C5L1);

            Lesson ChemG11C5L2 = Lesson.builder()
                    .chapter(C11Chap5)
                    .lessonNumber(24)
                    .lessonName("Alcohol")
                    .description("Bài 20: Alcohol")
                    .build();
            lessonRepository.save(ChemG11C5L2);

            Lesson ChemG11C5L3 = Lesson.builder()
                    .chapter(C11Chap5)
                    .lessonNumber(25)
                    .lessonName("Phenol")
                    .description("Bài 21: Phenol")
                    .build();
            lessonRepository.save(ChemG11C5L3);

            Lesson ChemG11C5L4 = Lesson.builder()
                    .chapter(C11Chap5)
                    .lessonNumber(26)
                    .lessonName("Ôn tập chương 5")
                    .description("Bài 22: Ôn tập chương 5")
                    .build();
            lessonRepository.save(ChemG11C5L4);

            Lesson ChemG11C5L5 = Lesson.builder()
                    .chapter(C11Chap5)
                    .lessonNumber(27)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 5")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 5")
                    .build();
            lessonRepository.save(ChemG11C5L5);

// Chemistry Grade 11 - Chapter 6: Hợp chất Carbonyl – Carboxylic Acid
            Chapter C11Chap6 = Chapter.builder()
                    .subject(chemistry)
                    .gradeLevel(11)
                    .chapterNumber(6)
                    .chapterName("Hợp chất Carbonyl – Carboxylic Acid")
                    .description("Chương 6: Hợp chất Carbonyl – Carboxylic Acid")
                    .build();
            chapterRepository.save(C11Chap6);

            Lesson ChemG11C6L1 = Lesson.builder()
                    .chapter(C11Chap6)
                    .lessonNumber(28)
                    .lessonName("Hợp chất carbonyl")
                    .description("Bài 23: Hợp chất carbonyl")
                    .build();
            lessonRepository.save(ChemG11C6L1);

            Lesson ChemG11C6L2 = Lesson.builder()
                    .chapter(C11Chap6)
                    .lessonNumber(29)
                    .lessonName("Carboxylic acid")
                    .description("Bài 24: Carboxylic acid")
                    .build();
            lessonRepository.save(ChemG11C6L2);

            Lesson ChemG11C6L3 = Lesson.builder()
                    .chapter(C11Chap6)
                    .lessonNumber(30)
                    .lessonName("Ôn tập chương 6")
                    .description("Bài 25: Ôn tập chương 6")
                    .build();
            lessonRepository.save(ChemG11C6L3);

            Lesson ChemG11C6L4 = Lesson.builder()
                    .chapter(C11Chap6)
                    .lessonNumber(31)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 6")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 6")
                    .build();
            lessonRepository.save(ChemG11C6L4);
            // Chemistry Grade 12 - Chapter 1: Ester - lipid
            Chapter C12Chap1 = Chapter.builder()
                    .subject(chemistry)
                    .gradeLevel(12)
                    .chapterNumber(1)
                    .chapterName("Ester - lipid")
                    .description("Chương 1: Ester - lipid")
                    .build();
            chapterRepository.save(C12Chap1);

            Lesson ChemG12C1L1 = Lesson.builder()
                    .chapter(C12Chap1)
                    .lessonNumber(1)
                    .lessonName("Ester - Lipid")
                    .description("Bài 1: Ester - Lipid")
                    .build();
            lessonRepository.save(ChemG12C1L1);

            Lesson ChemG12C1L2 = Lesson.builder()
                    .chapter(C12Chap1)
                    .lessonNumber(2)
                    .lessonName("Xà phòng và chất giặt rửa")
                    .description("Bài 2: Xà phòng và chất giặt rửa")
                    .build();
            lessonRepository.save(ChemG12C1L2);

            Lesson ChemG12C1L3 = Lesson.builder()
                    .chapter(C12Chap1)
                    .lessonNumber(3)
                    .lessonName("Ôn tập chương 1")
                    .description("Bài 3: Ôn tập chương 1")
                    .build();
            lessonRepository.save(ChemG12C1L3);

            Lesson ChemG12C1L4 = Lesson.builder()
                    .chapter(C12Chap1)
                    .lessonNumber(4)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 1")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 1")
                    .build();
            lessonRepository.save(ChemG12C1L4);

// Chemistry Grade 12 - Chapter 2: Carbohydrate
            Chapter C12Chap2 = Chapter.builder()
                    .subject(chemistry)
                    .gradeLevel(12)
                    .chapterNumber(2)
                    .chapterName("Carbohydrate")
                    .description("Chương 2: Carbohydrate")
                    .build();
            chapterRepository.save(C12Chap2);

            Lesson ChemG12C2L1 = Lesson.builder()
                    .chapter(C12Chap2)
                    .lessonNumber(5)
                    .lessonName("Giới thiệu về carbohydrate. Glucose và fructose")
                    .description("Bài 4: Giới thiệu về carbohydrate. Glucose và fructose")
                    .build();
            lessonRepository.save(ChemG12C2L1);

            Lesson ChemG12C2L2 = Lesson.builder()
                    .chapter(C12Chap2)
                    .lessonNumber(6)
                    .lessonName("Saccharose và maltose")
                    .description("Bài 5: Saccharose và maltose")
                    .build();
            lessonRepository.save(ChemG12C2L2);

            Lesson ChemG12C2L3 = Lesson.builder()
                    .chapter(C12Chap2)
                    .lessonNumber(7)
                    .lessonName("Tinh bột và cellulose")
                    .description("Bài 6: Tinh bột và cellulose")
                    .build();
            lessonRepository.save(ChemG12C2L3);

            Lesson ChemG12C2L4 = Lesson.builder()
                    .chapter(C12Chap2)
                    .lessonNumber(8)
                    .lessonName("Ôn tập chương 2")
                    .description("Bài 7: Ôn tập chương 2")
                    .build();
            lessonRepository.save(ChemG12C2L4);

            Lesson ChemG12C2L5 = Lesson.builder()
                    .chapter(C12Chap2)
                    .lessonNumber(9)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 2")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 2")
                    .build();
            lessonRepository.save(ChemG12C2L5);

// Chemistry Grade 12 - Chapter 3: Hợp chất chứa nitrogen
            Chapter C12Chap3 = Chapter.builder()
                    .subject(chemistry)
                    .gradeLevel(12)
                    .chapterNumber(3)
                    .chapterName("Hợp chất chứa nitrogen")
                    .description("Chương 3: Hợp chất chứa nitrogen")
                    .build();
            chapterRepository.save(C12Chap3);

            Lesson ChemG12C3L1 = Lesson.builder()
                    .chapter(C12Chap3)
                    .lessonNumber(10)
                    .lessonName("Amine")
                    .description("Bài 8: Amine")
                    .build();
            lessonRepository.save(ChemG12C3L1);

            Lesson ChemG12C3L2 = Lesson.builder()
                    .chapter(C12Chap3)
                    .lessonNumber(11)
                    .lessonName("Amino acid và peptide")
                    .description("Bài 9: Amino acid và peptide")
                    .build();
            lessonRepository.save(ChemG12C3L2);

            Lesson ChemG12C3L3 = Lesson.builder()
                    .chapter(C12Chap3)
                    .lessonNumber(12)
                    .lessonName("Protein và enzyme")
                    .description("Bài 10: Protein và enzyme")
                    .build();
            lessonRepository.save(ChemG12C3L3);

            Lesson ChemG12C3L4 = Lesson.builder()
                    .chapter(C12Chap3)
                    .lessonNumber(13)
                    .lessonName("Ôn tập chương 3")
                    .description("Bài 11: Ôn tập chương 3")
                    .build();
            lessonRepository.save(ChemG12C3L4);

            Lesson ChemG12C3L5 = Lesson.builder()
                    .chapter(C12Chap3)
                    .lessonNumber(14)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 3")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 3")
                    .build();
            lessonRepository.save(ChemG12C3L5);

// Chemistry Grade 12 - Chapter 4: Polymer
            Chapter C12Chap4 = Chapter.builder()
                    .subject(chemistry)
                    .gradeLevel(12)
                    .chapterNumber(4)
                    .chapterName("Polymer")
                    .description("Chương 4: Polymer")
                    .build();
            chapterRepository.save(C12Chap4);

            Lesson ChemG12C4L1 = Lesson.builder()
                    .chapter(C12Chap4)
                    .lessonNumber(15)
                    .lessonName("Đại cương về polymer")
                    .description("Bài 12: Đại cương về polymer")
                    .build();
            lessonRepository.save(ChemG12C4L1);

            Lesson ChemG12C4L2 = Lesson.builder()
                    .chapter(C12Chap4)
                    .lessonNumber(16)
                    .lessonName("Vật liệu polymer")
                    .description("Bài 13: Vật liệu polymer")
                    .build();
            lessonRepository.save(ChemG12C4L2);

            Lesson ChemG12C4L3 = Lesson.builder()
                    .chapter(C12Chap4)
                    .lessonNumber(17)
                    .lessonName("Ôn tập chương 4")
                    .description("Bài 14: Ôn tập chương 4")
                    .build();
            lessonRepository.save(ChemG12C4L3);

            Lesson ChemG12C4L4 = Lesson.builder()
                    .chapter(C12Chap4)
                    .lessonNumber(18)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 4")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 4")
                    .build();
            lessonRepository.save(ChemG12C4L4);

// Chemistry Grade 12 - Chapter 5: Pin điện và điện phân
            Chapter C12Chap5 = Chapter.builder()
                    .subject(chemistry)
                    .gradeLevel(12)
                    .chapterNumber(5)
                    .chapterName("Pin điện và điện phân")
                    .description("Chương 5: Pin điện và điện phân")
                    .build();
            chapterRepository.save(C12Chap5);

            Lesson ChemG12C5L1 = Lesson.builder()
                    .chapter(C12Chap5)
                    .lessonNumber(19)
                    .lessonName("Thể điện cực và nguồn điện hoá học")
                    .description("Bài 15: Thể điện cực và nguồn điện hoá học")
                    .build();
            lessonRepository.save(ChemG12C5L1);

            Lesson ChemG12C5L2 = Lesson.builder()
                    .chapter(C12Chap5)
                    .lessonNumber(20)
                    .lessonName("Điện phân")
                    .description("Bài 16: Điện phân")
                    .build();
            lessonRepository.save(ChemG12C5L2);

            Lesson ChemG12C5L3 = Lesson.builder()
                    .chapter(C12Chap5)
                    .lessonNumber(21)
                    .lessonName("Ôn tập chương 5")
                    .description("Bài 17: Ôn tập chương 5")
                    .build();
            lessonRepository.save(ChemG12C5L3);

            Lesson ChemG12C5L4 = Lesson.builder()
                    .chapter(C12Chap5)
                    .lessonNumber(22)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 5")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 5")
                    .build();
            lessonRepository.save(ChemG12C5L4);

// Chemistry Grade 12 - Chapter 6: Đại cương về kim loại
            Chapter C12Chap6 = Chapter.builder()
                    .subject(chemistry)
                    .gradeLevel(12)
                    .chapterNumber(6)
                    .chapterName("Đại cương về kim loại")
                    .description("Chương 6: Đại cương về kim loại")
                    .build();
            chapterRepository.save(C12Chap6);

            Lesson ChemG12C6L1 = Lesson.builder()
                    .chapter(C12Chap6)
                    .lessonNumber(23)
                    .lessonName("Cấu tạo và liên kết trong tinh thể kim loại")
                    .description("Bài 18: Cấu tạo và liên kết trong tinh thể kim loại")
                    .build();
            lessonRepository.save(ChemG12C6L1);

            Lesson ChemG12C6L2 = Lesson.builder()
                    .chapter(C12Chap6)
                    .lessonNumber(24)
                    .lessonName("Tính chất vật lí và tính chất hoá học của kim loại")
                    .description("Bài 19: Tính chất vật lí và tính chất hoá học của kim loại")
                    .build();
            lessonRepository.save(ChemG12C6L2);

            Lesson ChemG12C6L3 = Lesson.builder()
                    .chapter(C12Chap6)
                    .lessonNumber(25)
                    .lessonName("Kim loại trong tự nhiên và phương pháp tách kim loại")
                    .description("Bài 20: Kim loại trong tự nhiên và phương pháp tách kim loại")
                    .build();
            lessonRepository.save(ChemG12C6L3);

            Lesson ChemG12C6L4 = Lesson.builder()
                    .chapter(C12Chap6)
                    .lessonNumber(26)
                    .lessonName("Hợp kim")
                    .description("Bài 21: Hợp kim")
                    .build();
            lessonRepository.save(ChemG12C6L4);

            Lesson ChemG12C6L5 = Lesson.builder()
                    .chapter(C12Chap6)
                    .lessonNumber(27)
                    .lessonName("Sự ăn mòn kim loại")
                    .description("Bài 22: Sự ăn mòn kim loại")
                    .build();
            lessonRepository.save(ChemG12C6L5);

            Lesson ChemG12C6L6 = Lesson.builder()
                    .chapter(C12Chap6)
                    .lessonNumber(28)
                    .lessonName("Ôn tập chương 6")
                    .description("Bài 23: Ôn tập chương 6")
                    .build();
            lessonRepository.save(ChemG12C6L6);

            Lesson ChemG12C6L7 = Lesson.builder()
                    .chapter(C12Chap6)
                    .lessonNumber(29)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 6")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 6")
                    .build();
            lessonRepository.save(ChemG12C6L7);

// Chemistry Grade 12 - Chapter 7: Nguyên tố nhóm IA và nhóm IIA
            Chapter C12Chap7 = Chapter.builder()
                    .subject(chemistry)
                    .gradeLevel(12)
                    .chapterNumber(7)
                    .chapterName("Nguyên tố nhóm IA và nhóm IIA")
                    .description("Chương 7: Nguyên tố nhóm IA và nhóm IIA")
                    .build();
            chapterRepository.save(C12Chap7);

            Lesson ChemG12C7L1 = Lesson.builder()
                    .chapter(C12Chap7)
                    .lessonNumber(30)
                    .lessonName("Nguyên tố nhóm IA")
                    .description("Bài 24: Nguyên tố nhóm IA")
                    .build();
            lessonRepository.save(ChemG12C7L1);

            Lesson ChemG12C7L2 = Lesson.builder()
                    .chapter(C12Chap7)
                    .lessonNumber(31)
                    .lessonName("Nguyên tố nhóm IIA")
                    .description("Bài 25: Nguyên tố nhóm IIA")
                    .build();
            lessonRepository.save(ChemG12C7L2);

            Lesson ChemG12C7L3 = Lesson.builder()
                    .chapter(C12Chap7)
                    .lessonNumber(32)
                    .lessonName("Ôn tập chương 7")
                    .description("Bài 26: Ôn tập chương 7")
                    .build();
            lessonRepository.save(ChemG12C7L3);

            Lesson ChemG12C7L4 = Lesson.builder()
                    .chapter(C12Chap7)
                    .lessonNumber(33)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 7")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 7")
                    .build();
            lessonRepository.save(ChemG12C7L4);

// Chemistry Grade 12 - Chapter 8: Sơ lược về dãy kim loại chuyển tiếp thứ nhất và phức chất
            Chapter C12Chap8 = Chapter.builder()
                    .subject(chemistry)
                    .gradeLevel(12)
                    .chapterNumber(8)
                    .chapterName("Sơ lược về dãy kim loại chuyển tiếp thứ nhất và phức chất")
                    .description("Chương 8: Sơ lược về dãy kim loại chuyển tiếp thứ nhất và phức chất")
                    .build();
            chapterRepository.save(C12Chap8);

            Lesson ChemG12C8L1 = Lesson.builder()
                    .chapter(C12Chap8)
                    .lessonNumber(34)
                    .lessonName("Đại cương về kim loại chuyển tiếp dãy thứ nhất")
                    .description("Bài 27: Đại cương về kim loại chuyển tiếp dãy thứ nhất")
                    .build();
            lessonRepository.save(ChemG12C8L1);

            Lesson ChemG12C8L2 = Lesson.builder()
                    .chapter(C12Chap8)
                    .lessonNumber(35)
                    .lessonName("Sơ lược về phức chất")
                    .description("Bài 28: Sơ lược về phức chất")
                    .build();
            lessonRepository.save(ChemG12C8L2);

            Lesson ChemG12C8L3 = Lesson.builder()
                    .chapter(C12Chap8)
                    .lessonNumber(36)
                    .lessonName("Một số tính chất và ứng dụng của phức chất")
                    .description("Bài 29: Một số tính chất và ứng dụng của phức chất")
                    .build();
            lessonRepository.save(ChemG12C8L3);

            Lesson ChemG12C8L4 = Lesson.builder()
                    .chapter(C12Chap8)
                    .lessonNumber(37)
                    .lessonName("Ôn tập chương 8")
                    .description("Bài 30: Ôn tập chương 8")
                    .build();
            lessonRepository.save(ChemG12C8L4);

            Lesson ChemG12C8L5 = Lesson.builder()
                    .chapter(C12Chap8)
                    .lessonNumber(38)
                    .lessonName("Câu hỏi ôn tập - Đề kiểm tra Chương 8")
                    .description("Câu hỏi ôn tập - Đề kiểm tra Chương 8")
                    .build();
            lessonRepository.save(ChemG12C8L5);
        }
    }
    private void initializeRoles () {

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


