package com.fptu.eduBoostBackend.initializer;


import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.repositories.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import static com.fptu.eduBoostBackend.constant.PredefinedRole.ADMIN_ROLE;
import static com.fptu.eduBoostBackend.constant.PredefinedRole.STUDENT_ROLE;
import static com.fptu.eduBoostBackend.constant.PredefinedRole.TEACH_ROLE;

import com.fptu.eduBoostBackend.entities.enums.Gender;
import com.fptu.eduBoostBackend.entities.enums.LessonResourceType;
import com.fptu.eduBoostBackend.entities.enums.StudentStatus;

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
    private final ExamTypeRepository examTypeRepository;
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
        initializeExamTypes();
    }

    /**
     * Khởi tạo các mức độ nhận thức theo chuẩn giáo dục Việt Nam
     * 4 mức độ: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao
     */
    private void initializeExamTypes() {

        examTypeRepository.save(
                ExamType.builder()
                        .typeCode("15MIN")
                        .typeName("Kiểm tra 15 phút")
                        .requiresMatrix(false)
                        .description("Bài kiểm tra ngắn trong thời gian 15 phút")
                        .displayOrder(1)
                        .build()
        );

        examTypeRepository.save(
                ExamType.builder()
                        .typeCode("45MIN")
                        .typeName("Kiểm tra 1 tiết")
                        .requiresMatrix(true)
                        .description("Bài kiểm tra 1 tiết, thường yêu cầu ma trận đề")
                        .displayOrder(2)
                        .build()
        );

        examTypeRepository.save(
                ExamType.builder()
                        .typeCode("MIDTERM")
                        .typeName("Kiểm tra giữa kỳ")
                        .requiresMatrix(true)
                        .description("Bài kiểm tra đánh giá giữa học kỳ")
                        .displayOrder(3)
                        .build()
        );

        examTypeRepository.save(
                ExamType.builder()
                        .typeCode("FINAL")
                        .typeName("Kiểm tra cuối kỳ")
                        .requiresMatrix(true)
                        .description("Bài kiểm tra tổng kết cuối học kỳ")
                        .displayOrder(4)
                        .build()
        );
    }
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
                .subjectName("Toán học")
                .description("Môn Toán học - Bao gồm Đại số, Hình học, Giải tích")
                .build();
        subjectRepository.save(math);

        Subject physics = Subject.builder()
                .subjectCode("LY")
                .subjectName("Vật lý")
                .description("Môn Vật lý - Nghiên cứu các hiện tượng tự nhiên")
                .build();
        subjectRepository.save(physics);

        Subject chemistry = Subject.builder()
                .subjectCode("HOA")
                .subjectName("Hóa học")
                .description("Môn Hóa học - Nghiên cứu về chất và phản ứng hóa học")
                .build();
        subjectRepository.save(chemistry);

        Subject english = Subject.builder()
                .subjectCode("ANH")
                .subjectName("Tiếng Anh")
                .description("Môn Tiếng Anh - Ngôn ngữ quốc tế")
                .build();
        subjectRepository.save(english);

        Subject literature = Subject.builder()
                .subjectCode("VAN")
                .subjectName("Ngữ văn")
                .description("Môn Ngữ văn - Văn học và tiếng Việt")
                .build();
        subjectRepository.save(literature);

        Subject biology = Subject.builder()
                .subjectCode("SINH")
                .subjectName("Sinh học")
                .description("Môn Sinh học - Nghiên cứu về sự sống")
                .build();
        subjectRepository.save(biology);

        Subject history = Subject.builder()
                .subjectCode("SU")
                .subjectName("Lịch sử")
                .description("Môn Lịch sử - Tìm hiểu quá khứ")
                .build();
        subjectRepository.save(history);

        Subject geography = Subject.builder()
                .subjectCode("DIA")
                .subjectName("Địa lý")
                .description("Môn Địa lý - Nghiên cứu về Trái đất")
                .build();
        subjectRepository.save(geography);

        Subject civics = Subject.builder()
                .subjectCode("GDCD")
                .subjectName("Giáo dục công dân")
                .description("Môn Giáo dục công dân - Đạo đức và pháp luật")
                .build();
        subjectRepository.save(civics);

        Subject informatics = Subject.builder()
                .subjectCode("TIN")
                .subjectName("Tin học")
                .description("Môn Tin học - Công nghệ thông tin")
                .build();
        subjectRepository.save(informatics);
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
                    .lessonName("Tập hợp và các phép toán trên tập hợp")
                    .description("Khái niệm tập hợp, tập con, hợp, giao, hiệu của hai tập hợp")
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
                    .chapterName("Bất phương trình và hệ bất phương trình bậc nhất hai ẩn")
                    .description("Chương 2: Bất phương trình và hệ bất phương trình bậc nhất hai ẩn")
                    .build();
            chapterRepository.save(mathChap2);
            Lesson mathC2L1 = Lesson.builder()
                    .chapter(mathChap2)
                    .lessonNumber(1)
                    .lessonName("Bất phương trình bậc nhất hai ẩn")
                    .description("Khái niệm bất phương trình bậc nhất hai ẩn và cách biểu diễn tập nghiệm")
                    .build();
            lessonRepository.save(mathC2L1);

            Lesson mathC2L2 = Lesson.builder()
                    .chapter(mathChap2)
                    .lessonNumber(2)
                    .lessonName("Hệ bất phương trình bậc nhất hai ẩn")
                    .description("Khái niệm hệ bất phương trình bậc nhất hai ẩn và cách giải")
                    .build();
            lessonRepository.save(mathC2L2);
            LessonResource mathC2L2R1 = LessonResource.builder()
                    .lesson(mathC2L2)
                    .resourceName("Video bài giảng Hệ bất phương trình bậc nhất hai ẩn")
                    .resourceType(LessonResourceType.URL)
                    .fileUrl("https://youtube.com/watch?v=example")
                    .extractedContent("Khái niệm hệ bất phương trình bậc nhất hai ẩn và cách giải")
                    .build();
            lessonResourceRepository.save(mathC2L2R1);
        }

        Chapter mathChap3 = Chapter.builder()
                .subject(math)
                .gradeLevel(10)
                .chapterNumber(3)
                .chapterName("Hệ thức lượng trong tam giác")
                .description("Chương 3: Hệ thức lượng trong tam giác")
                .build();
        chapterRepository.save(mathChap3);

        Lesson mathC3L1 = Lesson.builder()
                .chapter(mathChap3)
                .lessonNumber(1)
                .lessonName("Giá trị lượng giác của một góc từ 0 độ đến 180 độ")
                .description("Giá trị lượng giác của một góc trong khoảng từ 0 đến 180 độ")
                .build();
        lessonRepository.save(mathC3L1);

        Lesson mathC3L2 = Lesson.builder()
                .chapter(mathChap3)
                .lessonNumber(2)
                .lessonName("Hệ thức lượng trong tam giác")
                .description("Các hệ thức lượng cơ bản trong tam giác")
                .build();
        lessonRepository.save(mathC3L2);

        Chapter mathChap4 = Chapter.builder()
                .subject(math)
                .gradeLevel(10)
                .chapterNumber(4)
                .chapterName("Vectơ")
                .description("Chương 4: Vectơ")
                .build();
        chapterRepository.save(mathChap4);

        Lesson mathC4L1 = Lesson.builder()
                .chapter(mathChap4)
                .lessonNumber(1)
                .lessonName("Các khái niệm mở đầu")
                .description("Khái niệm vectơ, giá của vectơ, độ dài vectơ")
                .build();
        lessonRepository.save(mathC4L1);

        Lesson mathC4L2 = Lesson.builder()
                .chapter(mathChap4)
                .lessonNumber(2)
                .lessonName("Tổng và hiệu của hai vectơ")
                .description("Phép cộng và phép trừ hai vectơ")
                .build();
        lessonRepository.save(mathC4L2);

        Lesson mathC4L3 = Lesson.builder()
                .chapter(mathChap4)
                .lessonNumber(3)
                .lessonName("Tích của một vectơ với một số")
                .description("Phép nhân vectơ với một số thực")
                .build();
        lessonRepository.save(mathC4L3);

        Lesson mathC4L4 = Lesson.builder()
                .chapter(mathChap4)
                .lessonNumber(4)
                .lessonName("Vectơ trong mặt phẳng tọa độ")
                .description("Biểu diễn vectơ trong hệ trục tọa độ")
                .build();
        lessonRepository.save(mathC4L4);

        Lesson mathC4L5 = Lesson.builder()
                .chapter(mathChap4)
                .lessonNumber(5)
                .lessonName("Tích vô hướng của hai vectơ")
                .description("Khái niệm và ứng dụng của tích vô hướng")
                .build();
        lessonRepository.save(mathC4L5);

        Chapter mathChap5 = Chapter.builder()
                .subject(math)
                .gradeLevel(10)
                .chapterNumber(5)
                .chapterName("Các số đặc trưng của mẫu số liệu không ghép nhóm")
                .description("Chương 5: Các số đặc trưng của mẫu số liệu không ghép nhóm")
                .build();
        chapterRepository.save(mathChap5);

        Lesson mathC5L1 = Lesson.builder()
                .chapter(mathChap5)
                .lessonNumber(1)
                .lessonName("Số gần đúng và sai số")
                .description("Khái niệm số gần đúng, sai số tuyệt đối và sai số tương đối")
                .build();
        lessonRepository.save(mathC5L1);

        Lesson mathC5L2 = Lesson.builder()
                .chapter(mathChap5)
                .lessonNumber(2)
                .lessonName("Các số đặc trưng đo xu thế trung tâm")
                .description("Số trung bình cộng, trung vị, mốt")
                .build();
        lessonRepository.save(mathC5L2);

        Lesson mathC5L3 = Lesson.builder()
                .chapter(mathChap5)
                .lessonNumber(3)
                .lessonName("Các số đặc trưng đo độ phân tán")
                .description("Khoảng biến thiên, phương sai và độ lệch chuẩn")
                .build();
        lessonRepository.save(mathC5L3);

        Chapter mathChap6 = Chapter.builder()
                .subject(math)
                .gradeLevel(10)
                .chapterNumber(6)
                .chapterName("Hàm số, đồ thị và ứng dụng")
                .description("Chương 6: Hàm số, đồ thị và ứng dụng")
                .build();
        chapterRepository.save(mathChap6);

        Lesson mathC6L1 = Lesson.builder()
                .chapter(mathChap6)
                .lessonNumber(1)
                .lessonName("Hàm số")
                .description("Khái niệm hàm số và cách biểu diễn hàm số")
                .build();
        lessonRepository.save(mathC6L1);

        Lesson mathC6L2 = Lesson.builder()
                .chapter(mathChap6)
                .lessonNumber(2)
                .lessonName("Hàm số bậc hai")
                .description("Hàm số bậc hai và đồ thị parabol")
                .build();
        lessonRepository.save(mathC6L2);

        Lesson mathC6L3 = Lesson.builder()
                .chapter(mathChap6)
                .lessonNumber(3)
                .lessonName("Dấu của tam thức bậc hai")
                .description("Xét dấu tam thức bậc hai và ứng dụng")
                .build();
        lessonRepository.save(mathC6L3);

        Lesson mathC6L4 = Lesson.builder()
                .chapter(mathChap6)
                .lessonNumber(4)
                .lessonName("Phương trình quy về phương trình bậc hai")
                .description("Các phương trình có thể đưa về dạng bậc hai")
                .build();
        lessonRepository.save(mathC6L4);


        Chapter mathChap7 = Chapter.builder()
                .subject(math)
                .gradeLevel(10)
                .chapterNumber(7)
                .chapterName("Phương pháp tọa độ trong mặt phẳng")
                .description("Chương 7: Phương pháp tọa độ trong mặt phẳng")
                .build();
        chapterRepository.save(mathChap7);

        Lesson mathC7L1 = Lesson.builder()
                .chapter(mathChap7)
                .lessonNumber(1)
                .lessonName("Phương trình đường thẳng")
                .description("Các dạng phương trình của đường thẳng")
                .build();
        lessonRepository.save(mathC7L1);

        Lesson mathC7L2 = Lesson.builder()
                .chapter(mathChap7)
                .lessonNumber(2)
                .lessonName("Vị trí tương đối giữa hai đường thẳng. Góc và khoảng cách")
                .description("Xét vị trí, góc và khoảng cách giữa hai đường thẳng")
                .build();
        lessonRepository.save(mathC7L2);

        Lesson mathC7L3 = Lesson.builder()
                .chapter(mathChap7)
                .lessonNumber(3)
                .lessonName("Đường tròn trong mặt phẳng tọa độ")
                .description("Phương trình đường tròn và các bài toán liên quan")
                .build();
        lessonRepository.save(mathC7L3);

        Lesson mathC7L4 = Lesson.builder()
                .chapter(mathChap7)
                .lessonNumber(4)
                .lessonName("Ba đường conic")
                .description("Elip, hypebol và parabol")
                .build();
        lessonRepository.save(mathC7L4);


        Chapter mathChap8 = Chapter.builder()
                .subject(math)
                .gradeLevel(10)
                .chapterNumber(8)
                .chapterName("Đại số tổ hợp")
                .description("Chương 8: Đại số tổ hợp")
                .build();
        chapterRepository.save(mathChap8);

        Lesson mathC8L1 = Lesson.builder()
                .chapter(mathChap8)
                .lessonNumber(1)
                .lessonName("Quy tắc đếm")
                .description("Quy tắc cộng và quy tắc nhân")
                .build();
        lessonRepository.save(mathC8L1);

        Lesson mathC8L2 = Lesson.builder()
                .chapter(mathChap8)
                .lessonNumber(2)
                .lessonName("Hoán vị, chỉnh hợp và tổ hợp")
                .description("Các khái niệm hoán vị, chỉnh hợp và tổ hợp")
                .build();
        lessonRepository.save(mathC8L2);

        Lesson mathC8L3 = Lesson.builder()
                .chapter(mathChap8)
                .lessonNumber(3)
                .lessonName("Nhị thức Newton")
                .description("Khai triển nhị thức Newton")
                .build();
        lessonRepository.save(mathC8L3);


        Chapter mathChap9 = Chapter.builder()
                .subject(math)
                .gradeLevel(10)
                .chapterNumber(9)
                .chapterName("Tính xác suất theo định nghĩa cổ điển")
                .description("Chương 9: Tính xác suất theo định nghĩa cổ điển")
                .build();
        chapterRepository.save(mathChap9);

        Lesson mathC9L1 = Lesson.builder()
                .chapter(mathChap9)
                .lessonNumber(1)
                .lessonName("Biến cố và định nghĩa cổ điển của xác suất")
                .description("Khái niệm biến cố và xác suất theo định nghĩa cổ điển")
                .build();
        lessonRepository.save(mathC9L1);

        Lesson mathC9L2 = Lesson.builder()
                .chapter(mathChap9)
                .lessonNumber(2)
                .lessonName("Thực hành tính xác suất theo định nghĩa cổ điển")
                .description("Áp dụng công thức xác suất vào bài toán thực tế")
                .build();
        lessonRepository.save(mathC9L2);
        Chapter math11Chap1 = Chapter.builder()
                .subject(math)
                .gradeLevel(11)
                .chapterNumber(1)
                .chapterName("Hàm số lượng giác và phương trình lượng giác")
                .description("Chương I: Hàm số lượng giác và phương trình lượng giác")
                .build();
        chapterRepository.save(math11Chap1);

        Lesson math11C1L1 = Lesson.builder()
                .chapter(math11Chap1)
                .lessonNumber(1)
                .lessonName("Giá trị lượng giác của góc lượng giác")
                .description("Giá trị lượng giác của góc lượng giác")
                .build();
        lessonRepository.save(math11C1L1);

        Lesson math11C1L2 = Lesson.builder()
                .chapter(math11Chap1)
                .lessonNumber(2)
                .lessonName("Công thức lượng giác")
                .description("Các công thức lượng giác cơ bản")
                .build();
        lessonRepository.save(math11C1L2);

        Lesson math11C1L3 = Lesson.builder()
                .chapter(math11Chap1)
                .lessonNumber(3)
                .lessonName("Hàm số lượng giác")
                .description("Khái niệm và đồ thị các hàm số lượng giác")
                .build();
        lessonRepository.save(math11C1L3);

        Lesson math11C1L4 = Lesson.builder()
                .chapter(math11Chap1)
                .lessonNumber(4)
                .lessonName("Phương trình lượng giác cơ bản")
                .description("Các phương trình lượng giác cơ bản")
                .build();
        lessonRepository.save(math11C1L4);


        Chapter math11Chap2 = Chapter.builder()
                .subject(math)
                .gradeLevel(11)
                .chapterNumber(2)
                .chapterName("Dãy số, cấp số cộng và cấp số nhân")
                .description("Chương II: Dãy số, cấp số cộng và cấp số nhân")
                .build();
        chapterRepository.save(math11Chap2);

        Lesson math11C2L1 = Lesson.builder()
                .chapter(math11Chap2)
                .lessonNumber(1)
                .lessonName("Dãy số")
                .description("Khái niệm dãy số và cách cho dãy số")
                .build();
        lessonRepository.save(math11C2L1);

        Lesson math11C2L2 = Lesson.builder()
                .chapter(math11Chap2)
                .lessonNumber(2)
                .lessonName("Cấp số cộng")
                .description("Định nghĩa và các tính chất của cấp số cộng")
                .build();
        lessonRepository.save(math11C2L2);

        Lesson math11C2L3 = Lesson.builder()
                .chapter(math11Chap2)
                .lessonNumber(3)
                .lessonName("Cấp số nhân")
                .description("Định nghĩa và các tính chất của cấp số nhân")
                .build();
        lessonRepository.save(math11C2L3);


        Chapter math11Chap3 = Chapter.builder()
                .subject(math)
                .gradeLevel(11)
                .chapterNumber(3)
                .chapterName("Các số đặc trưng đo xu thế trung tâm của mẫu số liệu ghép nhóm")
                .description("Chương III: Các số đặc trưng đo xu thế trung tâm của mẫu số liệu ghép nhóm")
                .build();
        chapterRepository.save(math11Chap3);

        Lesson math11C3L1 = Lesson.builder()
                .chapter(math11Chap3)
                .lessonNumber(1)
                .lessonName("Mẫu số liệu ghép nhóm")
                .description("Khái niệm mẫu số liệu ghép nhóm")
                .build();
        lessonRepository.save(math11C3L1);

        Lesson math11C3L2 = Lesson.builder()
                .chapter(math11Chap3)
                .lessonNumber(2)
                .lessonName("Các số đặc trưng đo xu thế trung tâm")
                .description("Số trung bình, trung vị và mốt của mẫu số liệu ghép nhóm")
                .build();
        lessonRepository.save(math11C3L2);


        Chapter math11Chap4 = Chapter.builder()
                .subject(math)
                .gradeLevel(11)
                .chapterNumber(4)
                .chapterName("Quan hệ song song trong không gian")
                .description("Chương IV: Quan hệ song song trong không gian")
                .build();
        chapterRepository.save(math11Chap4);

        Lesson math11C4L1 = Lesson.builder()
                .chapter(math11Chap4)
                .lessonNumber(1)
                .lessonName("Đường thẳng và mặt phẳng trong không gian")
                .description("Vị trí tương đối của đường thẳng và mặt phẳng")
                .build();
        lessonRepository.save(math11C4L1);

        Lesson math11C4L2 = Lesson.builder()
                .chapter(math11Chap4)
                .lessonNumber(2)
                .lessonName("Hai đường thẳng song song")
                .description("Điều kiện và tính chất của hai đường thẳng song song")
                .build();
        lessonRepository.save(math11C4L2);

        Lesson math11C4L3 = Lesson.builder()
                .chapter(math11Chap4)
                .lessonNumber(3)
                .lessonName("Đường thẳng và mặt phẳng song song")
                .description("Điều kiện song song giữa đường thẳng và mặt phẳng")
                .build();
        lessonRepository.save(math11C4L3);

        Lesson math11C4L4 = Lesson.builder()
                .chapter(math11Chap4)
                .lessonNumber(4)
                .lessonName("Hai mặt phẳng song song")
                .description("Điều kiện và tính chất của hai mặt phẳng song song")
                .build();
        lessonRepository.save(math11C4L4);

        Lesson math11C4L5 = Lesson.builder()
                .chapter(math11Chap4)
                .lessonNumber(5)
                .lessonName("Phép chiếu song song")
                .description("Khái niệm và ứng dụng của phép chiếu song song")
                .build();
        lessonRepository.save(math11C4L5);
        Chapter math11Chap5 = Chapter.builder()
                .subject(math)
                .gradeLevel(11)
                .chapterNumber(5)
                .chapterName("Giới hạn. Hàm số liên tục")
                .description("Chương V: Giới hạn. Hàm số liên tục")
                .build();
        chapterRepository.save(math11Chap5);

        Lesson math11C5L1 = Lesson.builder()
                .chapter(math11Chap5)
                .lessonNumber(1)
                .lessonName("Giới hạn của dãy số")
                .description("Khái niệm và các dạng giới hạn của dãy số")
                .build();
        lessonRepository.save(math11C5L1);

        Lesson math11C5L2 = Lesson.builder()
                .chapter(math11Chap5)
                .lessonNumber(2)
                .lessonName("Giới hạn của hàm số")
                .description("Giới hạn của hàm số tại một điểm")
                .build();
        lessonRepository.save(math11C5L2);

        Lesson math11C5L3 = Lesson.builder()
                .chapter(math11Chap5)
                .lessonNumber(3)
                .lessonName("Hàm số liên tục")
                .description("Khái niệm và tính chất của hàm số liên tục")
                .build();
        lessonRepository.save(math11C5L3);


        Chapter math11Chap6 = Chapter.builder()
                .subject(math)
                .gradeLevel(11)
                .chapterNumber(6)
                .chapterName("Hàm số mũ và hàm số lôgarit")
                .description("Chương VI: Hàm số mũ và hàm số lôgarit")
                .build();
        chapterRepository.save(math11Chap6);

        Lesson math11C6L1 = Lesson.builder()
                .chapter(math11Chap6)
                .lessonNumber(1)
                .lessonName("Lũy thừa với số mũ thực")
                .description("Khái niệm và các tính chất của lũy thừa")
                .build();
        lessonRepository.save(math11C6L1);

        Lesson math11C6L2 = Lesson.builder()
                .chapter(math11Chap6)
                .lessonNumber(2)
                .lessonName("Lôgarit")
                .description("Khái niệm và các tính chất của lôgarit")
                .build();
        lessonRepository.save(math11C6L2);

        Lesson math11C6L3 = Lesson.builder()
                .chapter(math11Chap6)
                .lessonNumber(3)
                .lessonName("Hàm số mũ và hàm số lôgarit")
                .description("Đồ thị và tính chất của hàm số mũ và hàm số lôgarit")
                .build();
        lessonRepository.save(math11C6L3);

        Lesson math11C6L4 = Lesson.builder()
                .chapter(math11Chap6)
                .lessonNumber(4)
                .lessonName("Phương trình, bất phương trình mũ và lôgarit")
                .description("Giải phương trình và bất phương trình mũ, lôgarit")
                .build();
        lessonRepository.save(math11C6L4);


        Chapter math11Chap7 = Chapter.builder()
                .subject(math)
                .gradeLevel(11)
                .chapterNumber(7)
                .chapterName("Quan hệ vuông góc trong không gian")
                .description("Chương VII: Quan hệ vuông góc trong không gian")
                .build();
        chapterRepository.save(math11Chap7);

        Lesson math11C7L1 = Lesson.builder()
                .chapter(math11Chap7)
                .lessonNumber(1)
                .lessonName("Hai đường thẳng vuông góc")
                .description("Điều kiện vuông góc của hai đường thẳng")
                .build();
        lessonRepository.save(math11C7L1);

        Lesson math11C7L2 = Lesson.builder()
                .chapter(math11Chap7)
                .lessonNumber(2)
                .lessonName("Đường thẳng vuông góc với mặt phẳng")
                .description("Điều kiện vuông góc giữa đường thẳng và mặt phẳng")
                .build();
        lessonRepository.save(math11C7L2);

        Lesson math11C7L3 = Lesson.builder()
                .chapter(math11Chap7)
                .lessonNumber(3)
                .lessonName("Phép chiếu vuông góc. Góc giữa đường thẳng và mặt phẳng")
                .description("Khái niệm phép chiếu vuông góc và góc trong không gian")
                .build();
        lessonRepository.save(math11C7L3);

        Lesson math11C7L4 = Lesson.builder()
                .chapter(math11Chap7)
                .lessonNumber(4)
                .lessonName("Hai mặt phẳng vuông góc")
                .description("Điều kiện vuông góc của hai mặt phẳng")
                .build();
        lessonRepository.save(math11C7L4);

        Lesson math11C7L5 = Lesson.builder()
                .chapter(math11Chap7)
                .lessonNumber(5)
                .lessonName("Khoảng cách")
                .description("Khoảng cách giữa điểm, đường thẳng và mặt phẳng")
                .build();
        lessonRepository.save(math11C7L5);

        Lesson math11C7L6 = Lesson.builder()
                .chapter(math11Chap7)
                .lessonNumber(6)
                .lessonName("Thể tích")
                .description("Công thức tính thể tích các khối hình học")
                .build();
        lessonRepository.save(math11C7L6);


        Chapter math11Chap8 = Chapter.builder()
                .subject(math)
                .gradeLevel(11)
                .chapterNumber(8)
                .chapterName("Các quy tắc tính xác suất")
                .description("Chương VIII: Các quy tắc tính xác suất")
                .build();
        chapterRepository.save(math11Chap8);

        Lesson math11C8L1 = Lesson.builder()
                .chapter(math11Chap8)
                .lessonNumber(1)
                .lessonName("Biến cố hợp, biến cố giao, biến cố độc lập")
                .description("Các loại biến cố trong xác suất")
                .build();
        lessonRepository.save(math11C8L1);

        Lesson math11C8L2 = Lesson.builder()
                .chapter(math11Chap8)
                .lessonNumber(2)
                .lessonName("Công thức cộng xác suất")
                .description("Công thức cộng xác suất của các biến cố")
                .build();
        lessonRepository.save(math11C8L2);

        Lesson math11C8L3 = Lesson.builder()
                .chapter(math11Chap8)
                .lessonNumber(3)
                .lessonName("Công thức nhân xác suất cho hai biến cố độc lập")
                .description("Công thức nhân xác suất cho các biến cố độc lập")
                .build();
        lessonRepository.save(math11C8L3);


        Chapter math11Chap9 = Chapter.builder()
                .subject(math)
                .gradeLevel(11)
                .chapterNumber(9)
                .chapterName("Đạo hàm")
                .description("Chương IX: Đạo hàm")
                .build();
        chapterRepository.save(math11Chap9);

        Lesson math11C9L1 = Lesson.builder()
                .chapter(math11Chap9)
                .lessonNumber(1)
                .lessonName("Định nghĩa và ý nghĩa của đạo hàm")
                .description("Khái niệm đạo hàm và ý nghĩa hình học")
                .build();
        lessonRepository.save(math11C9L1);

        Lesson math11C9L2 = Lesson.builder()
                .chapter(math11Chap9)
                .lessonNumber(2)
                .lessonName("Các quy tắc tính đạo hàm")
                .description("Các quy tắc và công thức tính đạo hàm")
                .build();
        lessonRepository.save(math11C9L2);

        Lesson math11C9L3 = Lesson.builder()
                .chapter(math11Chap9)
                .lessonNumber(3)
                .lessonName("Đạo hàm cấp hai")
                .description("Khái niệm và ứng dụng của đạo hàm cấp hai")
                .build();
        lessonRepository.save(math11C9L3);
        Chapter math12Chap1 = Chapter.builder()
                .subject(math)
                .gradeLevel(12)
                .chapterNumber(1)
                .chapterName("Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số")
                .description("Chương 1: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số")
                .build();
        chapterRepository.save(math12Chap1);

        Lesson math12C1L1 = Lesson.builder()
                .chapter(math12Chap1)
                .lessonNumber(1)
                .lessonName("Tính đơn điệu và cực trị của hàm số")
                .description("Xét tính đơn điệu và các điểm cực trị của hàm số")
                .build();
        lessonRepository.save(math12C1L1);

        Lesson math12C1L2 = Lesson.builder()
                .chapter(math12Chap1)
                .lessonNumber(2)
                .lessonName("Giá trị lớn nhất và giá trị nhỏ nhất của hàm số")
                .description("Tìm giá trị lớn nhất và giá trị nhỏ nhất của hàm số")
                .build();
        lessonRepository.save(math12C1L2);

        Lesson math12C1L3 = Lesson.builder()
                .chapter(math12Chap1)
                .lessonNumber(3)
                .lessonName("Đường tiệm cận của đồ thị hàm số")
                .description("Tiệm cận đứng, tiệm cận ngang và tiệm cận xiên")
                .build();
        lessonRepository.save(math12C1L3);

        Lesson math12C1L4 = Lesson.builder()
                .chapter(math12Chap1)
                .lessonNumber(4)
                .lessonName("Khảo sát sự biến thiên và vẽ đồ thị hàm số")
                .description("Các bước khảo sát và vẽ đồ thị hàm số")
                .build();
        lessonRepository.save(math12C1L4);

        Lesson math12C1L5 = Lesson.builder()
                .chapter(math12Chap1)
                .lessonNumber(5)
                .lessonName("Ứng dụng đạo hàm để giải quyết một số vấn đề liên quan đến thực tiễn")
                .description("Vận dụng đạo hàm vào các bài toán thực tiễn")
                .build();
        lessonRepository.save(math12C1L5);


        Chapter math12Chap2 = Chapter.builder()
                .subject(math)
                .gradeLevel(12)
                .chapterNumber(2)
                .chapterName("Vectơ và hệ trục tọa độ trong không gian")
                .description("Chương 2: Vectơ và hệ trục tọa độ trong không gian")
                .build();
        chapterRepository.save(math12Chap2);

        Lesson math12C2L1 = Lesson.builder()
                .chapter(math12Chap2)
                .lessonNumber(1)
                .lessonName("Vectơ trong không gian")
                .description("Khái niệm và các phép toán vectơ trong không gian")
                .build();
        lessonRepository.save(math12C2L1);

        Lesson math12C2L2 = Lesson.builder()
                .chapter(math12Chap2)
                .lessonNumber(2)
                .lessonName("Hệ trục tọa độ trong không gian")
                .description("Hệ tọa độ Oxyz và biểu diễn hình học")
                .build();
        lessonRepository.save(math12C2L2);

        Lesson math12C2L3 = Lesson.builder()
                .chapter(math12Chap2)
                .lessonNumber(3)
                .lessonName("Biểu thức tọa độ của các phép toán vectơ")
                .description("Các phép toán vectơ dưới dạng tọa độ")
                .build();
        lessonRepository.save(math12C2L3);


        Chapter math12Chap3 = Chapter.builder()
                .subject(math)
                .gradeLevel(12)
                .chapterNumber(3)
                .chapterName("Các số đặc trưng đo mức độ phân tán của mẫu số liệu ghép nhóm")
                .description("Chương 3: Các số đặc trưng đo mức độ phân tán của mẫu số liệu ghép nhóm")
                .build();
        chapterRepository.save(math12Chap3);

        Lesson math12C3L1 = Lesson.builder()
                .chapter(math12Chap3)
                .lessonNumber(1)
                .lessonName("Khoảng biến thiên và khoảng tứ phân vị")
                .description("Các số đo mức độ phân tán của mẫu số liệu")
                .build();
        lessonRepository.save(math12C3L1);

        Lesson math12C3L2 = Lesson.builder()
                .chapter(math12Chap3)
                .lessonNumber(2)
                .lessonName("Phương sai và độ lệch chuẩn")
                .description("Ý nghĩa và cách tính phương sai, độ lệch chuẩn")
                .build();
        lessonRepository.save(math12C3L2);


        Chapter math12Chap4 = Chapter.builder()
                .subject(math)
                .gradeLevel(12)
                .chapterNumber(4)
                .chapterName("Nguyên hàm và tích phân")
                .description("Chương 4: Nguyên hàm và tích phân")
                .build();
        chapterRepository.save(math12Chap4);

        Lesson math12C4L1 = Lesson.builder()
                .chapter(math12Chap4)
                .lessonNumber(1)
                .lessonName("Nguyên hàm")
                .description("Khái niệm và các tính chất của nguyên hàm")
                .build();
        lessonRepository.save(math12C4L1);

        Lesson math12C4L2 = Lesson.builder()
                .chapter(math12Chap4)
                .lessonNumber(2)
                .lessonName("Tích phân")
                .description("Định nghĩa và các phương pháp tính tích phân")
                .build();
        lessonRepository.save(math12C4L2);

        Lesson math12C4L3 = Lesson.builder()
                .chapter(math12Chap4)
                .lessonNumber(3)
                .lessonName("Ứng dụng hình học của tích phân")
                .description("Tính diện tích và thể tích bằng tích phân")
                .build();
        lessonRepository.save(math12C4L3);
        Chapter math12Chap5 = Chapter.builder()
                .subject(math)
                .gradeLevel(12)
                .chapterNumber(5)
                .chapterName("Phương pháp tọa độ trong không gian")
                .description("Chương 5: Phương pháp tọa độ trong không gian")
                .build();
        chapterRepository.save(math12Chap5);

        Lesson math12C5L1 = Lesson.builder()
                .chapter(math12Chap5)
                .lessonNumber(1)
                .lessonName("Phương trình mặt phẳng")
                .description("Các dạng phương trình mặt phẳng trong không gian")
                .build();
        lessonRepository.save(math12C5L1);

        Lesson math12C5L2 = Lesson.builder()
                .chapter(math12Chap5)
                .lessonNumber(2)
                .lessonName("Phương trình đường thẳng trong không gian")
                .description("Các dạng phương trình đường thẳng trong không gian")
                .build();
        lessonRepository.save(math12C5L2);

        Lesson math12C5L3 = Lesson.builder()
                .chapter(math12Chap5)
                .lessonNumber(3)
                .lessonName("Công thức tính góc trong không gian")
                .description("Góc giữa hai đường thẳng, đường thẳng và mặt phẳng")
                .build();
        lessonRepository.save(math12C5L3);

        Lesson math12C5L4 = Lesson.builder()
                .chapter(math12Chap5)
                .lessonNumber(4)
                .lessonName("Phương trình mặt cầu")
                .description("Phương trình mặt cầu trong không gian tọa độ")
                .build();
        lessonRepository.save(math12C5L4);


        Chapter math12Chap6 = Chapter.builder()
                .subject(math)
                .gradeLevel(12)
                .chapterNumber(6)
                .chapterName("Xác suất có điều kiện")
                .description("Chương 6: Xác suất có điều kiện")
                .build();
        chapterRepository.save(math12Chap6);

        Lesson math12C6L1 = Lesson.builder()
                .chapter(math12Chap6)
                .lessonNumber(1)
                .lessonName("Xác suất có điều kiện")
                .description("Khái niệm và công thức xác suất có điều kiện")
                .build();
        lessonRepository.save(math12C6L1);

        Lesson math12C6L2 = Lesson.builder()
                .chapter(math12Chap6)
                .lessonNumber(2)
                .lessonName("Công thức xác suất toàn phần và công thức Bayes")
                .description("Áp dụng công thức xác suất toàn phần và Bayes")
                .build();
        lessonRepository.save(math12C6L2);
        if (physics != null) {

            Chapter phy10Chap1 = Chapter.builder()
                    .subject(physics)
                    .gradeLevel(10)
                    .chapterNumber(1)
                    .chapterName("Mở đầu")
                    .description("Chương 1: Mở đầu")
                    .build();
            chapterRepository.save(phy10Chap1);

            Lesson phy10C1L1 = Lesson.builder()
                    .chapter(phy10Chap1)
                    .lessonNumber(1)
                    .lessonName("Làm quen với Vật lí")
                    .description("Giới thiệu về Vật lí và vai trò của Vật lí trong đời sống")
                    .build();
            lessonRepository.save(phy10C1L1);

            Lesson phy10C1L2 = Lesson.builder()
                    .chapter(phy10Chap1)
                    .lessonNumber(2)
                    .lessonName("Các quy tắc an toàn trong phòng thực hành Vật lí")
                    .description("Quy tắc an toàn khi học tập và thực hành Vật lí")
                    .build();
            lessonRepository.save(phy10C1L2);

            Lesson phy10C1L3 = Lesson.builder()
                    .chapter(phy10Chap1)
                    .lessonNumber(3)
                    .lessonName("Thực hành tính sai số trong phép đo. Ghi kết quả đo")
                    .description("Cách xác định sai số và trình bày kết quả đo")
                    .build();
            lessonRepository.save(phy10C1L3);


            Chapter phy10Chap2 = Chapter.builder()
                    .subject(physics)
                    .gradeLevel(10)
                    .chapterNumber(2)
                    .chapterName("Động học")
                    .description("Chương 2: Động học")
                    .build();
            chapterRepository.save(phy10Chap2);

            Lesson phy10C2L1 = Lesson.builder()
                    .chapter(phy10Chap2)
                    .lessonNumber(1)
                    .lessonName("Độ dịch chuyển và quãng đường đi được")
                    .description("Khái niệm độ dịch chuyển và quãng đường")
                    .build();
            lessonRepository.save(phy10C2L1);

            Lesson phy10C2L2 = Lesson.builder()
                    .chapter(phy10Chap2)
                    .lessonNumber(2)
                    .lessonName("Tốc độ và vận tốc")
                    .description("Khái niệm tốc độ và vận tốc")
                    .build();
            lessonRepository.save(phy10C2L2);

            Lesson phy10C2L3 = Lesson.builder()
                    .chapter(phy10Chap2)
                    .lessonNumber(3)
                    .lessonName("Đồ thị độ dịch chuyển – thời gian")
                    .description("Biểu diễn chuyển động bằng đồ thị")
                    .build();
            lessonRepository.save(phy10C2L3);

            Lesson phy10C2L4 = Lesson.builder()
                    .chapter(phy10Chap2)
                    .lessonNumber(4)
                    .lessonName("Chuyển động biến đổi. Gia tốc")
                    .description("Khái niệm chuyển động biến đổi và gia tốc")
                    .build();
            lessonRepository.save(phy10C2L4);

            Lesson phy10C2L5 = Lesson.builder()
                    .chapter(phy10Chap2)
                    .lessonNumber(5)
                    .lessonName("Chuyển động thẳng biến đổi đều")
                    .description("Các công thức của chuyển động thẳng biến đổi đều")
                    .build();
            lessonRepository.save(phy10C2L5);

            Lesson phy10C2L6 = Lesson.builder()
                    .chapter(phy10Chap2)
                    .lessonNumber(6)
                    .lessonName("Sự rơi tự do")
                    .description("Chuyển động rơi tự do và các đặc điểm")
                    .build();
            lessonRepository.save(phy10C2L6);

            Lesson phy10C2L7 = Lesson.builder()
                    .chapter(phy10Chap2)
                    .lessonNumber(7)
                    .lessonName("Chuyển động ném")
                    .description("Chuyển động ném ngang và ném xiên")
                    .build();
            lessonRepository.save(phy10C2L7);


            Chapter phy10Chap3 = Chapter.builder()
                    .subject(physics)
                    .gradeLevel(10)
                    .chapterNumber(3)
                    .chapterName("Động lực học")
                    .description("Chương 3: Động lực học")
                    .build();
            chapterRepository.save(phy10Chap3);

            Lesson phy10C3L1 = Lesson.builder()
                    .chapter(phy10Chap3)
                    .lessonNumber(1)
                    .lessonName("Tổng hợp và phân tích lực. Cân bằng lực")
                    .description("Cách tổng hợp, phân tích lực và điều kiện cân bằng")
                    .build();
            lessonRepository.save(phy10C3L1);

            Lesson phy10C3L2 = Lesson.builder()
                    .chapter(phy10Chap3)
                    .lessonNumber(2)
                    .lessonName("Định luật I Newton")
                    .description("Nội dung và ý nghĩa định luật I Newton")
                    .build();
            lessonRepository.save(phy10C3L2);

            Lesson phy10C3L3 = Lesson.builder()
                    .chapter(phy10Chap3)
                    .lessonNumber(3)
                    .lessonName("Định luật II Newton")
                    .description("Mối liên hệ giữa lực, khối lượng và gia tốc")
                    .build();
            lessonRepository.save(phy10C3L3);

            Lesson phy10C3L4 = Lesson.builder()
                    .chapter(phy10Chap3)
                    .lessonNumber(4)
                    .lessonName("Định luật III Newton")
                    .description("Lực và phản lực")
                    .build();
            lessonRepository.save(phy10C3L4);

            Lesson phy10C3L5 = Lesson.builder()
                    .chapter(phy10Chap3)
                    .lessonNumber(5)
                    .lessonName("Trọng lực và lực căng")
                    .description("Trọng lực, lực căng dây")
                    .build();
            lessonRepository.save(phy10C3L5);

            Lesson phy10C3L6 = Lesson.builder()
                    .chapter(phy10Chap3)
                    .lessonNumber(6)
                    .lessonName("Lực ma sát")
                    .description("Các loại lực ma sát và đặc điểm")
                    .build();
            lessonRepository.save(phy10C3L6);

            Lesson phy10C3L7 = Lesson.builder()
                    .chapter(phy10Chap3)
                    .lessonNumber(7)
                    .lessonName("Lực cản và lực nâng")
                    .description("Lực cản của môi trường và lực nâng")
                    .build();
            lessonRepository.save(phy10C3L7);

            Lesson phy10C3L8 = Lesson.builder()
                    .chapter(phy10Chap3)
                    .lessonNumber(8)
                    .lessonName("Một số ví dụ về cách giải các bài toán thuộc phần động lực học")
                    .description("Vận dụng các định luật Newton để giải bài toán")
                    .build();
            lessonRepository.save(phy10C3L8);

            Lesson phy10C3L9 = Lesson.builder()
                    .chapter(phy10Chap3)
                    .lessonNumber(9)
                    .lessonName("Moment lực. Cân bằng của vật rắn")
                    .description("Moment lực và điều kiện cân bằng của vật rắn")
                    .build();
            lessonRepository.save(phy10C3L9);


            Chapter phy10Chap4 = Chapter.builder()
                    .subject(physics)
                    .gradeLevel(10)
                    .chapterNumber(4)
                    .chapterName("Năng lượng, công, công suất")
                    .description("Chương 4: Năng lượng, công, công suất")
                    .build();
            chapterRepository.save(phy10Chap4);

            Lesson phy10C4L1 = Lesson.builder()
                    .chapter(phy10Chap4)
                    .lessonNumber(1)
                    .lessonName("Năng lượng. Công cơ học")
                    .description("Khái niệm năng lượng và công cơ học")
                    .build();
            lessonRepository.save(phy10C4L1);

            Lesson phy10C4L2 = Lesson.builder()
                    .chapter(phy10Chap4)
                    .lessonNumber(2)
                    .lessonName("Công suất")
                    .description("Khái niệm và công thức tính công suất")
                    .build();
            lessonRepository.save(phy10C4L2);

            Lesson phy10C4L3 = Lesson.builder()
                    .chapter(phy10Chap4)
                    .lessonNumber(3)
                    .lessonName("Động năng. Thế năng")
                    .description("Động năng và thế năng của vật")
                    .build();
            lessonRepository.save(phy10C4L3);

            Lesson phy10C4L4 = Lesson.builder()
                    .chapter(phy10Chap4)
                    .lessonNumber(4)
                    .lessonName("Cơ năng và định luật bảo toàn cơ năng")
                    .description("Cơ năng và định luật bảo toàn")
                    .build();
            lessonRepository.save(phy10C4L4);

            Lesson phy10C4L5 = Lesson.builder()
                    .chapter(phy10Chap4)
                    .lessonNumber(5)
                    .lessonName("Hiệu suất")
                    .description("Khái niệm và cách tính hiệu suất")
                    .build();
            lessonRepository.save(phy10C4L5);
            Chapter physicsChap5 = Chapter.builder()
                    .subject(physics)
                    .gradeLevel(10)
                    .chapterNumber(5)
                    .chapterName("Động lượng")
                    .description("Chương 5: Động lượng và định luật bảo toàn động lượng")
                    .build();
            chapterRepository.save(physicsChap5);
            Lesson.builder()
                    .chapter(physicsChap5)
                    .lessonNumber(1)
                    .lessonName("Động lượng")
                    .build();

            Lesson.builder()
                    .chapter(physicsChap5)
                    .lessonNumber(2)
                    .lessonName("Định luật bảo toàn động lượng")
                    .build();
            Chapter physicsChap6 = Chapter.builder()
                    .subject(physics)
                    .gradeLevel(10)
                    .chapterNumber(6)
                    .chapterName("Chuyển động tròn")
                    .description("Chương 6: Động học và động lực học của chuyển động tròn")
                    .build();
            chapterRepository.save(physicsChap6);
            Lesson.builder()
                    .chapter(physicsChap6)
                    .lessonNumber(1)
                    .lessonName("Động học của chuyển động tròn đều")
                    .build();

            Lesson.builder()
                    .chapter(physicsChap6)
                    .lessonNumber(2)
                    .lessonName("Lực hướng tâm và gia tốc hướng tâm")
                    .build();
            Chapter physicsChap7 = Chapter.builder()
                    .subject(physics)
                    .gradeLevel(10)
                    .chapterNumber(7)
                    .chapterName("Biến dạng của vật rắn. Áp suất chất lỏng")
                    .description("Chương 7: Biến dạng vật rắn và các đại lượng áp suất")
                    .build();
            chapterRepository.save(physicsChap7);
            Lesson.builder()
                    .chapter(physicsChap7)
                    .lessonNumber(1)
                    .lessonName("Biến dạng của vật rắn")
                    .build();

            Lesson.builder()
                    .chapter(physicsChap7)
                    .lessonNumber(2)
                    .lessonName("Khối lượng riêng. Áp suất chất lỏng")
                    .build();
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

        // Create multiple teachers
        Role teacherRole = roleRepository.findByName("TEACHER").orElseThrow();
        
        // Teacher 1 - Mathematics
        User teacherUser1 = User.builder()
                .username("teacher1")
                .email("teacher1@eduboost.com")
                .phone("0912345678")
                .password(passwordEncoder.encode("teacher123"))
                .fullName("Nguyen Van A")
                .isVerify(true)
                .tokenVersion(0)
                .roles(Set.of(teacherRole))
                .build();
        User savedTeacher1 = userRepository.save(teacherUser1);
        Teacher teacher1 = Teacher.builder()
                .user(savedTeacher1)
                .employeeCode("T001")
                .subject("Mathematics")
                .build();
        teacherRepository.save(teacher1);

        // Teacher 2 - Physics
        User teacherUser2 = User.builder()
                .username("teacher2")
                .email("teacher2@eduboost.com")
                .phone("0912345679")
                .password(passwordEncoder.encode("teacher123"))
                .fullName("Tran Thi B")
                .isVerify(true)
                .tokenVersion(0)
                .roles(Set.of(teacherRole))
                .build();
        User savedTeacher2 = userRepository.save(teacherUser2);
        Teacher teacher2 = Teacher.builder()
                .user(savedTeacher2)
                .employeeCode("T002")
                .subject("Physics")
                .build();
        teacherRepository.save(teacher2);

        // Teacher 3 - Chemistry
        User teacherUser3 = User.builder()
                .username("teacher3")
                .email("teacher3@eduboost.com")
                .phone("0912345680")
                .password(passwordEncoder.encode("teacher123"))
                .fullName("Le Van C")
                .isVerify(true)
                .tokenVersion(0)
                .roles(Set.of(teacherRole))
                .build();
        User savedTeacher3 = userRepository.save(teacherUser3);
        Teacher teacher3 = Teacher.builder()
                .user(savedTeacher3)
                .employeeCode("T003")
                .subject("Chemistry")
                .build();
        teacherRepository.save(teacher3);

        // Teacher 4 - English
        User teacherUser4 = User.builder()
                .username("teacher4")
                .email("teacher4@eduboost.com")
                .phone("0912345681")
                .password(passwordEncoder.encode("teacher123"))
                .fullName("Pham Thi D")
                .isVerify(true)
                .tokenVersion(0)
                .roles(Set.of(teacherRole))
                .build();
        User savedTeacher4 = userRepository.save(teacherUser4);
        Teacher teacher4 = Teacher.builder()
                .user(savedTeacher4)
                .employeeCode("T004")
                .subject("English")
                .build();
        teacherRepository.save(teacher4);

        // Teacher 5 - Literature
        User teacherUser5 = User.builder()
                .username("teacher5")
                .email("teacher5@eduboost.com")
                .phone("0912345682")
                .password(passwordEncoder.encode("teacher123"))
                .fullName("Hoang Van E")
                .isVerify(true)
                .tokenVersion(0)
                .roles(Set.of(teacherRole))
                .build();
        User savedTeacher5 = userRepository.save(teacherUser5);
        Teacher teacher5 = Teacher.builder()
                .user(savedTeacher5)
                .employeeCode("T005")
                .subject("Literature")
                .build();
        teacherRepository.save(teacher5);

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
        // Get all teachers
        List<Teacher> teachers = teacherRepository.findAll();
        Teacher teacher1 = teachers.size() > 0 ? teachers.get(0) : null;
        Teacher teacher2 = teachers.size() > 1 ? teachers.get(1) : teacher1;
        Teacher teacher3 = teachers.size() > 2 ? teachers.get(2) : teacher1;
        Teacher teacher4 = teachers.size() > 3 ? teachers.get(3) : teacher1;
        Teacher teacher5 = teachers.size() > 4 ? teachers.get(4) : teacher1;
        
        Role studentRole = roleRepository.findByName("STUDENT").orElseThrow();

        // Create grade levels 6-12
        GradeLevel gradeLevel6 = createGradeLevel("6");
        GradeLevel gradeLevel7 = createGradeLevel("7");
        GradeLevel gradeLevel8 = createGradeLevel("8");
        GradeLevel gradeLevel9 = createGradeLevel("9");
        GradeLevel gradeLevel10 = createGradeLevel("10");
        GradeLevel gradeLevel11 = createGradeLevel("11");
        GradeLevel gradeLevel12 = createGradeLevel("12");

        // Create classes for each grade level with different teachers
        // Grade 6
        SchoolClass class6A1 = createSchoolClass("6A1", "6A1-2024", gradeLevel6, teacher1, "2024-2025", "Class 6A1 - General");
        SchoolClass class6A2 = createSchoolClass("6A2", "6A2-2024", gradeLevel6, teacher2, "2024-2025", "Class 6A2 - General");
        SchoolClass class6B1 = createSchoolClass("6B1", "6B1-2024", gradeLevel6, teacher3, "2024-2025", "Class 6B1 - Advanced");

        // Grade 7
        SchoolClass class7A1 = createSchoolClass("7A1", "7A1-2024", gradeLevel7, teacher2, "2024-2025", "Class 7A1 - General");
        SchoolClass class7A2 = createSchoolClass("7A2", "7A2-2024", gradeLevel7, teacher4, "2024-2025", "Class 7A2 - General");
        SchoolClass class7B1 = createSchoolClass("7B1", "7B1-2024", gradeLevel7, teacher5, "2024-2025", "Class 7B1 - Advanced");

        // Grade 8
        SchoolClass class8A1 = createSchoolClass("8A1", "8A1-2024", gradeLevel8, teacher3, "2024-2025", "Class 8A1 - General");
        SchoolClass class8A2 = createSchoolClass("8A2", "8A2-2024", gradeLevel8, teacher1, "2024-2025", "Class 8A2 - General");
        SchoolClass class8B1 = createSchoolClass("8B1", "8B1-2024", gradeLevel8, teacher4, "2024-2025", "Class 8B1 - Advanced");

        // Grade 9
        SchoolClass class9A1 = createSchoolClass("9A1", "9A1-2024", gradeLevel9, teacher4, "2024-2025", "Class 9A1 - General");
        SchoolClass class9A2 = createSchoolClass("9A2", "9A2-2024", gradeLevel9, teacher5, "2024-2025", "Class 9A2 - General");
        SchoolClass class9B1 = createSchoolClass("9B1", "9B1-2024", gradeLevel9, teacher2, "2024-2025", "Class 9B1 - Advanced");

        // Grade 10
        SchoolClass class10A1 = createSchoolClass("10A1", "10A1-2024", gradeLevel10, teacher1, "2024-2025", "Class 10A1 - Mathematics");
        SchoolClass class10A2 = createSchoolClass("10A2", "10A2-2024", gradeLevel10, teacher2, "2024-2025", "Class 10A2 - Mathematics");
        SchoolClass class10B1 = createSchoolClass("10B1", "10B1-2024", gradeLevel10, teacher3, "2024-2025", "Class 10B1 - Science");

        // Grade 11
        SchoolClass class11A1 = createSchoolClass("11A1", "11A1-2024", gradeLevel11, teacher2, "2024-2025", "Class 11A1 - Mathematics");
        SchoolClass class11A2 = createSchoolClass("11A2", "11A2-2024", gradeLevel11, teacher4, "2024-2025", "Class 11A2 - Mathematics");
        SchoolClass class11B1 = createSchoolClass("11B1", "11B1-2024", gradeLevel11, teacher5, "2024-2025", "Class 11B1 - Science");

        // Grade 12
        SchoolClass class12A1 = createSchoolClass("12A1", "12A1-2024", gradeLevel12, teacher3, "2024-2025", "Class 12A1 - Mathematics");
        SchoolClass class12A2 = createSchoolClass("12A2", "12A2-2024", gradeLevel12, teacher4, "2024-2025", "Class 12A2 - Mathematics");
        SchoolClass class12B1 = createSchoolClass("12B1", "12B1-2024", gradeLevel12, teacher5, "2024-2025", "Class 12B1 - Science");

        // Create students for each class (3-5 students per class for testing)
        int studentCounter = 1;
        
        // Grade 6 students
        studentCounter = createStudentsForClass(class6A1, studentRole, studentCounter, 2012);
        studentCounter = createStudentsForClass(class6A2, studentRole, studentCounter, 2012);
        studentCounter = createStudentsForClass(class6B1, studentRole, studentCounter, 2012);

        // Grade 7 students
        studentCounter = createStudentsForClass(class7A1, studentRole, studentCounter, 2011);
        studentCounter = createStudentsForClass(class7A2, studentRole, studentCounter, 2011);
        studentCounter = createStudentsForClass(class7B1, studentRole, studentCounter, 2011);

        // Grade 8 students
        studentCounter = createStudentsForClass(class8A1, studentRole, studentCounter, 2010);
        studentCounter = createStudentsForClass(class8A2, studentRole, studentCounter, 2010);
        studentCounter = createStudentsForClass(class8B1, studentRole, studentCounter, 2010);

        // Grade 9 students
        studentCounter = createStudentsForClass(class9A1, studentRole, studentCounter, 2009);
        studentCounter = createStudentsForClass(class9A2, studentRole, studentCounter, 2009);
        studentCounter = createStudentsForClass(class9B1, studentRole, studentCounter, 2009);

        // Grade 10 students
        studentCounter = createStudentsForClass(class10A1, studentRole, studentCounter, 2008);
        studentCounter = createStudentsForClass(class10A2, studentRole, studentCounter, 2008);
        studentCounter = createStudentsForClass(class10B1, studentRole, studentCounter, 2008);

        // Grade 11 students
        studentCounter = createStudentsForClass(class11A1, studentRole, studentCounter, 2007);
        studentCounter = createStudentsForClass(class11A2, studentRole, studentCounter, 2007);
        studentCounter = createStudentsForClass(class11B1, studentRole, studentCounter, 2007);

        // Grade 12 students
        studentCounter = createStudentsForClass(class12A1, studentRole, studentCounter, 2006);
        studentCounter = createStudentsForClass(class12A2, studentRole, studentCounter, 2006);
        studentCounter = createStudentsForClass(class12B1, studentRole, studentCounter, 2006);
    }

    private GradeLevel createGradeLevel(String gradeName) {
        GradeLevel gradeLevel = GradeLevel.builder()
                .gradeName(gradeName)
                .build();
        return gradeLevelRepository.save(gradeLevel);
    }

    private SchoolClass createSchoolClass(String className, String classCode, GradeLevel gradeLevel, Teacher teacher, String schoolYear, String description) {
        SchoolClass schoolClass = SchoolClass.builder()
                .className(className)
                .classCode(classCode)
                .gradeLevel(gradeLevel)
                .teacher(teacher)
                .schoolYear(schoolYear)
                .description(description)
                .status("ACTIVE")
                .build();
        return classRepository.save(schoolClass);
    }

    private int createStudentsForClass(SchoolClass schoolClass, Role studentRole, int startCounter, int birthYear) {
        // Create 3-5 students per class for testing
        int numStudents = 3 + (startCounter % 3); // 3-5 students per class
        
        for (int i = 0; i < numStudents; i++) {
            int studentNum = startCounter + i;
            String username = "student" + studentNum;
            String email = "student" + studentNum + "@eduboost.com";
            String phone = "0945678" + String.format("%04d", studentNum);
            String studentCode = "S" + String.format("%04d", studentNum);
            
            // Alternate between male and female names
            String fullName;
            Gender gender;
            if (i % 2 == 0) {
                // Male names
                String[] maleNames = {"Nguyen Van An", "Tran Van Binh", "Le Van Cuong", "Pham Van Dung", "Hoang Van Em"};
                fullName = maleNames[i % maleNames.length] + " " + studentNum;
                gender = Gender.MALE;
            } else {
                // Female names
                String[] femaleNames = {"Tran Thi Mai", "Le Thi Lan", "Pham Thi Hoa", "Nguyen Thi Kim", "Hoang Thi Trang"};
                fullName = femaleNames[i % femaleNames.length] + " " + studentNum;
                gender = Gender.FEMALE;
            }
            
            // Random birth date within the appropriate year
            int month = 1 + (studentNum % 12);
            int day = 1 + (studentNum % 28);
            LocalDate dateOfBirth = LocalDate.of(birthYear, month, day);
            
            createStudent(username, email, phone, fullName, studentCode, schoolClass, studentRole, dateOfBirth, gender);
        }
        
        return startCounter + numStudents;
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

