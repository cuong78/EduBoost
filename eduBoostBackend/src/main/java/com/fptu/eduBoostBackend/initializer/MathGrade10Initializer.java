package com.fptu.eduBoostBackend.initializer;

import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.repositories.*;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MathGrade10Initializer {

    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;

    public void init() {
        Subject math = subjectRepository.findBySubjectCode("TOAN").orElse(null);
        if (math == null) return;

        // Chương 1: Mệnh đề và tập hợp
        Chapter chap1 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(10).chapterNumber(1)
                .chapterName("Mệnh đề và tập hợp").description("Chương 1: Mệnh đề và tập hợp").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(1)
                .lessonName("Mệnh đề").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(2)
                .lessonName("Tập hợp và các phép toán trên tập hợp").build());

        // Chương 2: Bất phương trình và hệ bất phương trình bậc nhất hai ẩn
        Chapter chap2 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(10).chapterNumber(2)
                .chapterName("Bất phương trình và hệ bất phương trình bậc nhất hai ẩn")
                .description("Chương 2: Bất phương trình và hệ bất phương trình bậc nhất hai ẩn").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(3)
                .lessonName("Bất phương trình bậc nhất hai ẩn").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(4)
                .lessonName("Hệ bất phương trình bậc nhất hai ẩn").build());

        // Chương 3: Hệ thức lượng trong tam giác
        Chapter chap3 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(10).chapterNumber(3)
                .chapterName("Hệ thức lượng trong tam giác").description("Chương 3: Hệ thức lượng trong tam giác").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(5)
                .lessonName("Giá trị lượng giác của một góc từ 0 độ đến 180 độ").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(6)
                .lessonName("Hệ thức lượng trong tam giác").build());

        // Chương 4: Vectơ
        Chapter chap4 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(10).chapterNumber(4)
                .chapterName("Vectơ").description("Chương 4: Vectơ").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(7)
                .lessonName("Các khái niệm mở đầu").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(8)
                .lessonName("Tổng và hiệu của hai vectơ").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(9)
                .lessonName("Tích của một vectơ với một số").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(10)
                .lessonName("Vectơ trong mặt phẳng tọa độ").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(11)
                .lessonName("Tích vô hướng của hai vectơ").build());

        // Chương 5: Các số đặc trưng của mẫu số liệu không ghép nhóm
        Chapter chap5 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(10).chapterNumber(5)
                .chapterName("Các số đặc trưng của mẫu số liệu không ghép nhóm")
                .description("Chương 5: Các số đặc trưng của mẫu số liệu không ghép nhóm").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(12)
                .lessonName("Số gần đúng và sai số").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(13)
                .lessonName("Các số đặc trưng đo xu thế trung tâm").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(14)
                .lessonName("Các số đặc trưng đo độ phân tán").build());

        // Chương 6: Hàm số, đồ thị và ứng dụng
        Chapter chap6 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(10).chapterNumber(6)
                .chapterName("Hàm số, đồ thị và ứng dụng").description("Chương 6: Hàm số, đồ thị và ứng dụng").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(15)
                .lessonName("Hàm số").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(16)
                .lessonName("Hàm số bậc hai").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(17)
                .lessonName("Dấu của tam thức bậc hai").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(18)
                .lessonName("Phương trình quy về phương trình bậc hai").build());

        // Chương 7: Phương pháp tọa độ trong mặt phẳng
        Chapter chap7 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(10).chapterNumber(7)
                .chapterName("Phương pháp tọa độ trong mặt phẳng").description("Chương 7: Phương pháp tọa độ trong mặt phẳng").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(19)
                .lessonName("Phương trình đường thẳng").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(20)
                .lessonName("Vị trí tương đối giữa hai đường thẳng. Góc và khoảng cách").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(21)
                .lessonName("Đường tròn trong mặt phẳng tọa độ").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(22)
                .lessonName("Ba đường conic").build());

        // Chương 8: Đại số tổ hợp
        Chapter chap8 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(10).chapterNumber(8)
                .chapterName("Đại số tổ hợp").description("Chương 8: Đại số tổ hợp").build());
        lessonRepository.save(Lesson.builder().chapter(chap8).lessonNumber(23)
                .lessonName("Quy tắc đếm").build());
        lessonRepository.save(Lesson.builder().chapter(chap8).lessonNumber(24)
                .lessonName("Hoán vị, chỉnh hợp và tổ hợp").build());
        lessonRepository.save(Lesson.builder().chapter(chap8).lessonNumber(25)
                .lessonName("Nhị thức Newton").build());

        // Chương 9: Tính xác suất theo định nghĩa cổ điển
        Chapter chap9 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(10).chapterNumber(9)
                .chapterName("Tính xác suất theo định nghĩa cổ điển")
                .description("Chương 9: Tính xác suất theo định nghĩa cổ điển").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(26)
                .lessonName("Biến cố và định nghĩa cổ điển của xác suất").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(27)
                .lessonName("Thực hành tính xác suất theo định nghĩa cổ điển").build());
    }
}
