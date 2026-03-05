package com.fptu.eduBoostBackend.initializer;

import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.repositories.*;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MathGrade8Initializer {

    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;

    public void init() {
        Subject math = subjectRepository.findBySubjectCode("TOAN").orElse(null);
        if (math == null) return;

        // Chương 1: Đa thức
        Chapter chap1 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(8).chapterNumber(1)
                .chapterName("Đa thức").description("Chương 1: Đa thức").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(1).lessonName("Đơn thức").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(2).lessonName("Đa thức").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(3).lessonName("Phép cộng và phép trừ đa thức").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(4).lessonName("Phép nhân đa thức").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(5).lessonName("Phép chia đa thức cho đơn thức").build());

        // Chương 2: Hằng đẳng thức đáng nhớ và ứng dụng
        Chapter chap2 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(8).chapterNumber(2)
                .chapterName("Hằng đẳng thức đáng nhớ và ứng dụng").description("Chương 2: Hằng đẳng thức đáng nhớ và ứng dụng").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(6).lessonName("Hiệu hai bình phương. Bình phương của một tổng hay một hiệu").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(7).lessonName("Lập phương của một tổng hay một hiệu").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(8).lessonName("Tổng và hiệu hai lập phương").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(9).lessonName("Phân tích đa thức thành nhân tử").build());

        // Chương 3: Tứ giác
        Chapter chap3 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(8).chapterNumber(3)
                .chapterName("Tứ giác").description("Chương 3: Tứ giác").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(10).lessonName("Tứ giác").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(11).lessonName("Hình thang cân").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(12).lessonName("Hình bình hành").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(13).lessonName("Hình chữ nhật").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(14).lessonName("Hình thoi và hình vuông").build());

        // Chương 4: Định lí Thalès
        Chapter chap4 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(8).chapterNumber(4)
                .chapterName("Định lí Thalès").description("Chương 4: Định lí Thalès").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(15).lessonName("Định lí Thales trong tam giác").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(16).lessonName("Đường trung bình của tam giác").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(17).lessonName("Tính chất đường phân giác của tam giác").build());

        // Chương 5: Dữ liệu và biểu đồ
        Chapter chap5 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(8).chapterNumber(5)
                .chapterName("Dữ liệu và biểu đồ").description("Chương 5: Dữ liệu và biểu đồ").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(18).lessonName("Thu thập và phân loại dữ liệu").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(19).lessonName("Biểu diễn dữ liệu bằng bảng, biểu đồ").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(20).lessonName("Phân tích số liệu thống kê dựa vào biểu đồ").build());

        // Chương 6: Phân thức Đại số
        Chapter chap6 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(8).chapterNumber(6)
                .chapterName("Phân thức Đại số").description("Chương 6: Phân thức Đại số").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(21).lessonName("Phân thức Đại số").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(22).lessonName("Tính chất cơ bản của phân thức đại số").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(23).lessonName("Phép cộng và phép trừ phân thức đại số").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(24).lessonName("Phép nhân và phép chia phân thức đại số").build());

        // Chương 7: Phương trình bậc nhất và hàm số bậc nhất
        Chapter chap7 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(8).chapterNumber(7)
                .chapterName("Phương trình bậc nhất và hàm số bậc nhất").description("Chương 7: Phương trình bậc nhất và hàm số bậc nhất").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(25).lessonName("Phương trình bậc nhất một ẩn").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(26).lessonName("Giải bài toán bằng cách lập phương trình").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(27).lessonName("Khái niệm hàm số và đồ thị hàm số").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(28).lessonName("Hàm số bậc nhất và đồ thị của hàm số bậc nhất").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(29).lessonName("Hệ số góc của đường thẳng").build());

        // Chương 8: Mở đầu về tính xác suất của biến cố
        Chapter chap8 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(8).chapterNumber(8)
                .chapterName("Mở đầu về tính xác suất của biến cố").description("Chương 8: Mở đầu về tính xác suất của biến cố").build());
        lessonRepository.save(Lesson.builder().chapter(chap8).lessonNumber(30).lessonName("Kết quả có thể và kết quả thuận lợi").build());
        lessonRepository.save(Lesson.builder().chapter(chap8).lessonNumber(31).lessonName("Cách tính xác suất của biến cố bằng tỉ số").build());
        lessonRepository.save(Lesson.builder().chapter(chap8).lessonNumber(32).lessonName("Mối liên hệ giữa xác suất thực nghiệm với xác suất và ứng dụng").build());

        // Chương 9: Tam giác đồng dạng
        Chapter chap9 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(8).chapterNumber(9)
                .chapterName("Tam giác đồng dạng").description("Chương 9: Tam giác đồng dạng").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(33).lessonName("Hai tam giác đồng dạng").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(34).lessonName("Ba trường hợp đồng dạng của hai tam giác").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(35).lessonName("Định lí Phythagore và ứng dụng").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(36).lessonName("Các trường hợp đồng dạng của hai tam giác vuông").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(37).lessonName("Hình đồng dạng").build());

        // Chương 10: Một số hình khối trong thực tiễn
        Chapter chap10 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(8).chapterNumber(10)
                .chapterName("Một số hình khối trong thực tiễn").description("Chương 10: Một số hình khối trong thực tiễn").build());
        lessonRepository.save(Lesson.builder().chapter(chap10).lessonNumber(38).lessonName("Hình chóp tam giác đều").build());
        lessonRepository.save(Lesson.builder().chapter(chap10).lessonNumber(39).lessonName("Hình chóp tứ giác đều").build());
    }
}