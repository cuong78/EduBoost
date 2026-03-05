package com.fptu.eduBoostBackend.initializer;

import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.repositories.*;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MathGrade6Initializer {

    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;

    public void init() {
        Subject math = subjectRepository.findBySubjectCode("TOAN").orElse(null);
        if (math == null) return;

        // Chương 1: Tập hợp các số tự nhiên
        Chapter chap1 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(6).chapterNumber(1)
                .chapterName("Tập hợp các số tự nhiên").description("Chương 1: Tập hợp các số tự nhiên").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(1).lessonName("Tập hợp").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(2).lessonName("Cách ghi số tự nhiên").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(3).lessonName("Thứ tự trong tập hợp các số tự nhiên").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(4).lessonName("Phép cộng và phép trừ số tự nhiên").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(5).lessonName("Phép nhân và phép chia số tự nhiên").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(6).lessonName("Lũy thừa với số mũ tự nhiên").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(7).lessonName("Thứ tự thực hiện các phép tính").build());

        // Chương 2: Tính chia hết trong tập hợp các số tự nhiên
        Chapter chap2 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(6).chapterNumber(2)
                .chapterName("Tính chia hết trong tập hợp các số tự nhiên").description("Chương 2: Tính chia hết trong tập hợp các số tự nhiên").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(8).lessonName("Quan hệ chia hết và tính chất").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(9).lessonName("Dấu hiệu chia hết").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(10).lessonName("Số nguyên tố").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(11).lessonName("Ước chung. Ước chung lớn nhất").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(12).lessonName("Bội chung. Bội chung nhỏ nhất").build());

        // Chương 3: Số nguyên
        Chapter chap3 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(6).chapterNumber(3)
                .chapterName("Số nguyên").description("Chương 3: Số nguyên").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(13).lessonName("Tập hợp các số nguyên").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(14).lessonName("Phép cộng và phép trừ số nguyên").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(15).lessonName("Quy tắc dấu ngoặc").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(16).lessonName("Phép nhân số nguyên").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(17).lessonName("Phép chia hết. Ước và bội của một số nguyên").build());

        // Chương 4: Một số hình phẳng trong thực tiễn
        Chapter chap4 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(6).chapterNumber(4)
                .chapterName("Một số hình phẳng trong thực tiễn").description("Chương 4: Một số hình phẳng trong thực tiễn").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(18).lessonName("Hình tam giác đều. hình vuông. hình lục giác đều").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(19).lessonName("hình chữ nhật. Hình thoi hình bình hành. Hình thang cân").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(20).lessonName("Chu vi và diện tích của một số tứ giác đã học").build());

        // Chương 5: Tính đối xứng của hình phẳng trong tự nhiên
        Chapter chap5 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(6).chapterNumber(5)
                .chapterName("Tính đối xứng của hình phẳng trong tự nhiên").description("Chương 5: Tính đối xứng của hình phẳng trong tự nhiên").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(21).lessonName("Hình có trục đối xứng").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(22).lessonName("Hình có tâm đối xứng").build());

        // Chương 6: Phân số
        Chapter chap6 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(6).chapterNumber(6)
                .chapterName("Phân số").description("Chương 6: Phân số").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(23).lessonName("Mở rộng phân số. Phân số bằng nhau").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(24).lessonName("So sánh phân số. Hỗn số dương").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(25).lessonName("Phép cộng và phép trừ phân số").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(26).lessonName("Phép nhân và phép chia phân số").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(27).lessonName("Hai bài toán về phân số").build());

        // Chương 7: Số thập phân
        Chapter chap7 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(6).chapterNumber(7)
                .chapterName("Số thập phân").description("Chương 7: Số thập phân").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(28).lessonName("Số thập phân").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(29).lessonName("Tính toán với số thập phân").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(30).lessonName("Làm tròn và ước lượng").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(31).lessonName("Một số bài toán về tỉ số và tỉ số phần trăm").build());

        // Chương 8: Những hình học cơ bản
        Chapter chap8 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(6).chapterNumber(8)
                .chapterName("Những hình học cơ bản").description("Chương 8: Những hình học cơ bản").build());
        lessonRepository.save(Lesson.builder().chapter(chap8).lessonNumber(32).lessonName("Điểm và đường thẳng").build());
        lessonRepository.save(Lesson.builder().chapter(chap8).lessonNumber(33).lessonName("Điểm nằm giữa hai điểm. Tia").build());
        lessonRepository.save(Lesson.builder().chapter(chap8).lessonNumber(34).lessonName("Đoạn thẳng. Độ dài đoạn thẳng").build());
        lessonRepository.save(Lesson.builder().chapter(chap8).lessonNumber(35).lessonName("Trung điểm của đoạn thẳng").build());
        lessonRepository.save(Lesson.builder().chapter(chap8).lessonNumber(36).lessonName("Góc").build());
        lessonRepository.save(Lesson.builder().chapter(chap8).lessonNumber(37).lessonName("Số đo góc").build());

        // Chương 9: Dữ liệu và xác suất thực nghiệm
        Chapter chap9 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(6).chapterNumber(9)
                .chapterName("Dữ liệu và xác suất thực nghiệm").description("Chương 9: Dữ liệu và xác suất thực nghiệm").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(38).lessonName("Dữ liệu và thu thập dữ liệu").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(39).lessonName("Bảng thống kê và biểu đồ tranh").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(40).lessonName("Biểu đồ cột").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(41).lessonName("Biểu đồ cột kép").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(42).lessonName("Kết quả có thể và sự kiện trong trò chơi, thí nghiệm").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(43).lessonName("Xác suất thực nghiệm").build());
    }
}
