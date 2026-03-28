package com.fptu.eduBoostBackend.initializer;

import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.repositories.*;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ChemistryGrade11Initializer {

    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;

    public void init() {
        Subject chemistry = subjectRepository.findBySubjectCode("HOA").orElse(null);
        if (chemistry == null) return;

        // Chương 1: Cân bằng hóa học
        Chapter chap1 = chapterRepository.save(Chapter.builder()
                .subject(chemistry).gradeLevel(11).chapterNumber(1)
                .chapterName("Cân bằng hóa học").description("Chương 1: Cân bằng hóa học").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(1).lessonName("Khái niệm về cân bằng hóa học").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(2).lessonName("Cân bằng trong dung dịch nước").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(3).lessonName("Ôn tập chương 1").build());

        // Chương 2: Nitrogen – Sulfur
        Chapter chap2 = chapterRepository.save(Chapter.builder()
                .subject(chemistry).gradeLevel(11).chapterNumber(2)
                .chapterName("Nitrogen – Sulfur").description("Chương 2: Nitrogen – Sulfur").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(4).lessonName("Nitrogen").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(5).lessonName("Ammonia - Muối Ammonium").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(6).lessonName("Một số chất của nitrogen với oxygen").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(7).lessonName("Sulfur và sulfur dioxide").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(8).lessonName("Sulfuric acid và muối sulfate").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(9).lessonName("Ôn tập chương 2").build());

        // Chương 3: Đại cương về hóa học hữu cơ
        Chapter chap3 = chapterRepository.save(Chapter.builder()
                .subject(chemistry).gradeLevel(11).chapterNumber(3)
                .chapterName("Đại cương về hóa học hữu cơ").description("Chương 3: Đại cương về hóa học hữu cơ").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(10).lessonName("Hợp chất hữu cơ và hóa học hữu cơ").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(11).lessonName("Phương pháp tách biệt và tinh chế hợp chất hữu cơ").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(12).lessonName("Công thức phân tử hợp chất hữu cơ").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(13).lessonName("Cấu tạo hóa học hợp chất hữu cơ").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(14).lessonName("Ôn tập chương 3").build());

        // Chương 4: Hydrocarbon
        Chapter chap4 = chapterRepository.save(Chapter.builder()
                .subject(chemistry).gradeLevel(11).chapterNumber(4)
                .chapterName("Hydrocarbon").description("Chương 4: Hydrocarbon").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(15).lessonName("Alkane").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(16).lessonName("Hydrocarbon không no").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(17).lessonName("Arene (Hydrocarbon thơm)").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(18).lessonName("Ôn tập chương 4").build());

        // Chương 5: Dẫn xuất Halogen – Alcohol – Phenol
        Chapter chap5 = chapterRepository.save(Chapter.builder()
                .subject(chemistry).gradeLevel(11).chapterNumber(5)
                .chapterName("Dẫn xuất Halogen – Alcohol – Phenol")
                .description("Chương 5: Dẫn xuất Halogen – Alcohol – Phenol").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(19).lessonName("Dẫn xuất halogen").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(20).lessonName("Alcohol").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(21).lessonName("Phenol").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(22).lessonName("Ôn tập chương 5").build());

        // Chương 6: Hợp chất Carbonyl – Carboxylic Acid
        Chapter chap6 = chapterRepository.save(Chapter.builder()
                .subject(chemistry).gradeLevel(11).chapterNumber(6)
                .chapterName("Hợp chất Carbonyl – Carboxylic Acid")
                .description("Chương 6: Hợp chất Carbonyl – Carboxylic Acid").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(23).lessonName("Hợp chất carbonyl").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(24).lessonName("Carboxylic acid").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(25).lessonName("Ôn tập chương 6").build());
    }
}