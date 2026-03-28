package com.fptu.eduBoostBackend.initializer;

import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.repositories.*;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PhysicsGrade9Initializer {

    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;

    public void init() {
        Subject physics = subjectRepository.findBySubjectCode("LY").orElse(null);
        if (physics == null) return;

        // Chương 1: Điện học
        Chapter chap1 = chapterRepository.save(Chapter.builder().subject(physics).gradeLevel(9).chapterNumber(1)
                .chapterName("Điện học").description("Chương 1: Điện học").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(1)
                .lessonName("Sự phụ thuộc của cường độ dòng điện vào hiệu điện thế giữa hai đầu dây dẫn").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(2)
                .lessonName("Điện trở của dây dẫn - Định luật Ôm").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(4)
                .lessonName("Đoạn mạch nối tiếp").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(5)
                .lessonName("Đoạn mạch song song").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(6)
                .lessonName("Bài tập vận dụng định luật Ôm").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(7)
                .lessonName("Sự phụ thuộc của điện trở vào chiều dài dây dẫn").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(8)
                .lessonName("Sự phụ thuộc của điện trở vào tiết diện dây dẫn").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(9)
                .lessonName("Sự phụ thuộc của điện trở vào vật liệu làm dây dẫn").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(10)
                .lessonName("Biến trở - Điện trở dùng trong kĩ thuật").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(11)
                .lessonName("Bài tập vận dụng định luật Ôm và công thức tính điện trở của dây dẫn").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(12)
                .lessonName("Công suất điện").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(13)
                .lessonName("Điện năng - Công của dòng điện").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(14)
                .lessonName("Bài tập về công suất điện và điện năng sử dụng").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(16)
                .lessonName("Định luật Jun - Lenxo").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(17)
                .lessonName("Bài tập vận dụng định luật Jun - Lenxo").build());
        lessonRepository.save(Lesson.builder().chapter(chap1).lessonNumber(19)
                .lessonName("Sử dụng an toàn và tiết kiệm điện").build());

        // Chương 2: Điện từ học
        Chapter chap2 = chapterRepository.save(Chapter.builder().subject(physics).gradeLevel(9).chapterNumber(2)
                .chapterName("Điện từ học").description("Chương 2: Điện từ học").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(21)
                .lessonName("Nam châm vĩnh cửu").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(22)
                .lessonName("Tác dụng từ của dòng điện - Từ trường").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(23)
                .lessonName("Từ phổ - Đường sức từ").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(24)
                .lessonName("Từ trường của ống dây có dòng điện chạy qua").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(25)
                .lessonName("Sự nhiễm từ của sắt, thép - Nam châm điện").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(26)
                .lessonName("Ứng dụng của nam châm").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(27)
                .lessonName("Lực điện từ").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(28)
                .lessonName("Động cơ điện một chiều").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(30)
                .lessonName("Bài tập vận dụng quy tắc nắm tay phải và quy tắc bàn tay trái").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(31)
                .lessonName("Hiện tượng cảm ứng điện từ").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(32)
                .lessonName("Điều kiện xuất hiện dòng điện cảm ứng").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(33)
                .lessonName("Dòng điện xoay chiều").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(34)
                .lessonName("Máy phát điện xoay chiều").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(35)
                .lessonName("Các tác dụng của dòng điện xoay chiều - Đo cường độ và hiệu điện thế xoay chiều").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(36)
                .lessonName("Truyền tải điện năng đi xa").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(37)
                .lessonName("Máy biến thế").build());
        lessonRepository.save(Lesson.builder().chapter(chap2).lessonNumber(39)
                .lessonName("Tổng kết chương II : Điện từ học").build());

        // Chương 3: Quang học
        Chapter chap3 = chapterRepository.save(Chapter.builder().subject(physics).gradeLevel(9).chapterNumber(3)
                .chapterName("Quang học").description("Chương 3: Quang học").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(40)
                .lessonName("Hiện tượng khúc xạ ánh sáng").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(41)
                .lessonName("Quan hệ giữa góc tới và góc khúc xạ").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(42)
                .lessonName("Thấu kính hội tụ").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(43)
                .lessonName("Ảnh của một vật tạo bởi thấu kính hội tụ").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(44)
                .lessonName("Thấu kính phân kì").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(45)
                .lessonName("Ảnh của một vật tạo bởi thấu kính phân kì").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(47)
                .lessonName("Sự tạo ảnh trong máy ảnh").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(48)
                .lessonName("Mắt").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(49)
                .lessonName("Mắt cận và mắt lão").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(50)
                .lessonName("Kính lúp").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(51)
                .lessonName("Bài tập quang hình học").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(52)
                .lessonName("Ánh sáng trắng và ánh sáng màu").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(53)
                .lessonName("Sự phân tích ánh sáng trắng").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(54)
                .lessonName("Sự trộn các ánh sáng màu").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(55)
                .lessonName("Màu sắc các vật dưới ánh sáng trắng và dưới ánh sáng màu").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(56)
                .lessonName("Các tác dụng của ánh sáng").build());
        lessonRepository.save(Lesson.builder().chapter(chap3).lessonNumber(58)
                .lessonName("Tổng kết chương III : Quang học").build());

        // Chương 4: Sự bảo toàn và chuyển hóa năng lượng
        Chapter chap4 = chapterRepository.save(Chapter.builder().subject(physics).gradeLevel(9).chapterNumber(4)
                .chapterName("Sự bảo toàn và chuyển hóa năng lượng")
                .description("Chương 4: Sự bảo toàn và chuyển hóa năng lượng").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(59)
                .lessonName("Năng lượng và sự chuyển hóa năng lượng").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(60)
                .lessonName("Định luật bảo toàn năng lượng").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(61)
                .lessonName("Sản xuất điện năng - nhiệt điện và thủy điện").build());
        lessonRepository.save(Lesson.builder().chapter(chap4).lessonNumber(62)
                .lessonName("Điện gió - Điện mặt trời - Điện hạt nhân").build());
    }
}
