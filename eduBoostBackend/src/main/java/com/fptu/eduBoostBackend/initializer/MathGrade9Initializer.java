package com.fptu.eduBoostBackend.initializer;

import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.repositories.*;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MathGrade9Initializer {

    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;

    public void init() {
        Subject math = subjectRepository.findBySubjectCode("TOAN").orElse(null);
        if (math == null) return;

        // Chương 1: Phương trình và hệ hai phương trình bậc nhất hai ẩn
        Chapter chap1 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(9).chapterNumber(1)
                .chapterName("Phương trình và hệ hai phương trình bậc nhất hai ẩn")
                .description("Chương 1: Phương trình và hệ hai phương trình bậc nhất hai ẩn").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(1)
                .lessonName("Khái niệm phương trình và hệ hai phương trình bậc nhất hai ẩn").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(2)
                .lessonName("Giải hệ hai phương trình bậc nhất hai ẩn").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(3)
                .lessonName("Giải bài toán bằng cách lập hệ phương trình").build());

        // Chương 2: Phương trình và bất phương trình bậc nhất một ẩn
        Chapter chap2 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(9).chapterNumber(2)
                .chapterName("Phương trình và bất phương trình bậc nhất một ẩn")
                .description("Chương 2: Phương trình và bất phương trình bậc nhất một ẩn").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(4)
                .lessonName("Phương trình quy về phương trình bậc nhất một ẩn").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(5)
                .lessonName("Bất đẳng thức và tính chất").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(6)
                .lessonName("Bất phương trình bậc nhất một ẩn").build());

        // Chương 3: Căn bậc hai và căn bậc ba
        Chapter chap3 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(9).chapterNumber(3)
                .chapterName("Căn bậc hai và căn bậc ba")
                .description("Chương 3: Căn bậc hai và căn bậc ba").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(7)
                .lessonName("Căn bậc hai và căn thức bậc hai").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(8)
                .lessonName("Khai căn bậc hai với phép nhân và phép chia").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(9)
                .lessonName("Biến đổi đơn giản và rút gọn biểu thức chứa căn thức bậc hai").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(10)
                .lessonName("Căn bậc ba và căn thức bậc ba").build());

        // Chương 4: Hệ thức lượng trong tam giác vuông
        Chapter chap4 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(9).chapterNumber(4)
                .chapterName("Hệ thức lượng trong tam giác vuông")
                .description("Chương 4: Hệ thức lượng trong tam giác vuông").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(11)
                .lessonName("Tỉ số lượng giác của góc nhọn").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(12)
                .lessonName("Một số hệ thức giữa cạnh, góc trong tam giác vuông và ứng dụng").build());

        // Chương 5: Đường tròn
        Chapter chap5 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(9).chapterNumber(5)
                .chapterName("Đường tròn")
                .description("Chương 5: Đường tròn").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(13)
                .lessonName("Mở đầu về đường tròn").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(14)
                .lessonName("Cung và dây của một đường tròn").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(15)
                .lessonName("Độ dài của cung tròn. Diện tích hình quạt tròn và hình vành khuyên").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(16)
                .lessonName("Vị trí tương đối của đường thẳng và đường tròn").build());
        lessonRepository.save(Lesson.builder().chapter(chap5).lessonNumber(17)
                .lessonName("Vị trí tương đối của hai đường tròn").build());

        // Chương 6: Hàm số y = ax^2 (a ≠ 0). Phương trình bậc hai một ẩn
        Chapter chap6 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(9).chapterNumber(6)
                .chapterName("Hàm số y = ax^2 (a ≠ 0). Phương trình bậc hai một ẩn")
                .description("Chương 6: Hàm số y = ax^2 (a ≠ 0). Phương trình bậc hai một ẩn").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(18)
                .lessonName("Hàm số y = ax^2 (a ≠ 0)").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(19)
                .lessonName("Phương trình bậc hai một ẩn").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(20)
                .lessonName("Định lí Viète và ứng dụng").build());
        lessonRepository.save(Lesson.builder().chapter(chap6).lessonNumber(21)
                .lessonName("Giải bài toán bằng cách lập phương trình").build());

        // Chương 7: Tần số và tần số tương đối
        Chapter chap7 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(9).chapterNumber(7)
                .chapterName("Tần số và tần số tương đối")
                .description("Chương 7: Tần số và tần số tương đối").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(22)
                .lessonName("Bảng tần số và biểu đồ tần số").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(23)
                .lessonName("Bảng tần số tương đối và biểu đồ tần số tương đối").build());
        lessonRepository.save(Lesson.builder().chapter(chap7).lessonNumber(24)
                .lessonName("Bảng tần số, tần số tương đối ghép nhóm và biểu đồ").build());

        // Chương 8: Xác suất của biến cố trong một số mô hình xác suất đơn giản
        Chapter chap8 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(9).chapterNumber(8)
                .chapterName("Xác suất của biến cố trong một số mô hình xác suất đơn giản")
                .description("Chương 8: Xác suất của biến cố trong một số mô hình xác suất đơn giản").build());
        lessonRepository.save(Lesson.builder().chapter(chap8).lessonNumber(25)
                .lessonName("Phép thử ngẫu nhiên và không gian mẫu").build());
        lessonRepository.save(Lesson.builder().chapter(chap8).lessonNumber(26)
                .lessonName("Xác suất của biến cố liên quan tới phép thử").build());

        // Chương 9: Đường tròn ngoại tiếp và đường tròn nội tiếp
        Chapter chap9 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(9).chapterNumber(9)
                .chapterName("Đường tròn ngoại tiếp và đường tròn nội tiếp")
                .description("Chương 9: Đường tròn ngoại tiếp và đường tròn nội tiếp").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(27)
                .lessonName("Góc nội tiếp").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(28)
                .lessonName("Đường tròn ngoại tiếp và đường tròn nội tiếp của một tam giác").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(29)
                .lessonName("Tứ giác nội tiếp").build());
        lessonRepository.save(Lesson.builder().chapter(chap9).lessonNumber(30)
                .lessonName("Đa giác đều").build());

        // Chương 10: Một số hình khối trong thực tiễn
        Chapter chap10 = chapterRepository.save(Chapter.builder().subject(math).gradeLevel(9).chapterNumber(10)
                .chapterName("Một số hình khối trong thực tiễn")
                .description("Chương 10: Một số hình khối trong thực tiễn").build());
        lessonRepository.save(Lesson.builder().chapter(chap10).lessonNumber(31)
                .lessonName("Hình trụ và hình nón").build());
        lessonRepository.save(Lesson.builder().chapter(chap10).lessonNumber(32)
                .lessonName("Hình cầu").build());
    }
}