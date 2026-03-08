package com.fptu.eduBoostBackend.initializer;

import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.repositories.*;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SubjectExamInitializer {

    private final SubjectRepository subjectRepository;
    private final CognitiveLevelRepository cognitiveLevelRepository;
    private final ExamTypeRepository examTypeRepository;

    public void init() {
        initializeSubjects();
        initializeCognitiveLevels();
        initializeExamTypes();
    }

    private void initializeSubjects() {
        saveSubjectIfNotExists("TOAN", "Toán học", "Môn Toán học - Bao gồm Đại số, Hình học, Giải tích");
        saveSubjectIfNotExists("LY", "Vật lý", "Môn Vật lý - Nghiên cứu các hiện tượng tự nhiên");
        saveSubjectIfNotExists("HOA", "Hóa học", "Môn Hóa học - Nghiên cứu về chất và phản ứng hóa học");
        // removed English, Sinh, Sử, Địa, GDCD, Tin per request
        // Ngữ văn removed per request
        // remaining science / math subjects below
        saveSubjectIfNotExists("SCI", "Khoa học tự nhiên", "Môn Khoa học tự nhiên - Nghiên cứu về Khoa học tự nhiên");
    }

    private void saveSubjectIfNotExists(String code, String name, String desc) {
        if (!subjectRepository.existsBySubjectCode(code)) {
            subjectRepository.save(Subject.builder()
                    .subjectCode(code)
                    .subjectName(name)
                    .description(desc)
                    .build());
        }
    }

    private void initializeCognitiveLevels() {
        cognitiveLevelRepository.save(CognitiveLevel.builder()
                .level("Nhận biết")
                .description("Học sinh nhận ra, nhớ lại các khái niệm, định nghĩa, công thức, định lý đã học. Yêu cầu tái hiện kiến thức.")
                .displayOrder(1).build());
        cognitiveLevelRepository.save(CognitiveLevel.builder()
                .level("Thông hiểu")
                .description("Học sinh hiểu được ý nghĩa, giải thích, diễn đạt lại kiến thức bằng ngôn ngữ của mình. Có thể suy luận đơn giản.")
                .displayOrder(2).build());
        cognitiveLevelRepository.save(CognitiveLevel.builder()
                .level("Vận dụng")
                .description("Học sinh áp dụng kiến thức để giải quyết các bài tập, tình huống quen thuộc hoặc tương tự.")
                .displayOrder(3).build());
        cognitiveLevelRepository.save(CognitiveLevel.builder()
                .level("Vận dụng cao")
                .description("Học sinh vận dụng kiến thức để giải quyết vấn đề mới, tình huống phức tạp, có tính sáng tạo và tổng hợp.")
                .displayOrder(4).build());
    }

    private void initializeExamTypes() {
        examTypeRepository.save(ExamType.builder().typeCode("15MIN").typeName("Kiểm tra 15 phút")
                .requiresMatrix(false).description("Bài kiểm tra ngắn trong thời gian 15 phút").displayOrder(1).build());
        examTypeRepository.save(ExamType.builder().typeCode("45MIN").typeName("Kiểm tra 1 tiết")
                .requiresMatrix(true).description("Bài kiểm tra 1 tiết, thường yêu cầu ma trận đề").displayOrder(2).build());
        examTypeRepository.save(ExamType.builder().typeCode("MIDTERM").typeName("Kiểm tra giữa kỳ")
                .requiresMatrix(true).description("Bài kiểm tra đánh giá giữa học kỳ").displayOrder(3).build());
        examTypeRepository.save(ExamType.builder().typeCode("FINAL").typeName("Kiểm tra cuối kỳ")
                .requiresMatrix(true).description("Bài kiểm tra tổng kết cuối học kỳ").displayOrder(4).build());
    }
}
