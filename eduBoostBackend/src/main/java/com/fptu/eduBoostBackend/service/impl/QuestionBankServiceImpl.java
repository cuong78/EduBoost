package com.fptu.eduBoostBackend.service.impl;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.fptu.eduBoostBackend.dto.response.TemplateDownloadResponse;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddressList;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fptu.eduBoostBackend.dto.request.QuestionBankRequest;
import com.fptu.eduBoostBackend.dto.response.QuestionBankImportResponse;
import com.fptu.eduBoostBackend.dto.response.QuestionBankResponse;
import com.fptu.eduBoostBackend.dto.response.QuestionBankStatsResponse;
import com.fptu.eduBoostBackend.entities.CognitiveLevel;
import com.fptu.eduBoostBackend.entities.Lesson;
import com.fptu.eduBoostBackend.entities.QuestionBank;
import com.fptu.eduBoostBackend.entities.User;
import com.fptu.eduBoostBackend.entities.enums.DifficultyLevel;
import com.fptu.eduBoostBackend.entities.enums.QuestionSourceType;
import com.fptu.eduBoostBackend.exception.exceptions.BadRequestException;
import com.fptu.eduBoostBackend.exception.exceptions.ResourceNotFoundException;
import com.fptu.eduBoostBackend.repositories.CognitiveLevelRepository;
import com.fptu.eduBoostBackend.repositories.LessonRepository;
import com.fptu.eduBoostBackend.repositories.QuestionBankRepository;
import com.fptu.eduBoostBackend.repositories.UserRepository;
import com.fptu.eduBoostBackend.service.ExcelImportService;
import com.fptu.eduBoostBackend.service.QuestionBankService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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
    public TemplateDownloadResponse downloadTemplate() throws IOException {

        try (Workbook workbook = new XSSFWorkbook()) {

            Sheet sheet = workbook.createSheet("Question Import Template");

            // ===== Column Index =====

            final int COL_QUESTION_TEXT = 0;
            final int COL_CORRECT_ANSWER = 1;
            final int COL_EXPLANATION = 2;
            final int COL_QUESTION_TYPE = 3;
            final int COL_COGNITIVE_LEVEL = 4;

            // ===== Headers =====
            String[] HEADERS = {
                    "Câu hỏi",
                    "Câu trả lời đúng",
                    "Giải thích",
                    "Loại câu hỏi",
                    "Mức độ nhận thức"
            };

            // ===== Allowed Values =====
            String[] QUESTION_TYPES = {
                    "Trắc nghiệm",
                    "Đúng/Sai",
                    "Điền khuyết"
            };

            String[] COGNITIVE_LEVELS = {
                    "Nhận biết",
                    "Thông hiểu",
                    "Vận dụng",
                    "Vận dụng cao"
            };

            // ===== Header Style =====
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            // ===== Create Header Row =====
            Row headerRow = sheet.createRow(0);

            for (int i = 0; i < HEADERS.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(HEADERS[i]);
                cell.setCellStyle(headerStyle);
            }

            // ===== Data Validation =====
            DataValidationHelper dvHelper = sheet.getDataValidationHelper();

            // Question Type dropdown
            DataValidationConstraint questionTypeConstraint =
                    dvHelper.createExplicitListConstraint(QUESTION_TYPES);

            CellRangeAddressList questionTypeRange =
                    new CellRangeAddressList(1, 1000, COL_QUESTION_TYPE, COL_QUESTION_TYPE);

            DataValidation questionTypeValidation =
                    dvHelper.createValidation(questionTypeConstraint, questionTypeRange);

            questionTypeValidation.setShowErrorBox(true);
            sheet.addValidationData(questionTypeValidation);

            // Cognitive Level dropdown
            DataValidationConstraint cognitiveConstraint =
                    dvHelper.createExplicitListConstraint(COGNITIVE_LEVELS);

            CellRangeAddressList cognitiveRange =
                    new CellRangeAddressList(1, 1000, COL_COGNITIVE_LEVEL, COL_COGNITIVE_LEVEL);

            DataValidation cognitiveValidation =
                    dvHelper.createValidation(cognitiveConstraint, cognitiveRange);

            cognitiveValidation.setShowErrorBox(true);
            sheet.addValidationData(cognitiveValidation);

            // ===== Column Widths =====
            sheet.setColumnWidth(COL_QUESTION_TEXT, 60 * 256);
            sheet.setColumnWidth(COL_CORRECT_ANSWER, 30 * 256);
            sheet.setColumnWidth(COL_EXPLANATION, 40 * 256);
            sheet.setColumnWidth(COL_QUESTION_TYPE, 16 * 256);
            sheet.setColumnWidth(COL_COGNITIVE_LEVEL, 16 * 256);

            // ===== Example Row =====
            Row exampleRow = sheet.createRow(1);


            exampleRow.createCell(COL_QUESTION_TEXT).setCellValue("Tìm x sao cho 2x + 5 = 15");
            exampleRow.createCell(COL_CORRECT_ANSWER).setCellValue("x = 5");
            exampleRow.createCell(COL_EXPLANATION).setCellValue("2x = 10 => x = 5");
            exampleRow.createCell(COL_QUESTION_TYPE).setCellValue("Trắc nghiệm");
            exampleRow.createCell(COL_COGNITIVE_LEVEL).setCellValue("Vận dụng");

            // ===== Freeze Header =====
            sheet.createFreezePane(0, 1);

            // ===== Write Workbook =====
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);

            return TemplateDownloadResponse.builder()
                    .fileName("question_import_template.xlsx")
                    .contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .content(outputStream.toByteArray())
                    .size(outputStream.size())
                    .build();
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
        long manualCount = questionBankRepository.countManual();
        long importedCount = questionBankRepository.countImported();

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
                .manualCount(manualCount)
                .importedCount(importedCount)
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
