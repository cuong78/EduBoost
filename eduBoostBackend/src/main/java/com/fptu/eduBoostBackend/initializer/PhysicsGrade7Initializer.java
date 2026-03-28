package com.fptu.eduBoostBackend.initializer;

import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.repositories.*;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PhysicsGrade7Initializer {

    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;

    public void init() {
        Subject physics = subjectRepository.findBySubjectCode("LY").orElse(null);
        if (physics == null) return;

        // Chương 1: Quang học
        Chapter chap1 = chapterRepository.save(Chapter.builder().subject(physics).gradeLevel(7).chapterNumber(1)
                .chapterName("Quang học").description("Chương 1: Quang học").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(1).lessonName("Nhận biết ánh sáng - Nguồn sáng và vật sáng").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(2).lessonName("Sự truyền ánh sáng").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(3).lessonName("Ứng dụng định luật truyền thẳng của ánh sáng").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(4).lessonName("Định luật phản xạ ánh sáng").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(5).lessonName("Ảnh của một vật tạo bởi gương phẳng").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(7).lessonName("Gương cầu lồi").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(8).lessonName("Gương cầu lõm").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(9).lessonName("Tổng kết chương 1: Quang học").build());

        // Chương 2: Âm học
        Chapter chap2 = chapterRepository.save(Chapter.builder().subject(physics).gradeLevel(7).chapterNumber(2)
                .chapterName("Âm học").description("Chương 2: Âm học").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(10).lessonName("Nguồn âm").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(11).lessonName("Độ cao của âm").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(12).lessonName("Độ to của âm").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(13).lessonName("Môi trường truyền âm").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(14).lessonName("Phản xạ âm - Tiếng vang").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(15).lessonName("Chống ô nhiễm tiếng ồn").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(16).lessonName("Tổng kết chương II: Âm học").build());

        // Chương 3: Điện học
        Chapter chap3 = chapterRepository.save(Chapter.builder().subject(physics).gradeLevel(7).chapterNumber(3)
                .chapterName("Điện học").description("Chương 3: Điện học").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(17).lessonName("Sự nhiễm điện do cọ xát").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(18).lessonName("Hai loại điện tích").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(19).lessonName("Dòng điện - Nguồn điện").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(20).lessonName("Chất dẫn điện và chất cách điện - Dòng điện trong kim loại").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(21).lessonName("Sơ đồ mạch điện - Chiều dòng điện").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(22).lessonName("Tác dụng nhiệt và tác dụng phát sáng của dòng điện").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(23).lessonName("Tác dụng từ, tác dụng hóa học và tác dụng sinh lý của dòng điện").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(24).lessonName("Cường độ dòng điện").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(25).lessonName("Hiệu điện thế").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(26).lessonName("Hiệu điện thế giữa hai đầu dụng cụ điện").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(27).lessonName("Thực hành: Đo cường độ dòng điện và hiệu điện thế đối với đoạn mạch nối tiếp").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(29).lessonName("An toàn khi sử dụng điện").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(30).lessonName("Tổng kết chương III: Điện học").build());
    }
}
