package com.fptu.eduBoostBackend.initializer;

import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.repositories.*;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PhysicsGrade11Initializer {

    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;

    public void init() {
        Subject physics = subjectRepository.findBySubjectCode("LY").orElse(null);
        if (physics == null) return;

        Chapter chap1 = chapterRepository.save(Chapter.builder()
                .subject(physics)
                .gradeLevel(11)
                .chapterNumber(1)
                .chapterName("Dao động")
                .description("Chương 1: Dao động")
                .build());

        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(1)
                .lessonName("Dao động điều hòa").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(2)
                .lessonName("Mô tả dao động điều hòa").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(3)
                .lessonName("Vận tốc, gia tốc trong điều hòa dao động").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(4)
                .lessonName("Bài tập về điều hòa dao động").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(5)
                .lessonName("Động năng. Thế năng. Sự chuyển hóa giữa động năng và thế năng trong dao động điều hòa").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(6)
                .lessonName("Dao động tắt dần. Dao động cưỡng bức. Hiện tượng cộng hưởng").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(7)
                .lessonName("Bài tập về sự chuyển năng lượng trong dao động điều hòa").build());

        Chapter chap2 = chapterRepository.save(Chapter.builder()
                .subject(physics)
                .gradeLevel(11)
                .chapterNumber(2)
                .chapterName("Sóng")
                .description("Chương 2: Sóng")
                .build());

        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(8)
                .lessonName("Mô tả sóng").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(9)
                .lessonName("Sóng ngang, sóng dọc, sự truyền năng lượng của sóng cơ").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(10)
                .lessonName("Thực hành: Đo tần số của sóng âm").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(11)
                .lessonName("Sóng điện từ").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(12)
                .lessonName("Giao thoa sóng").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(13)
                .lessonName("Sóng dừng").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(14)
                .lessonName("Bài tập về sóng").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(15)
                .lessonName("Thực hành: Đo tốc độ truyền âm").build());

        Chapter chap3 = chapterRepository.save(Chapter.builder()
                .subject(physics)
                .gradeLevel(11)
                .chapterNumber(3)
                .chapterName("Điện trường")
                .description("Chương 3: Điện trường")
                .build());

        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(16)
                .lessonName("Lực tương tác giữa hai điện tích").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(17)
                .lessonName("Khái niệm điện trường").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(18)
                .lessonName("Điện trường đều").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(19)
                .lessonName("Thế năng điện").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(20)
                .lessonName("Điện thế").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(21)
                .lessonName("Tụ điện").build());

        Chapter chap4 = chapterRepository.save(Chapter.builder()
                .subject(physics)
                .gradeLevel(11)
                .chapterNumber(4)
                .chapterName("Dòng điện. Mạch điện")
                .description("Chương 4: Dòng điện. Mạch điện")
                .build());

        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(22)
                .lessonName("Cường độ dòng điện").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(23)
                .lessonName("Điện trở. Định luật Ohm").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(24)
                .lessonName("Nguồn điện").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(25)
                .lessonName("Năng lượng điện và công suất điện").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(26)
                .lessonName("Thực hành: Đo suất điện động và điện trở trong của pin điện hóa").build());
    }
}