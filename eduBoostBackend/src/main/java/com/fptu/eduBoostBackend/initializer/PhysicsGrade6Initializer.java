package com.fptu.eduBoostBackend.initializer;

import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.repositories.*;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PhysicsGrade6Initializer {

    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;

    public void init() {
        Subject physics = subjectRepository.findBySubjectCode("LY").orElse(null);
        if (physics == null) return;

        // Chương 1: Cơ học
        Chapter chap1 = chapterRepository.save(Chapter.builder().subject(physics).gradeLevel(6).chapterNumber(1)
                .chapterName("Cơ học").description("Chương 1: Cơ học").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(1).lessonName("Đo độ dài").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(2).lessonName("Đo độ dài (tiếp theo)").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(3).lessonName("Đo thể tích chất lỏng").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(4).lessonName("Đo thể tích vật rắn không thấm nước").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(5).lessonName("Khối lượng - Đo khối lượng").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(6).lessonName("Lực - Hai lực cân bằng").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(7).lessonName("Tìm hiểu kết quả tác dụng của lực").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(8).lessonName("Trọng lực - Đơn vị lực").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(9).lessonName("Lực đàn hồi").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(10).lessonName("Lực kế - Phép đo lực - Trọng lượng và khối lượng").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(11).lessonName("Khối lượng riêng - Trọng lượng riêng").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(13).lessonName("Máy cơ đơn giản").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(14).lessonName("Mặt phẳng nghiêng").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(15).lessonName("Đòn bẩy").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(16).lessonName("Ròng rọc").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(17).lessonName("Tổng kết Chương 1: Cơ học").build());

        // Chương 2: Nhiệt học
        Chapter chap2 = chapterRepository.save(Chapter.builder().subject(physics).gradeLevel(6).chapterNumber(2)
                .chapterName("Nhiệt học").description("Chương 2: Nhiệt học").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(18).lessonName("Sự nở vì nhiệt của chất rắn").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(19).lessonName("Sự nở vì nhiệt của chất lỏng").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(20).lessonName("Sự nở vì nhiệt của chất khí").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(21).lessonName("Một số ứng dụng của sự nở vì nhiệt").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(22).lessonName("Nhiệt kế - Thang đo nhiệt độ").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(24).lessonName("Sự nóng chảy và sự đông đặc").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(25).lessonName("Sự nóng chảy và sự đông đặc (tiếp theo)").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(26).lessonName("Sự bay hơi và sự ngưng tụ").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(27).lessonName("Sự bay hơi và sự ngưng tụ (tiếp theo)").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(28).lessonName("Sự sôi").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(29).lessonName("Sự sôi (tiếp theo)").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(30).lessonName("Tổng kết chương II : Nhiệt học").build());
    }
}
