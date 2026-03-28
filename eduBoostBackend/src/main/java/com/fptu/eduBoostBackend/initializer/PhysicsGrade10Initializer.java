package com.fptu.eduBoostBackend.initializer;

import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.repositories.*;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PhysicsGrade10Initializer {

    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;

    public void init() {
        Subject physics = subjectRepository.findBySubjectCode("LY").orElse(null);
        if (physics == null) return;

        // Chương 1: Mở đầu
        Chapter chap1 = chapterRepository.save(Chapter.builder().subject(physics).gradeLevel(10).chapterNumber(1)
                .chapterName("Mở đầu").description("Chương 1: Mở đầu").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(1)
                .lessonName("Làm quen với Vật lí").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(2)
                .lessonName("Các quy tắc an toàn trong phòng thực hành Vật lí").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(3)
                .lessonName("Thực hành tính sai số trong phép đo. Ghi kết quả đo").build());

        // Chương 2: Động học
        Chapter chap2 = chapterRepository.save(Chapter.builder().subject(physics).gradeLevel(10).chapterNumber(2)
                .chapterName("Động học").description("Chương 2: Động học").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(4)
                .lessonName("Độ dịch chuyển và quãng đường đi được").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(5)
                .lessonName("Tốc độ và vận tốc").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(7)
                .lessonName("Đồ thị độ dịch chuyển - thời gian").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(8)
                .lessonName("Chuyển động biến đổi. Gia tốc").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(9)
                .lessonName("Chuyển động thẳng biến đổi đều").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(10)
                .lessonName("Sự rơi tự do").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(12)
                .lessonName("Chuyển động ném").build());

        // Chương 3: Động lực học
        Chapter chap3 = chapterRepository.save(Chapter.builder().subject(physics).gradeLevel(10).chapterNumber(3)
                .chapterName("Động lực học").description("Chương 3: Động lực học").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(13)
                .lessonName("Tổng hợp và phân tích lực. Cân bằng lực").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(14)
                .lessonName("Định luật 1 Newton").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(15)
                .lessonName("Định luật 2 Newton").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(16)
                .lessonName("Định luật 3 Newton").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(17)
                .lessonName("Trọng lực và lực căng").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(18)
                .lessonName("Lực ma sát").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(19)
                .lessonName("Lực cản và lực nâng").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(20)
                .lessonName("Một số ví dụ về cách giải các bài toán thuộc phần động lực học").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(21)
                .lessonName("Moment lực. Cân bằng của vật rắn").build());

        // Chương 4: Năng lượng, công, công suất
        Chapter chap4 = chapterRepository.save(Chapter.builder().subject(physics).gradeLevel(10).chapterNumber(4)
                .chapterName("Năng lượng, công, công suất").description("Chương 4: Năng lượng, công, công suất").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(23)
                .lessonName("Năng lượng. Công cơ học").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(24)
                .lessonName("Công suất").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(25)
                .lessonName("Động năng. Thế năng").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(26)
                .lessonName("Cơ năng và định luật bảo toàn cơ năng").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(27)
                .lessonName("Hiệu suất").build());

        // Chương 5: Động lượng
        Chapter chap5 = chapterRepository.save(Chapter.builder().subject(physics).gradeLevel(10).chapterNumber(5)
                .chapterName("Động lượng").description("Chương 5: Động lượng").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(28)
                .lessonName("Động lượng").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(29)
                .lessonName("Định luật bảo toàn động lượng").build());

        // Chương 6: Chuyển động tròn
        Chapter chap6 = chapterRepository.save(Chapter.builder().subject(physics).gradeLevel(10).chapterNumber(6)
                .chapterName("Chuyển động tròn").description("Chương 6: Chuyển động tròn").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(31)
                .lessonName("Động học của chuyển động tròn đều").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(32)
                .lessonName("Lực hướng tâm và gia tốc hướng tâm").build());

        // Chương 7: Biến dạng của vật rắn. Áp suất chất lỏng
        Chapter chap7 = chapterRepository.save(Chapter.builder().subject(physics).gradeLevel(10).chapterNumber(7)
                .chapterName("Biến dạng của vật rắn. Áp suất chất lỏng")
                .description("Chương 7: Biến dạng của vật rắn. Áp suất chất lỏng").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(33)
                .lessonName("Biến dạng của vật rắn").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(34)
                .lessonName("Khối lượng riêng. Áp suất chất lỏng").build());
    }
}
