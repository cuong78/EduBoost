package com.fptu.eduBoostBackend.initializer;

import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.repositories.*;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ChemistryGrade9Initializer {

    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;

    public void init() {
        Subject chemistry = subjectRepository.findBySubjectCode("HOA").orElse(null);
        if (chemistry == null) return;

        // Chương 1: Các loại hợp chất vô cơ
        Chapter chap1 = chapterRepository.save(Chapter.builder()
                .subject(chemistry).gradeLevel(9).chapterNumber(1)
                .chapterName("Các loại hợp chất vô cơ").description("Chương 1: Các loại hợp chất vô cơ").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(1)
                .lessonName("Tính chất hóa học của oxit. Khái quát về sự phân loại oxit").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(2)
                .lessonName("Một số oxit quan trọng").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(3)
                .lessonName("Tính chất hóa học của axit").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(4)
                .lessonName("Một số axit quan trọng").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(5)
                .lessonName("Luyện tập: Tính chất hóa học của oxit và axit").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(6)
                .lessonName("Thực hành: Tính chất hóa học của oxit và axit").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(7)
                .lessonName("Tính chất hóa học của bazơ").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(8)
                .lessonName("Một số bazơ quan trọng").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(9)
                .lessonName("Tính chất hóa học của muối").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(10)
                .lessonName("Một số muối quan trọng").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(11)
                .lessonName("Phân bón hóa học").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(12)
                .lessonName("Mối quan hệ giữa các loại hợp chất vô cơ").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(13)
                .lessonName("Luyện tập chương 1: Các loại hợp chất vô cơ").build());

        // Chương 2: Kim loại
        Chapter chap2 = chapterRepository.save(Chapter.builder()
                .subject(chemistry).gradeLevel(9).chapterNumber(2)
                .chapterName("Kim loại").description("Chương 2: Kim loại").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(15)
                .lessonName("Tính chất vật lí của kim loại").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(16)
                .lessonName("Tính chất hóa học của kim loại").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(17)
                .lessonName("Dãy hoạt động hóa học của kim loại").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(18)
                .lessonName("Nhôm").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(19)
                .lessonName("Sắt").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(20)
                .lessonName("Hợp kim sắt: Gang, thép").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(21)
                .lessonName("Sự ăn mòn kim loại và bảo vệ kim loại không bị ăn mòn").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(22)
                .lessonName("Luyện tập chương 2: Kim loại").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(24)
                .lessonName("Ôn tập học kì 1").build());

        // Chương 3: Phi kim. Sơ lược về bảng tuần hoàn các nguyên tố hóa học
        Chapter chap3 = chapterRepository.save(Chapter.builder()
                .subject(chemistry).gradeLevel(9).chapterNumber(3)
                .chapterName("Phi kim. Sơ lược về bảng tuần hoàn các nguyên tố hóa học")
                .description("Chương 3: Phi kim. Sơ lược về bảng tuần hoàn các nguyên tố hóa học").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(25)
                .lessonName("Tính chất của phi kim").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(26)
                .lessonName("Clo").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(27)
                .lessonName("Cacbon").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(28)
                .lessonName("Các oxit của cacbon").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(29)
                .lessonName("Axit cacbonic và muối cacbonat").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(30)
                .lessonName("Silic. Công nghiệp silicat").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(31)
                .lessonName("Sơ lược về bảng tuần hoàn các nguyên tố hóa học").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(32)
                .lessonName("Luyện tập chương 3: Phi kim - Sơ lược về bảng tuần hoàn các nguyên tố hóa học").build());

        // Chương 4: Hiđrocacbon. Nhiên liệu
        Chapter chap4 = chapterRepository.save(Chapter.builder()
                .subject(chemistry).gradeLevel(9).chapterNumber(4)
                .chapterName("Hiđrocacbon. Nhiên liệu").description("Chương 4: Hiđrocacbon. Nhiên liệu").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(34)
                .lessonName("Khái niệm về hợp chất hữu cơ và hóa học hữu cơ").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(35)
                .lessonName("Cấu tạo phân tử hợp chất hữu cơ").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(36)
                .lessonName("Metan").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(37)
                .lessonName("Etilen").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(38)
                .lessonName("Axetilen").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(39)
                .lessonName("Benzen").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(40)
                .lessonName("Dầu mỏ và khí thiên nhiên").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(41)
                .lessonName("Nhiên liệu").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(42)
                .lessonName("Luyện tập chương 4 : Hiđrocacbon - Nhiên liệu").build());

        // Chương 5: Dẫn xuất của Hiđrocacbon. Polime
        Chapter chap5 = chapterRepository.save(Chapter.builder()
                .subject(chemistry).gradeLevel(9).chapterNumber(5)
                .chapterName("Dẫn xuất của Hiđrocacbon. Polime")
                .description("Chương 5: Dẫn xuất của Hiđrocacbon. Polime").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(44)
                .lessonName("Rượu etylic").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(45)
                .lessonName("Axit axetic").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(46)
                .lessonName("Mối liên hệ giữa etilen, rượu etylic và axit axetic").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(47)
                .lessonName("Chất béo").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(48)
                .lessonName("Luyện tập: Rượu etylic, axit axetic và chất béo").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(50)
                .lessonName("Glucozơ").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(51)
                .lessonName("Saccarozơ").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(52)
                .lessonName("Tinh bột và xenlulozơ").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(53)
                .lessonName("Protein").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(54)
                .lessonName("Polime").build());
    }
}
