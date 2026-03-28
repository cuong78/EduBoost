package com.fptu.eduBoostBackend.initializer;

import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.repositories.*;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ChemistryGrade8Initializer {

    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;

    public void init() {
        Subject chemistry = subjectRepository.findBySubjectCode("HOA").orElse(null);
        if (chemistry == null) return;

        // Chương 1: Chất - Nguyên tử - Phân tử
        Chapter chap1 = chapterRepository.save(Chapter.builder()
                .subject(chemistry).gradeLevel(8).chapterNumber(1)
                .chapterName("Chất - Nguyên tử - Phân tử")
                .description("Chương 1: Chất - Nguyên tử - Phân tử").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(2).lessonName("Chất").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(4).lessonName("Nguyên tử").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(5).lessonName("Nguyên tố hóa học").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(6).lessonName("Đơn chất và hợp chất - Phân tử").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(8).lessonName("Bài luyện tập 1").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(9).lessonName("Công thức hóa học").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(10).lessonName("Hóa trị").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(11).lessonName("Bài luyện tập 2").build());

        // Chương 2: Phản ứng hóa học
        Chapter chap2 = chapterRepository.save(Chapter.builder()
                .subject(chemistry).gradeLevel(8).chapterNumber(2)
                .chapterName("Phản ứng hóa học").description("Chương 2: Phản ứng hóa học").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(12).lessonName("Sự biến đổi chất").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(13).lessonName("Phản ứng hóa học").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(15).lessonName("Định luật bảo toàn khối lượng").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(16).lessonName("Phương trình hóa học").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(17).lessonName("Bài luyện tập 3").build());

        // Chương 3: Mol và tính toán hóa học
        Chapter chap3 = chapterRepository.save(Chapter.builder()
                .subject(chemistry).gradeLevel(8).chapterNumber(3)
                .chapterName("Mol và tính toán hóa học").description("Chương 3: Mol và tính toán hóa học").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(18).lessonName("Mol").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(19).lessonName("Chuyển đổi giữa khối lượng, thể tích và lượng chất").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(20).lessonName("Tỉ khối của chất khí").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(21).lessonName("Tính theo công thức hóa học").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(22).lessonName("Tính theo phương trình hóa học").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(23).lessonName("Bài luyện tập 4").build());

        // Chương 4: Oxi - Không khí
        Chapter chap4 = chapterRepository.save(Chapter.builder()
                .subject(chemistry).gradeLevel(8).chapterNumber(4)
                .chapterName("Oxi - Không khí").description("Chương 4: Oxi - Không khí").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(24).lessonName("Tính chất của oxi").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(25).lessonName("Sự oxi hóa - Phản ứng hóa hợp - Ứng dụng của oxi").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(26).lessonName("Oxit").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(27).lessonName("Điều chế khí oxi - Phản ứng phân hủy").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(28).lessonName("Không khí - sự cháy").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(29).lessonName("Bài luyện tập 5").build());

        // Chương 5: Hiđro - Nước
        Chapter chap5 = chapterRepository.save(Chapter.builder()
                .subject(chemistry).gradeLevel(8).chapterNumber(5)
                .chapterName("Hiđro - Nước").description("Chương 5: Hiđro - Nước").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(31).lessonName("Tính chất - Ứng dụng của hiđro").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(32).lessonName("Phản ứng oxi hóa - khử").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(33).lessonName("Điều chế khí hiđro - Phản ứng thế").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(34).lessonName("Bài luyện tập 6").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(36).lessonName("Nước").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(37).lessonName("Axit - Bazơ - Muối").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(38).lessonName("Bài luyện tập 7").build());

        // Chương 6: Dung dịch
        Chapter chap6 = chapterRepository.save(Chapter.builder()
                .subject(chemistry).gradeLevel(8).chapterNumber(6)
                .chapterName("Dung dịch").description("Chương 6: Dung dịch").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(40).lessonName("Dung dịch").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(41).lessonName("Độ tan của một chất trong nước").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(42).lessonName("Nồng độ dung dịch").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(43).lessonName("Pha chế dung dịch").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(44).lessonName("Bài luyện tập 8").build());
    }
}
