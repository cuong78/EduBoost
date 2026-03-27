package com.fptu.eduBoostBackend.initializer;

import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.repositories.*;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MathGrade12Initializer {

    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;

    public void init() {
        Subject math = subjectRepository.findBySubjectCode("TOAN").orElse(null);
        if (math == null) return;

        // Chương 1: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số
        Chapter chap1 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(12).chapterNumber(1)
                .chapterName("Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số")
                .description("Chương 1: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(1)
                .lessonName("Tính đơn điệu và cực trị của hàm số")
                .description("Xét tính đơn điệu và các điểm cực trị của hàm số").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(2)
                .lessonName("Giá trị lớn nhất và giá trị nhỏ nhất của hàm số")
                .description("Tìm giá trị lớn nhất và giá trị nhỏ nhất của hàm số").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(3)
                .lessonName("Đường tiệm cận của đồ thị hàm số")
                .description("Tiệm cận đứng, tiệm cận ngang và tiệm cận xiên").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(4)
                .lessonName("Khảo sát sự biến thiên và vẽ đồ thị hàm số")
                .description("Các bước khảo sát và vẽ đồ thị hàm số").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(5)
                .lessonName("Ứng dụng đạo hàm để giải quyết một số vấn đề liên quan đến thực tiễn")
                .description("Vận dụng đạo hàm vào các bài toán thực tiễn").build());

        // Chương 2: Vectơ và hệ trục tọa độ trong không gian
        Chapter chap2 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(12).chapterNumber(2)
                .chapterName("Vectơ và hệ trục tọa độ trong không gian")
                .description("Chương 2: Vectơ và hệ trục tọa độ trong không gian").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(6)
                .lessonName("Vectơ trong không gian").description("Khái niệm và các phép toán vectơ trong không gian").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(7)
                .lessonName("Hệ trục tọa độ trong không gian").description("Hệ tọa độ Oxyz và biểu diễn hình học").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(8)
                .lessonName("Biểu thức tọa độ của các phép toán vectơ")
                .description("Các phép toán vectơ dưới dạng tọa độ").build());

        // Chương 3: Các số đặc trưng đo mức độ phân tán của mẫu số liệu ghép nhóm
        Chapter chap3 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(12).chapterNumber(3)
                .chapterName("Các số đặc trưng đo mức độ phân tán của mẫu số liệu ghép nhóm")
                .description("Chương 3: Các số đặc trưng đo mức độ phân tán của mẫu số liệu ghép nhóm").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(9)
                .lessonName("Khoảng biến thiên và khoảng tứ phân vị")
                .description("Các số đo mức độ phân tán của mẫu số liệu").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(10)
                .lessonName("Phương sai và độ lệch chuẩn").description("Ý nghĩa và cách tính phương sai, độ lệch chuẩn").build());

        // Chương 4: Nguyên hàm và tích phân
        Chapter chap4 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(12).chapterNumber(4)
                .chapterName("Nguyên hàm và tích phân").description("Chương 4: Nguyên hàm và tích phân").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(11)
                .lessonName("Nguyên hàm").description("Khái niệm và các tính chất của nguyên hàm").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(12)
                .lessonName("Tích phân").description("Định nghĩa và các phương pháp tính tích phân").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(13)
                .lessonName("Ứng dụng hình học của tích phân").description("Tính diện tích và thể tích bằng tích phân").build());

        // Chương 5: Phương pháp tọa độ trong không gian
        Chapter chap5 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(12).chapterNumber(5)
                .chapterName("Phương pháp tọa độ trong không gian")
                .description("Chương 5: Phương pháp tọa độ trong không gian").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(14)
                .lessonName("Phương trình mặt phẳng").description("Các dạng phương trình mặt phẳng trong không gian").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(15)
                .lessonName("Phương trình đường thẳng trong không gian")
                .description("Các dạng phương trình đường thẳng trong không gian").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(16)
                .lessonName("Công thức tính góc trong không gian")
                .description("Góc giữa hai đường thẳng, đường thẳng và mặt phẳng").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(17)
                .lessonName("Phương trình mặt cầu").description("Phương trình mặt cầu trong không gian tọa độ").build());

        // Chương 6: Xác suất có điều kiện
        Chapter chap6 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(12).chapterNumber(6)
                .chapterName("Xác suất có điều kiện").description("Chương 6: Xác suất có điều kiện").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(18)
                .lessonName("Xác suất có điều kiện").description("Khái niệm và công thức xác suất có điều kiện").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(19)
                .lessonName("Công thức xác suất toàn phần và công thức Bayes")
                .description("Áp dụng công thức xác suất toàn phần và Bayes").build());
    }
}
