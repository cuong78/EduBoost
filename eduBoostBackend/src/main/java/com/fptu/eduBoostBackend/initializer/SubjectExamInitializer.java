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
        subjectRepository.save(Subject.builder().subjectCode("TOAN").subjectName("Toán học")
                .description("Môn Toán học - Bao gồm Đại số, Hình học, Giải tích").build());
        subjectRepository.save(Subject.builder().subjectCode("LY").subjectName("Vật lý")
                .description("Môn Vật lý - Nghiên cứu các hiện tượng tự nhiên").build());
        subjectRepository.save(Subject.builder().subjectCode("HOA").subjectName("Hóa học")
                .description("Môn Hóa học - Nghiên cứu về chất và phản ứng hóa học").build());
        subjectRepository.save(Subject.builder().subjectCode("ANH").subjectName("Tiếng Anh")
                .description("Môn Tiếng Anh - Ngôn ngữ quốc tế").build());
        subjectRepository.save(Subject.builder().subjectCode("VAN").subjectName("Ngữ văn")
                .description("Môn Ngữ văn - Văn học và tiếng Việt").build());
        subjectRepository.save(Subject.builder().subjectCode("SINH").subjectName("Sinh học")
                .description("Môn Sinh học - Nghiên cứu về sự sống").build());
        subjectRepository.save(Subject.builder().subjectCode("SU").subjectName("Lịch sử")
                .description("Môn Lịch sử - Tìm hiểu quá khứ").build());
        subjectRepository.save(Subject.builder().subjectCode("DIA").subjectName("Địa lý")
                .description("Môn Địa lý - Nghiên cứu về Trái đất").build());
        subjectRepository.save(Subject.builder().subjectCode("GDCD").subjectName("Giáo dục công dân")
                .description("Môn Giáo dục công dân - Đạo đức và pháp luật").build());
        subjectRepository.save(Subject.builder().subjectCode("TIN").subjectName("Tin học")
                .description("Môn Tin học - Công nghệ thông tin").build());
        subjectRepository.save(Subject.builder().subjectCode("SCI").subjectName("Khoa học tự nhiên")
                .description("Môn Khoa học tự nhiên - Nghiên cứu về Khoa học tự nhiên").build());
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
