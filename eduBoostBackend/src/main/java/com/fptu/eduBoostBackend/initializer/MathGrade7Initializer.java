package com.fptu.eduBoostBackend.initializer;

import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.repositories.*;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MathGrade7Initializer {

    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;

    public void init() {
        Subject math = subjectRepository.findBySubjectCode("TOAN").orElse(null);
        if (math == null) return;

        // Chương 1: Số hữu tỉ
        Chapter chap1 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(7).chapterNumber(1)
                .chapterName("Số hữu tỉ").description("Chương 1: Số hữu tỉ").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(1)
                .lessonName("Tập hợp các số hữu tỉ").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(2)
                .lessonName("Cộng, trừ, nhân, chia số hữu tỉ").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(3)
                .lessonName("Lũy thừa với số mũ tự nhiên của một số hữu tỉ").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(4)
                .lessonName("Thứ tự thực hiện các phép tính. Quy tắc chuyển vế").build());

        // Chương 2: Số thực
        Chapter chap2 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(7).chapterNumber(2)
                .chapterName("Số thực").description("Chương 2: Số thực").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(5)
                .lessonName("Làm quen với số thập phân vô hạn tuần hoàn").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(6)
                .lessonName("Số vô tỉ. Căn bậc hai số học").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(7)
                .lessonName("Tập hợp các số thực").build());

        // Chương 3: Góc và đường thẳng song song
        Chapter chap3 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(7).chapterNumber(3)
                .chapterName("Góc và đường thẳng song song").description("Chương 3: Góc và đường thẳng song song").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(8)
                .lessonName("Góc ở vị trí đặc biệt. Tia phân giác của một góc").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(9)
                .lessonName("Hai đường thẳng song song và dấu hiệu nhận biết").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(10)
                .lessonName("Tiên đề Euclid. Tính chất của hai đường thẳng song song").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(11)
                .lessonName("Định lí và chứng minh định lí").build());

        // Chương 4: Tam giác bằng nhau
        Chapter chap4 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(7).chapterNumber(4)
                .chapterName("Tam giác bằng nhau").description("Chương 4: Tam giác bằng nhau").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(12)
                .lessonName("Tổng các góc trong một tam giác").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(13)
                .lessonName("Hai tam giác bằng nhau. Trường hợp bằng nhau thứ nhất của tam giác").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(14)
                .lessonName("Trường hợp bằng nhau thứ hai và thứ ba của tam giác").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(15)
                .lessonName("Các trường hợp bằng nhau của tam giác vuông").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(16)
                .lessonName("Tam giác cân. Đường trung trực của đoạn thẳng").build());

        // Chương 6: Tỉ lệ thức và đại lượng tỉ lệ
        Chapter chap6 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(7).chapterNumber(6)
                .chapterName("Tỉ lệ thức và đại lượng tỉ lệ").description("Chương 6: Tỉ lệ thức và đại lượng tỉ lệ").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(17)
                .lessonName("Tỉ lệ thức").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(18)
                .lessonName("Tính chất của dãy tỉ số bằng nhau").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(19)
                .lessonName("Đại lượng tỉ lệ thuận").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(20)
                .lessonName("Đại lượng tỉ lệ nghịch").build());

        // Chương 7: Biểu thức đại số và đa thức một biến
        Chapter chap7 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(7).chapterNumber(7)
                .chapterName("Biểu thức đại số và đa thức một biến").description("Chương 7: Biểu thức đại số và đa thức một biến").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(21)
                .lessonName("Biểu thức đại số").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(22)
                .lessonName("Đa thức một biến").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(23)
                .lessonName("Phép cộng và phép trừ đa thức một biến").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(24)
                .lessonName("Phép nhân đa thức một biến").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(25)
                .lessonName("Phép chia đa thức một biến").build());

        // Chương 8: Làm quen với biến cố và xác suất của biến cố
        Chapter chap8 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(7).chapterNumber(8)
                .chapterName("Làm quen với biến cố và xác suất của biến cố").description("Chương 8: Làm quen với biến cố và xác suất của biến cố").build());
        lessonRepository.save(Lesson.builder().chapter(chap8).lessonNumber(26)
                .lessonName("Làm quen với biến cố").build());
        lessonRepository.save(Lesson.builder().chapter(chap8).lessonNumber(27)
                .lessonName("Làm quen với xác suất của biến cố").build());

        // Chương 9: Quan hệ giữa các yếu tố trong một tam giác
        Chapter chap9 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(7).chapterNumber(9)
                .chapterName("Quan hệ giữa các yếu tố trong một tam giác").description("Chương 9: Quan hệ giữa các yếu tố trong một tam giác").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(28)
                .lessonName("Quan hệ giữa góc và cạnh đối diện trong một tam giác").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(29)
                .lessonName("Quan hệ giữa đường vuông góc và đường xiên").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(30)
                .lessonName("Quan hệ giữa ba cạnh của một tam giác").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(31)
                .lessonName("Sự đồng quy của ba đường trung tuyến, ba đường phân giác trong một tam giác").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(32)
                .lessonName("Sự đồng quy của ba đường trung trực, ba đường cao trong một tam giác").build());

        // Chương 10: Một số hình khối trong thực tiễn
        Chapter chap10 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(7).chapterNumber(10)
                .chapterName("Một số hình khối trong thực tiễn").description("Chương 10: Một số hình khối trong thực tiễn").build());
        lessonRepository.save(Lesson.builder().chapter(chap10).lessonNumber(33)
                .lessonName("Hình hộp chữ nhật và hình lập phương").build());
        lessonRepository.save(Lesson.builder().chapter(chap10).lessonNumber(34)
                .lessonName("Hình lăng trụ đứng tam giác và hình lăng trụ đứng tứ giác").build());
    }
}
