package com.fptu.eduBoostBackend.initializer;

import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.entities.enums.LessonResourceType;
import com.fptu.eduBoostBackend.repositories.*;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MathGrade10Initializer {

    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;
    private final LessonResourceRepository lessonResourceRepository;

    public void init() {
        Subject math = subjectRepository.findBySubjectCode("TOAN").orElse(null);
        if (math == null) return;

        // Chương 1: Mệnh đề - Tập hợp
        Chapter chap1 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(10).chapterNumber(1)
                .chapterName("Mệnh đề - Tập hợp").description("Chương 1: Mệnh đề và Tập hợp").build());
        Lesson c1l1 = lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(1)
                .lessonName("Mệnh đề").description("Khái niệm mệnh đề, mệnh đề phủ định, mệnh đề kéo theo").build());
        lessonResourceRepository.save(LessonResource.builder().lesson(c1l1).resourceName("Bài giảng Mệnh đề")
                .resourceType(LessonResourceType.PDF).fileUrl("https://example.com/menh-de.pdf")
                .extractedContent("Mệnh đề là một câu khẳng định đúng hoặc sai...").build());
        Lesson c1l2 = lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(2)
                .lessonName("Tập hợp và các phép toán trên tập hợp")
                .description("Khái niệm tập hợp, tập con, hợp, giao, hiệu của hai tập hợp").build());
        lessonResourceRepository.save(LessonResource.builder().lesson(c1l2).resourceName("Lý thuyết Tập hợp")
                .resourceType(LessonResourceType.DOCX).fileUrl("https://example.com/tap-hop.docx")
                .extractedContent("Tập hợp là một khái niệm cơ bản trong toán học...").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(3)
                .lessonName("Các phép toán trên tập hợp").description("Hợp, giao, hiệu, phần bù của tập hợp").build());

        // Chương 2: Bất phương trình và hệ bất phương trình bậc nhất hai ẩn
        Chapter chap2 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(10).chapterNumber(2)
                .chapterName("Bất phương trình và hệ bất phương trình bậc nhất hai ẩn")
                .description("Chương 2: Bất phương trình và hệ bất phương trình bậc nhất hai ẩn").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(1)
                .lessonName("Bất phương trình bậc nhất hai ẩn")
                .description("Khái niệm bất phương trình bậc nhất hai ẩn và cách biểu diễn tập nghiệm").build());
        Lesson c2l2 = lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(2)
                .lessonName("Hệ bất phương trình bậc nhất hai ẩn")
                .description("Khái niệm hệ bất phương trình bậc nhất hai ẩn và cách giải").build());
        lessonResourceRepository.save(LessonResource.builder().lesson(c2l2)
                .resourceName("Video bài giảng Hệ bất phương trình bậc nhất hai ẩn")
                .resourceType(LessonResourceType.URL).fileUrl("https://youtube.com/watch?v=example")
                .extractedContent("Khái niệm hệ bất phương trình bậc nhất hai ẩn và cách giải").build());

        // Chương 3: Hệ thức lượng trong tam giác
        Chapter chap3 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(10).chapterNumber(3)
                .chapterName("Hệ thức lượng trong tam giác").description("Chương 3: Hệ thức lượng trong tam giác").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(1)
                .lessonName("Giá trị lượng giác của một góc từ 0 độ đến 180 độ")
                .description("Giá trị lượng giác của một góc trong khoảng từ 0 đến 180 độ").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(2)
                .lessonName("Hệ thức lượng trong tam giác").description("Các hệ thức lượng cơ bản trong tam giác").build());

        // Chương 4: Vectơ
        Chapter chap4 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(10).chapterNumber(4)
                .chapterName("Vectơ").description("Chương 4: Vectơ").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(1)
                .lessonName("Các khái niệm mở đầu").description("Khái niệm vectơ, giá của vectơ, độ dài vectơ").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(2)
                .lessonName("Tổng và hiệu của hai vectơ").description("Phép cộng và phép trừ hai vectơ").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(3)
                .lessonName("Tích của một vectơ với một số").description("Phép nhân vectơ với một số thực").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(4)
                .lessonName("Vectơ trong mặt phẳng tọa độ").description("Biểu diễn vectơ trong hệ trục tọa độ").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(5)
                .lessonName("Tích vô hướng của hai vectơ").description("Khái niệm và ứng dụng của tích vô hướng").build());

        // Chương 5: Các số đặc trưng của mẫu số liệu không ghép nhóm
        Chapter chap5 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(10).chapterNumber(5)
                .chapterName("Các số đặc trưng của mẫu số liệu không ghép nhóm")
                .description("Chương 5: Các số đặc trưng của mẫu số liệu không ghép nhóm").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(1)
                .lessonName("Số gần đúng và sai số")
                .description("Khái niệm số gần đúng, sai số tuyệt đối và sai số tương đối").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(2)
                .lessonName("Các số đặc trưng đo xu thế trung tâm").description("Số trung bình cộng, trung vị, mốt").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(3)
                .lessonName("Các số đặc trưng đo độ phân tán")
                .description("Khoảng biến thiên, phương sai và độ lệch chuẩn").build());

        // Chương 6: Hàm số, đồ thị và ứng dụng
        Chapter chap6 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(10).chapterNumber(6)
                .chapterName("Hàm số, đồ thị và ứng dụng").description("Chương 6: Hàm số, đồ thị và ứng dụng").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(1)
                .lessonName("Hàm số").description("Khái niệm hàm số và cách biểu diễn hàm số").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(2)
                .lessonName("Hàm số bậc hai").description("Hàm số bậc hai và đồ thị parabol").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(3)
                .lessonName("Dấu của tam thức bậc hai").description("Xét dấu tam thức bậc hai và ứng dụng").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(4)
                .lessonName("Phương trình quy về phương trình bậc hai")
                .description("Các phương trình có thể đưa về dạng bậc hai").build());

        // Chương 7: Phương pháp tọa độ trong mặt phẳng
        Chapter chap7 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(10).chapterNumber(7)
                .chapterName("Phương pháp tọa độ trong mặt phẳng").description("Chương 7: Phương pháp tọa độ trong mặt phẳng").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(1)
                .lessonName("Phương trình đường thẳng").description("Các dạng phương trình của đường thẳng").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(2)
                .lessonName("Vị trí tương đối giữa hai đường thẳng. Góc và khoảng cách")
                .description("Xét vị trí, góc và khoảng cách giữa hai đường thẳng").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(3)
                .lessonName("Đường tròn trong mặt phẳng tọa độ")
                .description("Phương trình đường tròn và các bài toán liên quan").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(4)
                .lessonName("Ba đường conic").description("Elip, hypebol và parabol").build());

        // Chương 8: Đại số tổ hợp
        Chapter chap8 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(10).chapterNumber(8)
                .chapterName("Đại số tổ hợp").description("Chương 8: Đại số tổ hợp").build());
        lessonRepository.save(Lesson.builder().chapter(chap8).lessonNumber(1)
                .lessonName("Quy tắc đếm").description("Quy tắc cộng và quy tắc nhân").build());
        lessonRepository.save(Lesson.builder().chapter(chap8).lessonNumber(2)
                .lessonName("Hoán vị, chỉnh hợp và tổ hợp").description("Các khái niệm hoán vị, chỉnh hợp và tổ hợp").build());
        lessonRepository.save(Lesson.builder().chapter(chap8).lessonNumber(3)
                .lessonName("Nhị thức Newton").description("Khai triển nhị thức Newton").build());

        // Chương 9: Tính xác suất theo định nghĩa cổ điển
        Chapter chap9 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(10).chapterNumber(9)
                .chapterName("Tính xác suất theo định nghĩa cổ điển")
                .description("Chương 9: Tính xác suất theo định nghĩa cổ điển").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(1)
                .lessonName("Biến cố và định nghĩa cổ điển của xác suất")
                .description("Khái niệm biến cố và xác suất theo định nghĩa cổ điển").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(2)
                .lessonName("Thực hành tính xác suất theo định nghĩa cổ điển")
                .description("Áp dụng công thức xác suất vào bài toán thực tế").build());
    }
}
