package com.fptu.eduBoostBackend.initializer;

import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.repositories.*;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PhysicsGrade12Initializer {

    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;

    public void init() {
        Subject physics = subjectRepository.findBySubjectCode("LY").orElse(null);
        if (physics == null) return;

        // Chương 1: Vật lí nhiệt
        Chapter chap1 = chapterRepository.save(Chapter.builder()
                .subject(physics).gradeLevel(12).chapterNumber(1)
                .chapterName("Vật lí nhiệt").description("Chương 1: Vật lí nhiệt").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(1)
                .lessonName("Cấu trúc của chất. Sự chuyển thể").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(2)
                .lessonName("Nội năng. Định luật I của nhiệt động lực học").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(3)
                .lessonName("Nhiệt độ. Thang nhiệt độ - Nhiệt kế").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(4)
                .lessonName("Nhiệt dung riêng").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(5)
                .lessonName("Nhiệt nóng chảy riêng").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(6)
                .lessonName("Nhiệt hoá hơi riêng").build());

        // Chương 2: Khí lí tưởng
        Chapter chap2 = chapterRepository.save(Chapter.builder()
                .subject(physics).gradeLevel(12).chapterNumber(2)
                .chapterName("Khí lí tưởng").description("Chương 2: Khí lí tưởng").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(8)
                .lessonName("Mô hình động học phân tử chất khí").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(9)
                .lessonName("Định luật Boyle").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(10)
                .lessonName("Định luật Charles").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(11)
                .lessonName("Phương trình trạng thái của khí lí tưởng").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(12)
                .lessonName("Áp suất khí theo mô hình động học phân tử. Quan hệ giữa động năng phân tử và nhiệt độ").build());

        // Chương 3: Từ trường
        Chapter chap3 = chapterRepository.save(Chapter.builder()
                .subject(physics).gradeLevel(12).chapterNumber(3)
                .chapterName("Từ trường").description("Chương 3: Từ trường").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(14)
                .lessonName("Từ trường").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(15)
                .lessonName("Lực từ tác dụng lên dây dẫn mang dòng điện. Cảm ứng từ").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(16)
                .lessonName("Từ thông. Hiện tượng cảm ứng điện từ").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(17)
                .lessonName("Máy phát điện xoay chiều").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(18)
                .lessonName("Ứng dụng hiện tượng cảm ứng điện từ").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(19)
                .lessonName("Điện từ trường. Mô hình sóng điện từ").build());

        // Chương 4: Vật lí hạt nhân
        Chapter chap4 = chapterRepository.save(Chapter.builder()
                .subject(physics).gradeLevel(12).chapterNumber(4)
                .chapterName("Vật lí hạt nhân").description("Chương 4: Vật lí hạt nhân").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(21)
                .lessonName("Cấu trúc hạt nhân").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(22)
                .lessonName("Phản ứng hạt nhân và năng lượng liên kết").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(23)
                .lessonName("Hiện tượng phóng xạ").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(24)
                .lessonName("Công nghiệp hạt nhân").build());
    }
}