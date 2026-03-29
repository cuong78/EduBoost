package com.fptu.eduBoostBackend.initializer;

import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.repositories.*;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ScienceGrade9Initializer {

    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;

    public void init() {
        Subject sc = subjectRepository.findBySubjectCode("SCI").orElse(null);
        if (sc == null) return;

        // Chương I. NĂNG LƯỢNG CƠ HỌC
        Chapter chap1 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(9).chapterNumber(1)
                .chapterName("NĂNG LƯỢNG CƠ HỌC").description("Chương I. NĂNG LƯỢNG CƠ HỌC").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(1)
                .lessonName("Nhận biết một số dụng cụ, hoá chất. Thuyết trình một vấn đề khoa học").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(2)
                .lessonName("Động năng").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(3)
                .lessonName("Cơ năng").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(4)
                .lessonName("Công và công suất").build());

        // Chương II. ÁNH SÁNG
        Chapter chap2 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(9).chapterNumber(2)
                .chapterName("ÁNH SÁNG").description("Chương II. ÁNH SÁNG").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(5)
                .lessonName("Khúc xạ ánh sáng").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(6)
                .lessonName("Phản xạ toàn phần").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(7)
                .lessonName("Lăng kính").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(8)
                .lessonName("Thấu kính").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(10)
                .lessonName("Kính lúp. Bài tập thấu kính").build());

        // Chương III. ĐIỆN
        Chapter chap3 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(9).chapterNumber(3)
                .chapterName("ĐIỆN").description("Chương III. ĐIỆN").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(11)
                .lessonName("Điện trở. Định luật Ohm").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(12)
                .lessonName("Đoạn mạch nối tiếp, song song").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(13)
                .lessonName("Năng lượng của dòng diện và công suất điện").build());

        // Chương IV. ĐIỆN TỪ
        Chapter chap4 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(9).chapterNumber(4)
                .chapterName("ĐIỆN TỪ").description("Chương IV. ĐIỆN TỪ").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(14)
                .lessonName("Cảm ứng điện từ. Nguyên tắc tạo ra dòng điện xoay chiều").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(15)
                .lessonName("Tác dụng của dòng điện xoay chiều").build());

        // Chương V. NĂNG LƯỢNG VỚI CUỘC SỐNG
        Chapter chap5 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(9).chapterNumber(5)
                .chapterName("NĂNG LƯỢNG VỚI CUỘC SỐNG").description("Chương V. NĂNG LƯỢNG VỚI CUỘC SỐNG").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(16)
                .lessonName("Vòng năng lượng trên Trái Đất. Năng lượng hoá thạch").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(17)
                .lessonName("Một số dạng năng lượng tái tạo").build());

        // Chương VI. KIM LOẠI...
        Chapter chap6 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(9).chapterNumber(6)
                .chapterName("KIM LOẠI. SỰ KHÁC NHAU CƠ BẢN GIỮA PHI KIM VÀ KIM LOẠI")
                .description("Chương VI. KIM LOẠI...").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(18)
                .lessonName("Tính chất chung của kim loại").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(19)
                .lessonName("Dãy hoạt động hoá học").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(20)
                .lessonName("Tách kim loại và việc sử dụng hợp kim").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(21)
                .lessonName("Sự khác nhau cơ bản giữa phi kim và kim loại").build());

        // Chương VII. GIỚI THIỆU VỀ CHẤT HỮU CƠ...
        Chapter chap7 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(9).chapterNumber(7)
                .chapterName("GIỚI THIỆU VỀ CHẤT HỮU CƠ. HYDROCARBON VÀ NGUỒN NHIÊN LIỆU")
                .description("Chương VII. GIỚI THIỆU VỀ CHẤT HỮU CƠ...").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(22)
                .lessonName("Giới thiệu về hợp chất hữu cơ").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(23)
                .lessonName("Alkane").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(24)
                .lessonName("Alkene").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(25)
                .lessonName("Nguồn nhiên liệu").build());

        // Chương VIII. ETHYLIC ALCOHOL VÀ ACETIC ACID
        Chapter chap8 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(9).chapterNumber(8)
                .chapterName("ETHYLIC ALCOHOL VÀ ACETIC ACID").description("Chương VIII").build());
        lessonRepository.save(Lesson.builder().chapter(chap8).lessonNumber(26)
                .lessonName("Ethylic alcohol").build());
        lessonRepository.save(Lesson.builder().chapter(chap8).lessonNumber(27)
                .lessonName("Acetic acid").build());

        // Chương IX. LIPID. CARBOHYDRATE. PROTEIN. POLYMER
        Chapter chap9 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(9).chapterNumber(9)
                .chapterName("LIPID. CARBOHYDRATE. PROTEIN. POLYMER").description("Chương IX").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(28)
                .lessonName("Lipid").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(29)
                .lessonName("Carbohydrate. Glucose và saccharose").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(30)
                .lessonName("Tinh bột và cellulose").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(31)
                .lessonName("Protein").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(32)
                .lessonName("Polymer").build());

        // Chương X. KHAI THÁC TÀI NGUYÊN TỪ VỎ TRÁI ĐẤT
        Chapter chap10 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(9).chapterNumber(10)
                .chapterName("KHAI THÁC TÀI NGUYÊN TỪ VỎ TRÁI ĐẤT").description("Chương X").build());
        lessonRepository.save(Lesson.builder().chapter(chap10).lessonNumber(33)
                .lessonName("Sơ lược về hoá học vỏ Trái Đất và khai thác tài nguyên từ vỏ Trái Đất").build());
        lessonRepository.save(Lesson.builder().chapter(chap10).lessonNumber(34)
                .lessonName("Khai thác đá vôi. Công nghiệp silicate").build());
        lessonRepository.save(Lesson.builder().chapter(chap10).lessonNumber(35)
                .lessonName("Khai thác nhiên liệu hoá thạch. Nguồn carbon. Chu trình carbon và sự ấm lên toàn cầu").build());

        // Chương XI. DI TRUYỀN HỌC MENDEL...
        Chapter chap11 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(9).chapterNumber(11)
                .chapterName("DI TRUYỀN HỌC MENDEL. CƠ SỞ PHÂN TỬ CỦA HIỆN TƯỢNG DI TRUYỀN").description("Chương XI").build());
        lessonRepository.save(Lesson.builder().chapter(chap11).lessonNumber(36)
                .lessonName("Khái quát về di truyền học").build());
        lessonRepository.save(Lesson.builder().chapter(chap11).lessonNumber(37)
                .lessonName("Các quy luật di truyền của Mendel").build());
        lessonRepository.save(Lesson.builder().chapter(chap11).lessonNumber(38)
                .lessonName("Nucleic acid và gene").build());
        lessonRepository.save(Lesson.builder().chapter(chap11).lessonNumber(39)
                .lessonName("Tái bản DNA và phiên mã tạo RNA").build());
        lessonRepository.save(Lesson.builder().chapter(chap11).lessonNumber(40)
                .lessonName("Dịch mã và mối quan hệ từ gene đến tính trạng").build());
        lessonRepository.save(Lesson.builder().chapter(chap11).lessonNumber(41)
                .lessonName("Đột biến gene").build());

        // Chương XII. DI TRUYỀN NHIỄM SẮC THỂ
        Chapter chap12 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(9).chapterNumber(12)
                .chapterName("DI TRUYỀN NHIỄM SẮC THỂ").description("Chương XII").build());
        lessonRepository.save(Lesson.builder().chapter(chap12).lessonNumber(42)
                .lessonName("Nhiễm sắc thể và bộ nhiễm sắc thể").build());
        lessonRepository.save(Lesson.builder().chapter(chap12).lessonNumber(43)
                .lessonName("Nguyên phân và giảm phân").build());
        lessonRepository.save(Lesson.builder().chapter(chap12).lessonNumber(44)
                .lessonName("Nhiễm sắc thể giới tính và cơ chế xác định giới tính").build());
        lessonRepository.save(Lesson.builder().chapter(chap12).lessonNumber(45)
                .lessonName("Di truyền liên kết").build());
        lessonRepository.save(Lesson.builder().chapter(chap12).lessonNumber(46)
                .lessonName("Đột biến nhiễm sắc thể").build());

        // Chương XIII. DI TRUYỀN HỌC VỚI CON NGƯỜI VÀ ĐỜI SỐNG
        Chapter chap13 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(9).chapterNumber(13)
                .chapterName("DI TRUYỀN HỌC VỚI CON NGƯỜI VÀ ĐỜI SỐNG").description("Chương XIII").build());
        lessonRepository.save(Lesson.builder().chapter(chap13).lessonNumber(47)
                .lessonName("Di truyền học với con người").build());
    }
}