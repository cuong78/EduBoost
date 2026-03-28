package com.fptu.eduBoostBackend.initializer;

import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.repositories.*;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ChemistryGrade10Initializer {

    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;

    public void init() {
        Subject chemistry = subjectRepository.findBySubjectCode("HOA").orElse(null);
        if (chemistry == null) return;

        // Chương 1: Cấu tạo nguyên tử
        Chapter chap1 = chapterRepository.save(Chapter.builder()
                .subject(chemistry).gradeLevel(10).chapterNumber(1)
                .chapterName("Cấu tạo nguyên tử").description("Chương 1: Cấu tạo nguyên tử").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(1).lessonName("Thành phần của nguyên tử").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(2).lessonName("Nguyên tố hóa học").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(3).lessonName("Cấu trúc lớp vỏ electron nguyên tử").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(4).lessonName("Ôn tập chương 1").build());

        // Chương 2: Bảng tuần hoàn các nguyên tố hóa học và định luật bảo toàn
        Chapter chap2 = chapterRepository.save(Chapter.builder()
                .subject(chemistry).gradeLevel(10).chapterNumber(2)
                .chapterName("Bảng tuần hoàn các nguyên tố hóa học và định luật bảo toàn")
                .description("Chương 2: Bảng tuần hoàn các nguyên tố hóa học và định luật bảo toàn").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(5).lessonName("Cấu tạo của bảng tuần hoàn các nguyên tố hóa học").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(6).lessonName("Xu hướng biến đổi một số tính chất của nguyên tử các nguyên tố trong một chu kì và trong một nhóm").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(7).lessonName("Xu hướng biến đổi thành phần và một số tính chất của hợp chất trong một chu kì").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(8).lessonName("Định luật bảo toàn. Ý nghĩa của bảng tuần hoàn các nguyên tố hóa học").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(9).lessonName("Ôn tập chương 2").build());

        // Chương 3: Liên kết hóa học
        Chapter chap3 = chapterRepository.save(Chapter.builder()
                .subject(chemistry).gradeLevel(10).chapterNumber(3)
                .chapterName("Liên kết hóa học").description("Chương 3: Liên kết hóa học").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(10).lessonName("Quy tắc octet").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(11).lessonName("Liên kết ion").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(12).lessonName("Liên kết cộng hóa trị").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(13).lessonName("Liên kết hydrogen và tương tác van der Waals").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(14).lessonName("Ôn tập chương 3").build());

        // Chương 4: Phản ứng oxi hóa - khử
        Chapter chap4 = chapterRepository.save(Chapter.builder()
                .subject(chemistry).gradeLevel(10).chapterNumber(4)
                .chapterName("Phản ứng oxi hóa - khử").description("Chương 4: Phản ứng oxi hóa - khử").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(15).lessonName("Phản ứng oxi hóa - khử").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(16).lessonName("Ôn tập chương 4").build());

        // Chương 5: Năng lượng hóa học
        Chapter chap5 = chapterRepository.save(Chapter.builder()
                .subject(chemistry).gradeLevel(10).chapterNumber(5)
                .chapterName("Năng lượng hóa học").description("Chương 5: Năng lượng hóa học").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(17).lessonName("Biến thiên enthalpy trong các phản ứng hóa học").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(18).lessonName("Ôn tập chương 5").build());

        // Chương 6: Tốc độ phản ứng
        Chapter chap6 = chapterRepository.save(Chapter.builder()
                .subject(chemistry).gradeLevel(10).chapterNumber(6)
                .chapterName("Tốc độ phản ứng").description("Chương 6: Tốc độ phản ứng").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(19).lessonName("Tốc độ phản ứng").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(20).lessonName("Ôn tập chương 6").build());

        // Chương 7: Nguyên tố nhóm halogen
        Chapter chap7 = chapterRepository.save(Chapter.builder()
                .subject(chemistry).gradeLevel(10).chapterNumber(7)
                .chapterName("Nguyên tố nhóm halogen").description("Chương 7: Nguyên tố nhóm halogen").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(21).lessonName("Nhóm halogen").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(22).lessonName("Hydrogen halide. Muối halide").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(23).lessonName("Ôn tập chương 7").build());
    }
}