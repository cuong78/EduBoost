package com.fptu.eduBoostBackend.initializer;

import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.repositories.*;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ScienceGrade6Initializer {

    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;

    public void init() {
        Subject sc = subjectRepository.findBySubjectCode("SINH").orElse(null);
        if (sc == null) return;

        // Chương 1: Mở đầu về Khoa học tự nhiên
        Chapter chap1 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(6).chapterNumber(1)
                .chapterName("Mở đầu về Khoa học tự nhiên").description("Chương 1: Mở đầu về Khoa học tự nhiên").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(1).lessonName("Giới thiệu về Khoa học tự nhiên").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(2).lessonName("An toàn trong phòng thực hành").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(3).lessonName("Sử dụng kính lúp").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(4).lessonName("Sử dụng kính hiển vi quang học").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(5).lessonName("Đo chiều dài").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(6).lessonName("Đo khối lượng").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(7).lessonName("Đo thời gian").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(8).lessonName("Đo nhiệt độ").build());

        // Chương 2: Chất quanh ta
        Chapter chap2 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(6).chapterNumber(2)
                .chapterName("Chất quanh ta").description("Chương 2: Chất quanh ta").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(9).lessonName("Sự đa dạng của chất").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(10).lessonName("Các thể của chất và sự chuyển thể").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(11).lessonName("Oxygen. Không khí").build());

        // Chương 3: Một số vật liệu, nguyên liệu, nhiên liệu,, lương thực - thực phẩm thông dụng
        Chapter chap3 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(6).chapterNumber(3)
                .chapterName("Một số vật liệu, nguyên liệu, nhiên liệu,, lương thực - thực phẩm thông dụng")
                .description("Chương 3: Một số vật liệu, nguyên liệu, nhiên liệu,, lương thực - thực phẩm thông dụng").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(12).lessonName("Một số vật liệu").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(13).lessonName("Một số nguyên liệu").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(14).lessonName("Một số nhiên liệu").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(15).lessonName("Một số lương thực, thực phẩm").build());

        // Chương 4: Hỗn hợp. Tách chất ra khỏi hỗn hợp
        Chapter chap4 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(6).chapterNumber(4)
                .chapterName("Hỗn hợp. Tách chất ra khỏi hỗn hợp").description("Chương 4: Hỗn hợp. Tách chất ra khỏi hỗn hợp").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(16).lessonName("Hỗn hợp các chất").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(17).lessonName("Tách chất khỏi hỗn hợp").build());

        // Chương 5: Tế bào
        Chapter chap5 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(6).chapterNumber(5)
                .chapterName("Tế bào").description("Chương 5: Tế bào").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(18).lessonName("Tế bào – Đơn vị cơ bản của sự sống").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(19).lessonName("Cấu tạo và chức năng các thành phần của tế bào").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(20).lessonName("Sự lớn lên và sinh sản của tế bào").build());

        // Chương 6: Từ tế bào đến cơ thể
        Chapter chap6 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(6).chapterNumber(6)
                .chapterName("Từ tế bào đến cơ thể").description("Chương 6: Từ tế bào đến cơ thể").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(22).lessonName("Cơ thể sinh vật").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(23).lessonName("Tổ chức cơ thể đa bào").build());

        // Chương 7: Đa dạng thế giới sống
        Chapter chap7 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(6).chapterNumber(7)
                .chapterName("Đa dạng thế giới sống").description("Chương 7: Đa dạng thế giới sống").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(25).lessonName("Hệ thống phân loại sinh vật").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(26).lessonName("Khóa lưỡng phân").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(27).lessonName("Vi khuẩn").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(29).lessonName("Virus").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(30).lessonName("Nguyên sinh vật").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(32).lessonName("Nấm").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(34).lessonName("Thực vật").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(36).lessonName("Động vật").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(38).lessonName("Đa dạng sinh học").build());

        // Chương 8: Lực trong đời sống
        Chapter chap8 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(6).chapterNumber(8)
                .chapterName("Lực trong đời sống").description("Chương 8: Lực trong đời sống").build());
        lessonRepository.save(Lesson.builder().chapter(chap8).lessonNumber(40).lessonName("Lực là gì?").build());
        lessonRepository.save(Lesson.builder().chapter(chap8).lessonNumber(41).lessonName("Biểu diễn lực").build());
        lessonRepository.save(Lesson.builder().chapter(chap8).lessonNumber(42).lessonName("Biến dạng của lò xo").build());
        lessonRepository.save(Lesson.builder().chapter(chap8).lessonNumber(43).lessonName("Trọng lực, lực hấp dẫn").build());
        lessonRepository.save(Lesson.builder().chapter(chap8).lessonNumber(44).lessonName("Lực ma sát").build());
        lessonRepository.save(Lesson.builder().chapter(chap8).lessonNumber(45).lessonName("Lực cản của nước").build());

        // Chương 9: Năng lượng
        Chapter chap9 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(6).chapterNumber(9)
                .chapterName("Năng lượng").description("Chương 9: Năng lượng").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(46).lessonName("Năng lượng và sự truyền năng lượng").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(47).lessonName("Một số dạng năng lượng").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(48).lessonName("Sự chuyển hóa năng lượng").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(49).lessonName("Năng lượng hao phí").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(50).lessonName("Năng lượng tái tạo").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(51).lessonName("Tiết kiệm năng lượng").build());

        // Chương 10: Trái đất và bầu trời
        Chapter chap10 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(6).chapterNumber(10)
                .chapterName("Trái đất và bầu trời").description("Chương 10: Trái đất và bầu trời").build());
        lessonRepository.save(Lesson.builder().chapter(chap10).lessonNumber(52).lessonName("Chuyển động nhìn thấy của Mặt Trời. Thiên thể").build());
        lessonRepository.save(Lesson.builder().chapter(chap10).lessonNumber(53).lessonName("Mặt Trăng").build());
        lessonRepository.save(Lesson.builder().chapter(chap10).lessonNumber(54).lessonName("Hệ Mặt Trời").build());
        lessonRepository.save(Lesson.builder().chapter(chap10).lessonNumber(55).lessonName("Ngân hà").build());
    }
}