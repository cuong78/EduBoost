package com.fptu.eduBoostBackend.initializer;

import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.repositories.*;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ScienceGrade7Initializer {

    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;

    public void init() {
        Subject sc = subjectRepository.findBySubjectCode("SCI").orElse(null);
        if (sc == null) return;

        // Bài mở đầu
        Chapter intro = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(7).chapterNumber(1)
                .chapterName("Bài mở đầu").description("Bài mở đầu: Phương pháp và kĩ năng học tập môn Khoa học tự nhiên").build());
        lessonRepository.save(Lesson.builder().chapter(intro).lessonNumber(1)
                .lessonName("Phương pháp và kĩ năng học tập môn Khoa học tự nhiên").build());

        // Chương 1: Nguyên tử. Sơ lược về bảng tuần hoàn các nguyên tố hóa học
        Chapter chap1 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(7).chapterNumber(2)
                .chapterName("Nguyên tử. Sơ lược về bảng tuần hoàn các nguyên tố hóa học")
                .description("Chương 1: Nguyên tử. Sơ lược về bảng tuần hoàn các nguyên tố hóa học").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(2)
                .lessonName("Nguyên tử").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(3)
                .lessonName("Nguyên tố hóa học").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(4)
                .lessonName("Sơ lược về bảng tuần hoàn nguyên tố hóa học").build());

        // Chương 2: Phân tử. Liên kết hóa học
        Chapter chap2 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(7).chapterNumber(3)
                .chapterName("Phân tử. Liên kết hóa học")
                .description("Chương 2: Phân tử. Liên kết hóa học").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(5)
                .lessonName("Phân tử - Đơn chất - Hợp chất").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(6)
                .lessonName("Giới thiệu về liên kết hóa học").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(7)
                .lessonName("Hóa trị và công thức hóa học").build());

        // Chương 3: Tốc độ
        Chapter chap3 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(7).chapterNumber(4)
                .chapterName("Tốc độ").description("Chương 3: Tốc độ").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(8)
                .lessonName("Tốc độ ánh sáng").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(9)
                .lessonName("Đo tốc độ").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(10)
                .lessonName("Đồ thị quãng đường - thời gian").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(11)
                .lessonName("Thảo luận về ảnh hưởng của tốc độ trong an toàn giao thông").build());

        // Chương 4: Âm thanh
        Chapter chap4 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(7).chapterNumber(5)
                .chapterName("Âm thanh").description("Chương 4: Âm thanh").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(12)
                .lessonName("Sóng âm").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(13)
                .lessonName("Độ to và độ cao của âm").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(14)
                .lessonName("Phản xạ âm, chống ô nhiễm tiếng ồn").build());

        // Chương 5: Ánh sáng
        Chapter chap5 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(7).chapterNumber(6)
                .chapterName("Ánh sáng").description("Chương 5: Ánh sáng").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(15)
                .lessonName("Năng lượng ánh sáng. Tia sáng, vùng tối").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(16)
                .lessonName("Sự phản xạ ánh sáng").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(17)
                .lessonName("Ảnh của vật qua gương phẳng").build());

        // Chương 6: Từ
        Chapter chap6 = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(7).chapterNumber(7)
                .chapterName("Từ").description("Chương 6: Từ").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(18)
                .lessonName("Nam châm").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(19)
                .lessonName("Từ trường").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(20)
                .lessonName("Chế tạo nam châm điện đơn giản").build());

        // Chương 7: Trao đổi chất và chuyển hóa năng lượng ở sinh vật
        Chapter chap7b = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(7).chapterNumber(8)
                .chapterName("Trao đổi chất và chuyển hóa năng lượng ở sinh vật")
                .description("Chương 7: Trao đổi chất và chuyển hóa năng lượng ở sinh vật").build());
        lessonRepository.save(Lesson.builder().chapter(chap7b).lessonNumber(21)
                .lessonName("Khái quát về trao đổi chất và chuyển hóa năng lượng").build());
        lessonRepository.save(Lesson.builder().chapter(chap7b).lessonNumber(22)
                .lessonName("Quang hợp ở thực vật").build());
        lessonRepository.save(Lesson.builder().chapter(chap7b).lessonNumber(23)
                .lessonName("Một số yếu tố ảnh hưởng đến quang hợp").build());
        lessonRepository.save(Lesson.builder().chapter(chap7b).lessonNumber(24)
                .lessonName("Hô hấp tế bào").build());
        lessonRepository.save(Lesson.builder().chapter(chap7b).lessonNumber(25)
                .lessonName("Một số yếu tố ảnh hưởng đến hô hấp tế bào").build());
        lessonRepository.save(Lesson.builder().chapter(chap7b).lessonNumber(26)
                .lessonName("Trao đổi khí ở sinh vật").build());
        lessonRepository.save(Lesson.builder().chapter(chap7b).lessonNumber(27)
                .lessonName("Vai trò của nước và chất dinh dưỡng ở thực vật").build());
        lessonRepository.save(Lesson.builder().chapter(chap7b).lessonNumber(28)
                .lessonName("Trao đổi nước và chất dinh dưỡng ở thực vật").build());
        lessonRepository.save(Lesson.builder().chapter(chap7b).lessonNumber(29)
                .lessonName("Trao đổi nước và chất dinh dưỡng ở động vật").build());

        // Chương 8: Cảm ứng ở sinh vật
        Chapter chap8b = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(7).chapterNumber(9)
                .chapterName("Cảm ứng ở sinh vật").description("Chương 8: Cảm ứng ở sinh vật").build());
        lessonRepository.save(Lesson.builder().chapter(chap8b).lessonNumber(30)
                .lessonName("Cảm ứng ở sinh vật và tập tính ở động vật").build());
        lessonRepository.save(Lesson.builder().chapter(chap8b).lessonNumber(31)
                .lessonName("Vận dụng cảm ứng ở sinh vật vào thực tiễn").build());

        // Chương 9: Sinh trưởng và phát triển ở sinh vật
        Chapter chap9b = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(7).chapterNumber(10)
                .chapterName("Sinh trưởng và phát triển ở sinh vật")
                .description("Chương 9: Sinh trưởng và phát triển ở sinh vật").build());
        lessonRepository.save(Lesson.builder().chapter(chap9b).lessonNumber(32)
                .lessonName("Khát quát về sinh trưởng và phát triển ở sinh vật").build());
        lessonRepository.save(Lesson.builder().chapter(chap9b).lessonNumber(33)
                .lessonName("Ứng dụng sinh trưởng và phát triển ở sinh vật vào thực tiễn").build());

        // Chương 10: Sinh sản ở sinh vật
        Chapter chap10b = chapterRepository.save(Chapter.builder().subject(sc).gradeLevel(7).chapterNumber(11)
                .chapterName("Sinh sản ở sinh vật").description("Chương 10: Sinh sản ở sinh vật").build());
        lessonRepository.save(Lesson.builder().chapter(chap10b).lessonNumber(34)
                .lessonName("Sinh sản vô tính ở sinh vật").build());
        lessonRepository.save(Lesson.builder().chapter(chap10b).lessonNumber(35)
                .lessonName("Sinh sản hữu tính ở sinh vật").build());
        lessonRepository.save(Lesson.builder().chapter(chap10b).lessonNumber(36)
                .lessonName("Một số yếu tố ảnh hưởng và điều hòa, điều khiển sinh sản ở sinh vật").build());
        lessonRepository.save(Lesson.builder().chapter(chap10b).lessonNumber(37)
                .lessonName("Cơ thể sinh vật là một thể thống nhất").build());
    }
}