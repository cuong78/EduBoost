package com.fptu.eduBoostBackend.initializer;

import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.entities.enums.LessonResourceType;
import com.fptu.eduBoostBackend.repositories.*;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PhysicsGrade10Initializer {

    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;


    public void init() {
        Subject physics = subjectRepository.findBySubjectCode("LY").orElse(null);
        if (physics == null) return;

        // Chương 1: Mở đầu
        Chapter chap1 = chapterRepository.save(Chapter.builder().subject(physics).gradeLevel(10).chapterNumber(1)
                .chapterName("Mở đầu").description("Chương 1: Mở đầu").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(1)
                .lessonName("Làm quen với Vật lí").description("Giới thiệu về Vật lí và vai trò của Vật lí trong đời sống").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(2)
                .lessonName("Các quy tắc an toàn trong phòng thực hành Vật lí")
                .description("Quy tắc an toàn khi học tập và thực hành Vật lí").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(3)
                .lessonName("Thực hành tính sai số trong phép đo. Ghi kết quả đo")
                .description("Cách xác định sai số và trình bày kết quả đo").build());

        // Chương 2: Động học
        Chapter chap2 = chapterRepository.save(Chapter.builder().subject(physics).gradeLevel(10).chapterNumber(2)
                .chapterName("Động học").description("Chương 2: Động học").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(1)
                .lessonName("Độ dịch chuyển và quãng đường đi được").description("Khái niệm độ dịch chuyển và quãng đường").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(2)
                .lessonName("Tốc độ và vận tốc").description("Khái niệm tốc độ và vận tốc").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(3)
                .lessonName("Đồ thị độ dịch chuyển – thời gian").description("Biểu diễn chuyển động bằng đồ thị").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(4)
                .lessonName("Chuyển động biến đổi. Gia tốc").description("Khái niệm chuyển động biến đổi và gia tốc").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(5)
                .lessonName("Chuyển động thẳng biến đổi đều").description("Các công thức của chuyển động thẳng biến đổi đều").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(6)
                .lessonName("Sự rơi tự do").description("Chuyển động rơi tự do và các đặc điểm").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(7)
                .lessonName("Chuyển động ném").description("Chuyển động ném ngang và ném xiên").build());

        // Chương 3: Động lực học
        Chapter chap3 = chapterRepository.save(Chapter.builder().subject(physics).gradeLevel(10).chapterNumber(3)
                .chapterName("Động lực học").description("Chương 3: Động lực học").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(1)
                .lessonName("Tổng hợp và phân tích lực. Cân bằng lực")
                .description("Cách tổng hợp, phân tích lực và điều kiện cân bằng").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(2)
                .lessonName("Định luật I Newton").description("Nội dung và ý nghĩa định luật I Newton").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(3)
                .lessonName("Định luật II Newton").description("Mối liên hệ giữa lực, khối lượng và gia tốc").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(4)
                .lessonName("Định luật III Newton").description("Lực và phản lực").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(5)
                .lessonName("Trọng lực và lực căng").description("Trọng lực, lực căng dây").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(6)
                .lessonName("Lực ma sát").description("Các loại lực ma sát và đặc điểm").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(7)
                .lessonName("Lực cản và lực nâng").description("Lực cản của môi trường và lực nâng").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(8)
                .lessonName("Một số ví dụ về cách giải các bài toán thuộc phần động lực học")
                .description("Vận dụng các định luật Newton để giải bài toán").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(9)
                .lessonName("Moment lực. Cân bằng của vật rắn")
                .description("Moment lực và điều kiện cân bằng của vật rắn").build());

        // Chương 4: Năng lượng, công, công suất
        Chapter chap4 = chapterRepository.save(Chapter.builder().subject(physics).gradeLevel(10).chapterNumber(4)
                .chapterName("Năng lượng, công, công suất").description("Chương 4: Năng lượng, công, công suất").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(1)
                .lessonName("Năng lượng. Công cơ học").description("Khái niệm năng lượng và công cơ học").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(2)
                .lessonName("Công suất").description("Khái niệm và công thức tính công suất").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(3)
                .lessonName("Động năng. Thế năng").description("Động năng và thế năng của vật").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(4)
                .lessonName("Cơ năng và định luật bảo toàn cơ năng").description("Cơ năng và định luật bảo toàn").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(5)
                .lessonName("Hiệu suất").description("Khái niệm và cách tính hiệu suất").build());

        // Chương 5: Động lượng
        Chapter chap5 = chapterRepository.save(Chapter.builder().subject(physics).gradeLevel(10).chapterNumber(5)
                .chapterName("Động lượng").description("Chương 5: Động lượng và định luật bảo toàn động lượng").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(1).lessonName("Động lượng").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(2).lessonName("Định luật bảo toàn động lượng").build());

        // Chương 6: Chuyển động tròn
        Chapter chap6 = chapterRepository.save(Chapter.builder().subject(physics).gradeLevel(10).chapterNumber(6)
                .chapterName("Chuyển động tròn").description("Chương 6: Động học và động lực học của chuyển động tròn").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(1).lessonName("Động học của chuyển động tròn đều").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(2).lessonName("Lực hướng tâm và gia tốc hướng tâm").build());

        // Chương 7: Biến dạng của vật rắn. Áp suất chất lỏng
        Chapter chap7 = chapterRepository.save(Chapter.builder().subject(physics).gradeLevel(10).chapterNumber(7)
                .chapterName("Biến dạng của vật rắn. Áp suất chất lỏng")
                .description("Chương 7: Biến dạng vật rắn và các đại lượng áp suất").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(1).lessonName("Biến dạng của vật rắn").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(2).lessonName("Khối lượng riêng. Áp suất chất lỏng").build());
    }


}
