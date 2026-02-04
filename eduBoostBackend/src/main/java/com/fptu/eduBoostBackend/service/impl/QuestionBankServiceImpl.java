package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.dto.request.QuestionBankRequest;
import com.fptu.eduBoostBackend.dto.response.QuestionBankImportResponse;
import com.fptu.eduBoostBackend.dto.response.QuestionBankResponse;
import com.fptu.eduBoostBackend.dto.response.QuestionBankStatsResponse;
import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.entities.enums.DifficultyLevel;
import com.fptu.eduBoostBackend.entities.enums.QuestionSourceType;
import com.fptu.eduBoostBackend.exception.exceptions.BadRequestException;
import com.fptu.eduBoostBackend.exception.exceptions.ResourceNotFoundException;
import com.fptu.eduBoostBackend.repositories.*;
import com.fptu.eduBoostBackend.service.ExcelImportService;
import com.fptu.eduBoostBackend.service.QuestionBankService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuestionBankServiceImpl implements QuestionBankService {

    private final QuestionBankRepository questionBankRepository;
    private final LessonRepository lessonRepository;
    private final CognitiveLevelRepository cognitiveLevelRepository;
    private final UserRepository userRepository;
    private final ExcelImportService excelImportService;

    @Override
    @Transactional(readOnly = true)
    public List<QuestionBankResponse> getQuestions(Long lessonId, Long cognitiveLevelId, QuestionSourceType sourceType) {
        log.info("Fetching questions with filters - lessonId: {}, cognitiveLevelId: {}, sourceType: {}",
                lessonId, cognitiveLevelId, sourceType);

        List<QuestionBank> questions = questionBankRepository.findWithFilters(lessonId, cognitiveLevelId, sourceType);
        return questions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public QuestionBankResponse getQuestionById(Long id) {
        log.info("Fetching question with id: {}", id);
        QuestionBank question = questionBankRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));
        return mapToResponse(question);
    }

    @Override
    @Transactional
    public QuestionBankResponse createQuestion(QuestionBankRequest request) {
        log.info("Creating question for lesson: {}", request.getLessonId());

        // Get current user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        // Validate lesson
        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + request.getLessonId()));

        // Validate cognitive level
        CognitiveLevel cognitiveLevel = cognitiveLevelRepository.findById(request.getCognitiveLevelId())
                .orElseThrow(() -> new ResourceNotFoundException("Cognitive level not found with id: " + request.getCognitiveLevelId()));

        // Create question
        QuestionBank question = QuestionBank.builder()
                .lesson(lesson)
                .questionText(request.getQuestionText())
                .correctAnswer(request.getCorrectAnswer())
                .explanation(request.getExplanation())
                .questionType(request.getQuestionType())
                .cognitiveLevel(cognitiveLevel)
                .difficultyLevel(request.getDifficultyLevel() != null ? request.getDifficultyLevel() : DifficultyLevel.MEDIUM)
                .sourceType(request.getSourceType() != null ? request.getSourceType() : QuestionSourceType.MANUAL)
                .createdBy(currentUser)
                .usageCount(0)
                .build();

        question = questionBankRepository.save(question);
        return mapToResponse(question);
    }

    @Override
    @Transactional
    public QuestionBankResponse updateQuestion(Long id, QuestionBankRequest request) {
        log.info("Updating question with id: {}", id);

        QuestionBank question = questionBankRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));

        // Get current user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        // Check if user can edit (created by user or admin)
        if (!question.getCreatedBy().getUserId().equals(currentUser.getUserId()) && 
            !currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new BadRequestException("You can only edit questions you created");
        }

        // Update fields
        if (request.getLessonId() != null) {
            Lesson lesson = lessonRepository.findById(request.getLessonId())
                    .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + request.getLessonId()));
            question.setLesson(lesson);
        }

        if (request.getQuestionText() != null) {
            question.setQuestionText(request.getQuestionText());
        }
        if (request.getCorrectAnswer() != null) {
            question.setCorrectAnswer(request.getCorrectAnswer());
        }
        if (request.getExplanation() != null) {
            question.setExplanation(request.getExplanation());
        }
        if (request.getQuestionType() != null) {
            question.setQuestionType(request.getQuestionType());
        }
        if (request.getCognitiveLevelId() != null) {
            CognitiveLevel cognitiveLevel = cognitiveLevelRepository.findById(request.getCognitiveLevelId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cognitive level not found with id: " + request.getCognitiveLevelId()));
            question.setCognitiveLevel(cognitiveLevel);
        }
        if (request.getDifficultyLevel() != null) {
            question.setDifficultyLevel(request.getDifficultyLevel());
        }
        if (request.getSourceType() != null) {
            question.setSourceType(request.getSourceType());
        }

        question = questionBankRepository.save(question);
        return mapToResponse(question);
    }

    @Override
    @Transactional
    public void deleteQuestion(Long id) {
        log.info("Deleting question with id: {}", id);

        QuestionBank question = questionBankRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));

        // Get current user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        // Check if user can delete (created by user or admin)
        if (!question.getCreatedBy().getUserId().equals(currentUser.getUserId()) && 
            !currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new BadRequestException("You can only delete questions you created");
        }

        questionBankRepository.delete(question);
    }

    @Override
    @Transactional
    public QuestionBankImportResponse importFromExcel(MultipartFile file, Long lessonId) {
        log.info("Importing questions from Excel file for lesson: {}", lessonId);
        return excelImportService.parseExcelFile(file, lessonId);
    }

    @Override
    public Resource downloadTemplate() {
        log.info("Generating Excel template for question import");
        
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Question Import Template");
            
            // Create header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 12);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);
            
            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Câu hỏi", "Câu trả lời", "Giải thích", "Dạng câu hỏi"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Create example style
            CellStyle exampleStyle = workbook.createCellStyle();
            exampleStyle.setBorderBottom(BorderStyle.THIN);
            exampleStyle.setBorderTop(BorderStyle.THIN);
            exampleStyle.setBorderLeft(BorderStyle.THIN);
            exampleStyle.setBorderRight(BorderStyle.THIN);
            exampleStyle.setWrapText(true);
            
            // Add example rows
            String[][] examples = {
                {"Tìm $x$ sao cho $2x + 5 = 15$", "$x = 5$", "$2x = 15 - 5 = 10$, suy ra $x = 5$", "MULTIPLE_CHOICE"},
                {"Việt Nam độc lập năm nào?", "1945", "Ngày 2/9/1945, Bác Hồ đọc Tuyên ngôn độc lập", "MULTIPLE_CHOICE"},
                {"Nước sôi ở 100°C là đúng hay sai?", "Đúng", "Ở áp suất khí quyển tiêu chuẩn", "TRUE_FALSE"},
                {"Thủ đô của Pháp là ___", "Paris", "", "FILL_BLANK"},
                {"Cho tam giác ABC với $AB = 3$, $BC = 4$, $AC = 5$. Tính diện tích?", "$S = 6$", "Tam giác vuông tại B, $S = \\frac{1}{2} \\times 3 \\times 4 = 6$", "MULTIPLE_CHOICE"}
            };
            
            for (int i = 0; i < examples.length; i++) {
                Row row = sheet.createRow(i + 1);
                for (int j = 0; j < examples[i].length; j++) {
                    Cell cell = row.createCell(j);
                    cell.setCellValue(examples[i][j]);
                    cell.setCellStyle(exampleStyle);
                }
            }
            
            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.setColumnWidth(i, 8000); // ~30 characters width
            }
            sheet.setColumnWidth(0, 15000); // Wider for question text
            sheet.setColumnWidth(2, 12000); // Wider for explanation
            
            // Write to ByteArrayOutputStream
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            
            return new ByteArrayResource(outputStream.toByteArray());
            
        } catch (IOException e) {
            log.error("Error generating Excel template", e);
            throw new RuntimeException("Error generating Excel template: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public QuestionBankStatsResponse getStats(Long subjectId, Integer gradeLevel) {
        log.info("Getting question bank statistics - subjectId: {}, gradeLevel: {}", subjectId, gradeLevel);

        // This is a simplified version - can be enhanced with more detailed queries
        long totalQuestions = subjectId != null 
                ? questionBankRepository.countBySubjectId(subjectId)
                : questionBankRepository.count();
        
        long aiGeneratedCount = questionBankRepository.countAiGenerated();

        // Simplified stats - can be enhanced
        Map<String, Long> byLesson = new HashMap<>();
        Map<String, Long> byCognitiveLevel = new HashMap<>();
        Map<String, Long> byDifficultyLevel = new HashMap<>();

        return QuestionBankStatsResponse.builder()
                .totalQuestions(totalQuestions)
                .byLesson(byLesson)
                .byCognitiveLevel(byCognitiveLevel)
                .byDifficultyLevel(byDifficultyLevel)
                .aiGeneratedCount(aiGeneratedCount)
                .build();
    }

    @Override
    @Transactional
    public List<QuestionBankResponse> createQuestionsBatch(List<QuestionBankRequest> requests) {
        log.info("Creating {} questions in batch", requests.size());

        // Get current user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        List<QuestionBank> questions = requests.stream().map(request -> {
            Lesson lesson = lessonRepository.findById(request.getLessonId())
                    .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + request.getLessonId()));

            CognitiveLevel cognitiveLevel = cognitiveLevelRepository.findById(request.getCognitiveLevelId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cognitive level not found with id: " + request.getCognitiveLevelId()));

            return QuestionBank.builder()
                    .lesson(lesson)
                    .questionText(request.getQuestionText())
                    .correctAnswer(request.getCorrectAnswer())
                    .explanation(request.getExplanation())
                    .questionType(request.getQuestionType())
                    .cognitiveLevel(cognitiveLevel)
                    .difficultyLevel(request.getDifficultyLevel() != null ? request.getDifficultyLevel() : DifficultyLevel.MEDIUM)
                    .sourceType(request.getSourceType() != null ? request.getSourceType() : QuestionSourceType.IMPORTED)
                    .createdBy(currentUser)
                    .usageCount(0)
                    .build();
        }).collect(Collectors.toList());

        questions = questionBankRepository.saveAll(questions);
        return questions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private QuestionBankResponse mapToResponse(QuestionBank question) {
        return QuestionBankResponse.builder()
                .id(question.getId())
                .lessonId(question.getLesson().getId())
                .lessonName("Bài " + question.getLesson().getLessonNumber() + ": " + question.getLesson().getLessonName())
                .questionText(question.getQuestionText())
                .correctAnswer(question.getCorrectAnswer())
                .explanation(question.getExplanation())
                .questionType(question.getQuestionType())
                .cognitiveLevelId(question.getCognitiveLevel().getId())
                .cognitiveLevel(question.getCognitiveLevel().getLevel())
                .difficultyLevel(question.getDifficultyLevel())
                .sourceType(question.getSourceType())
                .sourceReference(question.getSourceReference())
                .createdById(question.getCreatedBy().getUserId())
                .createdByName(question.getCreatedBy().getFullName())
                .usageCount(question.getUsageCount())
                .createdAt(question.getCreatedAt())
                .updatedAt(question.getUpdatedAt())
                .build();
    }
}
