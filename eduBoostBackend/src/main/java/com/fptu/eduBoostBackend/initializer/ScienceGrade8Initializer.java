package com.fptu.eduBoostBackend.initializer;

import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.repositories.*;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ScienceGrade8Initializer {

    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;

    public void init() {
        Subject sc = subjectRepository.findBySubjectCode("SINH").orElse(null);
        if (sc == null) return;

        // Lời nói đầu
        Chapter preface = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(8).chapterNumber(1)
                .chapterName("Lời nói đầu").description("Bài 1: Sử dụng một số hóa chất, thiết bị cơ bản trong phòng thí nghiệm").build());
        lessonRepository.save(Lesson.builder().chapter(preface).lessonNumber(1)
                .lessonName("Sử dụng một số hóa chất, thiết bị cơ bản trong phòng thí nghiệm").build());

        // Chương 1: Phản ứng hóa học
        Chapter chap1 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(8).chapterNumber(2)
                .chapterName("Phản ứng hóa học").description("Chương 1: Phản ứng hóa học").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(2).lessonName("Phản ứng hóa học").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(3).lessonName("Mol và tỉ khối chất khí").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(4).lessonName("Dung dịch và nồng độ").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(5).lessonName("Định luật bảo toàn khối lượng và phương trình hóa học").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(6).lessonName("Tính theo phương trình hóa học").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(7).lessonName("Tốc độ phản ứng và chất xúc tác").build());

        // Chương 2: Một số hợp chất thông dụng
        Chapter chap2 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(8).chapterNumber(3)
                .chapterName("Một số hợp chất thông dụng").description("Chương 2: Một số hợp chất thông dụng").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(8).lessonName("Acid").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(9).lessonName("Base. Thang pH").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(10).lessonName("Oxide").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(11).lessonName("Muối").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(12).lessonName("Phân bón hóa học").build());

        // Chương 3: Khối lượng riêng và áp suất
        Chapter chap3 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(8).chapterNumber(4)
                .chapterName("Khối lượng riêng và áp suất").description("Chương 3: Khối lượng riêng và áp suất").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(13).lessonName("Khối lượng riêng").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(14).lessonName("Thực hành xác định khối lượng riêng").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(15).lessonName("Áp suất trên một bề mặt").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(16).lessonName("Áp suất chất lỏng. Áp suất khí quyển").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(17).lessonName("Lực đẩy Archimedes").build());

        // Chương 4: Tác dụng làm quay của lực
        Chapter chap4 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(8).chapterNumber(5)
                .chapterName("Tác dụng làm quay của lực").description("Chương 4: Tác dụng làm quay của lực").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(18).lessonName("Tác dụng làm quay của lực. Moment lực").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(19).lessonName("Đòn bẩy và ứng dụng").build());

        // Chương 5: Điện
        Chapter chap5 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(8).chapterNumber(6)
                .chapterName("Điện").description("Chương 5: Điện").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(20).lessonName("Nhiễm điện do co xát").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(21).lessonName("Dòng điện, nguồn điện").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(22).lessonName("Mạch điện đơn giản").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(23).lessonName("Tác dụng của dòng điện").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(24).lessonName("Cường độ dòng điện và hiệu điện thế").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(25).lessonName("Thực hành đo cường độ dòng điện và hiệu điện thế").build());

        // Chương 6: Nhiệt
        Chapter chap6 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(8).chapterNumber(7)
                .chapterName("Nhiệt").description("Chương 6: Nhiệt").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(26).lessonName("Năng lượng nhiệt và nội năng").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(27).lessonName("Sự truyền nhiệt").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(28).lessonName("Sự nở vì nhiệt").build());

        // Chương 7: Sinh học cơ thể người
        Chapter chap7b = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(8).chapterNumber(8)
                .chapterName("Sinh học cơ thể người").description("Chương 7: Sinh học cơ thể người").build());
        lessonRepository.save(Lesson.builder().chapter(chap7b).lessonNumber(30).lessonName("Khát quát về cơ thể người").build());
        lessonRepository.save(Lesson.builder().chapter(chap7b).lessonNumber(31).lessonName("Hệ vận động ở người").build());
        lessonRepository.save(Lesson.builder().chapter(chap7b).lessonNumber(32).lessonName("Dinh dưỡng và tiêu hóa ở người").build());
        lessonRepository.save(Lesson.builder().chapter(chap7b).lessonNumber(33).lessonName("Máu và hệ tuần hoàn ở cơ thể người").build());
        lessonRepository.save(Lesson.builder().chapter(chap7b).lessonNumber(34).lessonName("Hệ hô hấp ở người").build());
        lessonRepository.save(Lesson.builder().chapter(chap7b).lessonNumber(35).lessonName("Hệ bài tiết ở người").build());
        lessonRepository.save(Lesson.builder().chapter(chap7b).lessonNumber(36).lessonName("Điều hòa môi trường trong của cơ thể người").build());
        lessonRepository.save(Lesson.builder().chapter(chap7b).lessonNumber(37).lessonName("Hệ thần kinh và các giác quan ở người").build());
        lessonRepository.save(Lesson.builder().chapter(chap7b).lessonNumber(38).lessonName("Hệ nội tiết ở người").build());
        lessonRepository.save(Lesson.builder().chapter(chap7b).lessonNumber(39).lessonName("Da và điều hòa thân nhiệt ở người").build());
        lessonRepository.save(Lesson.builder().chapter(chap7b).lessonNumber(40).lessonName("Sinh sản ở người").build());

        // Chương 8: Sinh vật và môi trường
        Chapter chap8b = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(8).chapterNumber(9)
                .chapterName("Sinh vật và môi trường").description("Chương 8: Sinh vật và môi trường").build());
        lessonRepository.save(Lesson.builder().chapter(chap8b).lessonNumber(41).lessonName("Môi trường và các nhân tố sinh thái").build());
        lessonRepository.save(Lesson.builder().chapter(chap8b).lessonNumber(42).lessonName("Quần thể sinh vật").build());
        lessonRepository.save(Lesson.builder().chapter(chap8b).lessonNumber(43).lessonName("Quần xã sinh vật").build());
        lessonRepository.save(Lesson.builder().chapter(chap8b).lessonNumber(44).lessonName("Hệ sinh thái").build());
        lessonRepository.save(Lesson.builder().chapter(chap8b).lessonNumber(45).lessonName("Sinh quyển").build());
        lessonRepository.save(Lesson.builder().chapter(chap8b).lessonNumber(46).lessonName("Cân bằng tự nhiên").build());
        lessonRepository.save(Lesson.builder().chapter(chap8b).lessonNumber(47).lessonName("Bảo vệ môi trường").build());
    }
}