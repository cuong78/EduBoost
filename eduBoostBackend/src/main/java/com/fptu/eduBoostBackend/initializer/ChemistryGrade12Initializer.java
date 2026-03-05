package com.fptu.eduBoostBackend.initializer;

import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.repositories.*;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ChemistryGrade12Initializer {

    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;

    public void init() {
        Subject chemistry = subjectRepository.findBySubjectCode("HOA").orElse(null);
        if (chemistry == null) return;

        Chapter chap1 = chapterRepository.save(Chapter.builder()
                .subject(chemistry)
                .gradeLevel(12)
                .chapterNumber(1)
                .chapterName("Ester - lipid")
                .description("Chương 1: Ester - lipid")
                .build());

        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(1)
                .lessonName("Ester - Lipid").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(2)
                .lessonName("Xà phòng và chất giặt rửa").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(3)
                .lessonName("Ôn tập chương 1").build());

        Chapter chap2 = chapterRepository.save(Chapter.builder()
                .subject(chemistry)
                .gradeLevel(12)
                .chapterNumber(2)
                .chapterName("Carbohydrate")
                .description("Chương 2: Carbohydrate")
                .build());

        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(4)
                .lessonName("Giới thiệu về carbohydrate. Glucose và fructose").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(5)
                .lessonName("Saccharose và maltose").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(6)
                .lessonName("Tinh bột và cellulose").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(7)
                .lessonName("Ôn tập chương 2").build());

        Chapter chap3 = chapterRepository.save(Chapter.builder()
                .subject(chemistry)
                .gradeLevel(12)
                .chapterNumber(3)
                .chapterName("Hợp chất chứa nitrogen")
                .description("Chương 3: Hợp chất chứa nitrogen")
                .build());

        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(8)
                .lessonName("Amine").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(9)
                .lessonName("Amino acid và peptide").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(10)
                .lessonName("Protein và enzyme").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(11)
                .lessonName("Ôn tập chương 3").build());

        Chapter chap4 = chapterRepository.save(Chapter.builder()
                .subject(chemistry)
                .gradeLevel(12)
                .chapterNumber(4)
                .chapterName("Polymer")
                .description("Chương 4: Polymer")
                .build());

        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(12)
                .lessonName("Đại cương về polymer").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(13)
                .lessonName("Vật liệu polymer").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(14)
                .lessonName("Ôn tập chương 4").build());

        Chapter chap5 = chapterRepository.save(Chapter.builder()
                .subject(chemistry)
                .gradeLevel(12)
                .chapterNumber(5)
                .chapterName("Pin điện và điện phân")
                .description("Chương 5: Pin điện và điện phân")
                .build());

        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(15)
                .lessonName("Thế điện cực và nguồn điện hóa học").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(16)
                .lessonName("Điện phân").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(17)
                .lessonName("Ôn tập chương 5").build());

        Chapter chap6 = chapterRepository.save(Chapter.builder()
                .subject(chemistry)
                .gradeLevel(12)
                .chapterNumber(6)
                .chapterName("Đại cương về kim loại")
                .description("Chương 6: Đại cương về kim loại")
                .build());

        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(18)
                .lessonName("Cấu tạo và liên kết trong tinh thể kim loại").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(19)
                .lessonName("Tính chất vật lí và tính chất hóa học của kim loại").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(20)
                .lessonName("Kim loại trong tự nhiên và phương pháp tách kim loại").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(21)
                .lessonName("Hợp kim").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(22)
                .lessonName("Sự ăn mòn kim loại").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(23)
                .lessonName("Ôn tập chương 6").build());

        Chapter chap7 = chapterRepository.save(Chapter.builder()
                .subject(chemistry)
                .gradeLevel(12)
                .chapterNumber(7)
                .chapterName("Nguyên tố nhóm IA và nhóm IIA")
                .description("Chương 7: Nguyên tố nhóm IA và nhóm IIA")
                .build());

        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(24)
                .lessonName("Nguyên tố nhóm IA").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(25)
                .lessonName("Nguyên tố nhóm IIA").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(26)
                .lessonName("Ôn tập chương 7").build());
    }
}