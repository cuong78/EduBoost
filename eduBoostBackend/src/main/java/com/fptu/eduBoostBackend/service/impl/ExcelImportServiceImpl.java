package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.dto.request.QuestionBankRequest;
import com.fptu.eduBoostBackend.dto.response.QuestionBankImportResponse;
import com.fptu.eduBoostBackend.dto.response.QuestionBankResponse;
import com.fptu.eduBoostBackend.entities.CognitiveLevel;
import com.fptu.eduBoostBackend.entities.enums.QuestionType;
import com.fptu.eduBoostBackend.exception.exceptions.BadRequestException;
import com.fptu.eduBoostBackend.repositories.CognitiveLevelRepository;
import com.fptu.eduBoostBackend.repositories.LessonRepository;
import com.fptu.eduBoostBackend.service.ExcelImportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExcelImportServiceImpl implements ExcelImportService {

    private final LessonRepository lessonRepository;
    private final CognitiveLevelRepository cognitiveLevelRepository;
    @Override
    public QuestionBankImportResponse parseExcelFile(MultipartFile file, Long lessonId) {
        log.info("Parsing Excel file: {}, for lesson: {}", file.getOriginalFilename(), lessonId);

        // Validate file
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File cannot be empty");
        }

        String fileName = file.getOriginalFilename();
        if (fileName == null || (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls"))) {
            throw new BadRequestException("File must be Excel format (.xlsx or .xls)");
        }

        // Verify lesson exists
        lessonRepository.findById(lessonId)
                .orElseThrow(() -> new BadRequestException("Lesson not found with id: " + lessonId));

        List<QuestionBankResponse> questions = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        int totalRows = 0;
        int skippedEmptyRows = 0;

        try (Workbook workbook = fileName.endsWith(".xlsx") 
                ? new XSSFWorkbook(file.getInputStream())
                : new HSSFWorkbook(file.getInputStream())) {

            Sheet sheet = workbook.getSheetAt(0);

            // Skip header row (row 0)
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) {
                    skippedEmptyRows++;
                    continue;
                }

                try {
                    QuestionBankRequest question = parseRow(row, i + 1, lessonId);
                    if (question != null) {
                        totalRows++; // Only count non-empty rows
                        // Convert to response for preview
                        CognitiveLevel level = cognitiveLevelRepository
                                .findById(question.getCognitiveLevelId())
                                .orElse(null);

                        QuestionBankResponse response = QuestionBankResponse.builder()
                                .lessonId(lessonId)
                                .questionText(question.getQuestionText())
                                .correctAnswer(question.getCorrectAnswer())
                                .explanation(question.getExplanation())
                                .questionType(question.getQuestionType())
                                .difficultyLevel(question.getDifficultyLevel())
                                .cognitiveLevelId(level != null ? level.getId() : null)
                                .cognitiveLevel(level != null ? level.getLevel() : null)
                                .sourceType(null)
                                .build();
                        questions.add(response);
                    } else {
                        skippedEmptyRows++; // Row exists but is empty
                    }
                } catch (Exception e) {
                    totalRows++; // Count as a row with data (but has error)
                    errors.add("Row " + (i + 1) + ": " + e.getMessage());
                }
            }
            
            log.info("Parsed Excel: {} valid questions, {} errors, {} empty rows skipped", 
                    questions.size(), errors.size(), skippedEmptyRows);

        } catch (IOException e) {
            log.error("Error parsing Excel file", e);
            throw new BadRequestException("Error reading Excel file: " + e.getMessage());
        }

        return QuestionBankImportResponse.builder()
                .questions(questions)
                .totalRows(totalRows)
                .validRows(questions.size())
                .errors(errors)
                .build();
    }

    private QuestionBankRequest parseRow(Row row, int rowNumber, Long lessonId) {
        // Expected columns:
        // A: Câu hỏi
        // B: Câu trả lời
        // C: Giải thích
        // D: Dạng câu hỏi
        // E: Mức độ nhận thức
        // Index: 0 | 1 | 2 | 3 | 4

        Cell questionCell = row.getCell(0);
        Cell answerCell = row.getCell(1);
        Cell explanationCell = row.getCell(2);
        Cell typeCell = row.getCell(3);
        Cell cognitiveCell = row.getCell(4);

        // Question text is required
        String questionText = getCellValueAsString(questionCell);

        // Skip empty rows
        if (questionText == null || questionText.trim().isEmpty()) {
            return null;
        }

        // Answer is required
        String correctAnswer = getCellValueAsString(answerCell);
        if (correctAnswer == null || correctAnswer.trim().isEmpty()) {
            throw new BadRequestException("Correct answer is required in column B");
        }

        // Explanation is optional
        String explanation = getCellValueAsString(explanationCell);

        // Question type (default MULTIPLE_CHOICE)
        String typeStr = getCellValueAsString(typeCell);
        QuestionType questionType = mapQuestionType(typeStr);

        // Cognitive Level (REQUIRED)
        String cognitiveLevelStr = getCellValueAsString(cognitiveCell);
        if (cognitiveLevelStr == null || cognitiveLevelStr.trim().isEmpty()) {
            throw new BadRequestException("Cognitive level is required in column E");
        }

        CognitiveLevel cognitiveLevel = cognitiveLevelRepository
                .findByLevelIgnoreCase(cognitiveLevelStr.trim())
                .orElseThrow(() -> new BadRequestException(
                        "Invalid cognitive level '" + cognitiveLevelStr + "' in column E"));

        QuestionBankRequest request = new QuestionBankRequest();

        request.setLessonId(lessonId);
        request.setQuestionText(questionText.trim());
        request.setCorrectAnswer(correctAnswer.trim());
        request.setExplanation(explanation != null ? explanation.trim() : null);
        request.setQuestionType(questionType);
        request.setCognitiveLevelId(cognitiveLevel.getId());

        return request;
    }
    private String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return null;
        }

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                } else {
                    // Convert numeric to string without decimal if whole number
                    double numericValue = cell.getNumericCellValue();
                    if (numericValue == (long) numericValue) {
                        return String.valueOf((long) numericValue);
                    } else {
                        return String.valueOf(numericValue);
                    }
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return null;
        }
    }
    private QuestionType mapQuestionType(String type) {

        if (type == null) return QuestionType.MULTIPLE_CHOICE;

        return switch (type.trim().toUpperCase()) {
            case "TRẮC NGHIỆM", "MULTIPLE_CHOICE" -> QuestionType.MULTIPLE_CHOICE;
            case "ĐÚNG/SAI", "TRUE_FALSE" -> QuestionType.TRUE_FALSE;
            case "ĐIỀN KHUYẾT", "FILL_BLANK" -> QuestionType.FILL_BLANK;
            default -> throw new BadRequestException("Invalid question type: " + type);
        };
    }
}
