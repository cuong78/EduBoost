package com.fptu.eduBoostBackend.initializer;

import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.repositories.*;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MathGrade11Initializer {

    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;

    public void init() {
        Subject math = subjectRepository.findBySubjectCode("TOAN").orElse(null);
        if (math == null) return;

        // Chương 1: Hàm số lượng giác và phương trình lượng giác
        Chapter chap1 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(11).chapterNumber(1)
                .chapterName("Hàm số lượng giác và phương trình lượng giác")
                .description("Chương I: Hàm số lượng giác và phương trình lượng giác").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(1)
                .lessonName("Giá trị lượng giác của góc lượng giác").description("Giá trị lượng giác của góc lượng giác").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(2)
                .lessonName("Công thức lượng giác").description("Các công thức lượng giác cơ bản").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(3)
                .lessonName("Hàm số lượng giác").description("Khái niệm và đồ thị các hàm số lượng giác").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(4)
                .lessonName("Phương trình lượng giác cơ bản").description("Các phương trình lượng giác cơ bản").build());

        // Chương 2: Dãy số, cấp số cộng và cấp số nhân
        Chapter chap2 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(11).chapterNumber(2)
                .chapterName("Dãy số, cấp số cộng và cấp số nhân")
                .description("Chương II: Dãy số, cấp số cộng và cấp số nhân").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(1)
                .lessonName("Dãy số").description("Khái niệm dãy số và cách cho dãy số").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(2)
                .lessonName("Cấp số cộng").description("Định nghĩa và các tính chất của cấp số cộng").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(3)
                .lessonName("Cấp số nhân").description("Định nghĩa và các tính chất của cấp số nhân").build());

        // Chương 3: Các số đặc trưng đo xu thế trung tâm của mẫu số liệu ghép nhóm
        Chapter chap3 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(11).chapterNumber(3)
                .chapterName("Các số đặc trưng đo xu thế trung tâm của mẫu số liệu ghép nhóm")
                .description("Chương III: Các số đặc trưng đo xu thế trung tâm của mẫu số liệu ghép nhóm").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(1)
                .lessonName("Mẫu số liệu ghép nhóm").description("Khái niệm mẫu số liệu ghép nhóm").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(2)
                .lessonName("Các số đặc trưng đo xu thế trung tâm")
                .description("Số trung bình, trung vị và mốt của mẫu số liệu ghép nhóm").build());

        // Chương 4: Quan hệ song song trong không gian
        Chapter chap4 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(11).chapterNumber(4)
                .chapterName("Quan hệ song song trong không gian")
                .description("Chương IV: Quan hệ song song trong không gian").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(1)
                .lessonName("Đường thẳng và mặt phẳng trong không gian")
                .description("Vị trí tương đối của đường thẳng và mặt phẳng").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(2)
                .lessonName("Hai đường thẳng song song")
                .description("Điều kiện và tính chất của hai đường thẳng song song").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(3)
                .lessonName("Đường thẳng và mặt phẳng song song")
                .description("Điều kiện song song giữa đường thẳng và mặt phẳng").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(4)
                .lessonName("Hai mặt phẳng song song")
                .description("Điều kiện và tính chất của hai mặt phẳng song song").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(5)
                .lessonName("Phép chiếu song song").description("Khái niệm và ứng dụng của phép chiếu song song").build());

        // Chương 5: Giới hạn. Hàm số liên tục
        Chapter chap5 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(11).chapterNumber(5)
                .chapterName("Giới hạn. Hàm số liên tục").description("Chương V: Giới hạn. Hàm số liên tục").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(1)
                .lessonName("Giới hạn của dãy số").description("Khái niệm và các dạng giới hạn của dãy số").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(2)
                .lessonName("Giới hạn của hàm số").description("Giới hạn của hàm số tại một điểm").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(3)
                .lessonName("Hàm số liên tục").description("Khái niệm và tính chất của hàm số liên tục").build());

        // Chương 6: Hàm số mũ và hàm số lôgarit
        Chapter chap6 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(11).chapterNumber(6)
                .chapterName("Hàm số mũ và hàm số lôgarit").description("Chương VI: Hàm số mũ và hàm số lôgarit").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(1)
                .lessonName("Lũy thừa với số mũ thực").description("Khái niệm và các tính chất của lũy thừa").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(2)
                .lessonName("Lôgarit").description("Khái niệm và các tính chất của lôgarit").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(3)
                .lessonName("Hàm số mũ và hàm số lôgarit")
                .description("Đồ thị và tính chất của hàm số mũ và hàm số lôgarit").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(4)
                .lessonName("Phương trình, bất phương trình mũ và lôgarit")
                .description("Giải phương trình và bất phương trình mũ, lôgarit").build());

        // Chương 7: Quan hệ vuông góc trong không gian
        Chapter chap7 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(11).chapterNumber(7)
                .chapterName("Quan hệ vuông góc trong không gian")
                .description("Chương VII: Quan hệ vuông góc trong không gian").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(1)
                .lessonName("Hai đường thẳng vuông góc").description("Điều kiện vuông góc của hai đường thẳng").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(2)
                .lessonName("Đường thẳng vuông góc với mặt phẳng")
                .description("Điều kiện vuông góc giữa đường thẳng và mặt phẳng").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(3)
                .lessonName("Phép chiếu vuông góc. Góc giữa đường thẳng và mặt phẳng")
                .description("Khái niệm phép chiếu vuông góc và góc trong không gian").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(4)
                .lessonName("Hai mặt phẳng vuông góc").description("Điều kiện vuông góc của hai mặt phẳng").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(5)
                .lessonName("Khoảng cách").description("Khoảng cách giữa điểm, đường thẳng và mặt phẳng").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(6)
                .lessonName("Thể tích").description("Công thức tính thể tích các khối hình học").build());

        // Chương 8: Các quy tắc tính xác suất
        Chapter chap8 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(11).chapterNumber(8)
                .chapterName("Các quy tắc tính xác suất").description("Chương VIII: Các quy tắc tính xác suất").build());
        lessonRepository.save(Lesson.builder().chapter(chap8).lessonNumber(1)
                .lessonName("Biến cố hợp, biến cố giao, biến cố độc lập")
                .description("Các loại biến cố trong xác suất").build());
        lessonRepository.save(Lesson.builder().chapter(chap8).lessonNumber(2)
                .lessonName("Công thức cộng xác suất").description("Công thức cộng xác suất của các biến cố").build());
        lessonRepository.save(Lesson.builder().chapter(chap8).lessonNumber(3)
                .lessonName("Công thức nhân xác suất cho hai biến cố độc lập")
                .description("Công thức nhân xác suất cho các biến cố độc lập").build());

        // Chương 9: Đạo hàm
        Chapter chap9 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(11).chapterNumber(9)
                .chapterName("Đạo hàm").description("Chương IX: Đạo hàm").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(1)
                .lessonName("Định nghĩa và ý nghĩa của đạo hàm").description("Khái niệm đạo hàm và ý nghĩa hình học").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(2)
                .lessonName("Các quy tắc tính đạo hàm").description("Các quy tắc và công thức tính đạo hàm").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(3)
                .lessonName("Đạo hàm cấp hai").description("Khái niệm và ứng dụng của đạo hàm cấp hai").build());
    }
}
