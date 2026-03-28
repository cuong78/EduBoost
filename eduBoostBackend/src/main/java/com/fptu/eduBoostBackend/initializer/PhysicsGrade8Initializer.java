package com.fptu.eduBoostBackend.initializer;

import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.repositories.*;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PhysicsGrade8Initializer {

    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;

    public void init() {
        Subject physics = subjectRepository.findBySubjectCode("LY").orElse(null);
        if (physics == null) return;

        // Chương 1: Cơ học
        Chapter chap1 = chapterRepository.save(Chapter.builder().subject(physics).gradeLevel(8).chapterNumber(1)
                .chapterName("Cơ học").description("Chương 1: Cơ học").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(1).lessonName("Chuyển động cơ học").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(2).lessonName("Vận tốc").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(3).lessonName("Chuyển động đều - Chuyển động không đều").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(4).lessonName("Biểu diễn lực").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(5).lessonName("Sự cân bằng lực - Quán tính").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(6).lessonName("Lực ma sát").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(7).lessonName("Áp suất").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(8).lessonName("Áp suất chất lỏng - Bình thông nhau").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(9).lessonName("Áp suất khí quyển").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(10).lessonName("Lực đẩy Ác-si-mét").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(12).lessonName("Sự nổi").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(13).lessonName("Công cơ học").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(14).lessonName("Định luật về công").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(15).lessonName("Công suất").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(16).lessonName("Cơ năng").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(17).lessonName("Sự chuyển hóa và bảo toàn cơ năng").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(18).lessonName("Câu hỏi và bài tập tổng kết chương I: Cơ học").build());

        // Chương 2: Nhiệt học
        Chapter chap2 = chapterRepository.save(Chapter.builder().subject(physics).gradeLevel(8).chapterNumber(2)
                .chapterName("Nhiệt học").description("Chương 2: Nhiệt học").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(19).lessonName("Các chất được cấu tạo như thế nào?").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(20).lessonName("Nguyên tử, phân tử chuyển động hay đứng yên?").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(21).lessonName("Nhiệt năng").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(22).lessonName("Dẫn nhiệt").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(23).lessonName("Đối lưu - Bức xạ nhiệt").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(24).lessonName("Công thức tính nhiệt lượng").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(25).lessonName("Phương trình cân bằng nhiệt").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(26).lessonName("Năng suất tỏa nhiệt của nhiên liệu").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(27).lessonName("Sự bảo toàn năng lượng trong các hiện tượng cơ và nhiệt").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(28).lessonName("Động cơ nhiệt").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(29).lessonName("Câu hỏi và bài tập tổng kết chương II: Nhiệt học").build());
    }
}
