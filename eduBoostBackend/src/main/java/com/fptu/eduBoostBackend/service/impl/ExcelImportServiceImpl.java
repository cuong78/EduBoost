package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.dto.request.QuestionBankRequest;
import com.fptu.eduBoostBackend.dto.response.QuestionBankImportResponse;
import com.fptu.eduBoostBackend.dto.response.QuestionBankResponse;
import com.fptu.eduBoostBackend.entities.enums.QuestionType;
import com.fptu.eduBoostBackend.exception.exceptions.BadRequestException;
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
                    QuestionBankRequest question = parseRow(row, i + 1);
                    if (question != null) {
                        totalRows++; // Only count non-empty rows
                        // Convert to response for preview
                        QuestionBankResponse response = QuestionBankResponse.builder()
                                .questionText(question.getQuestionText())
                                .correctAnswer(question.getCorrectAnswer())
                                .explanation(question.getExplanation())
                                .questionType(question.getQuestionType())
                                .difficultyLevel(question.getDifficultyLevel())
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

    private QuestionBankRequest parseRow(Row row, int rowNumber) {
        // Expected columns: Câu hỏi | Câu trả lời | Explanation | Dạng câu hỏi
        // Index: 0 | 1 | 2 | 3

        Cell questionCell = row.getCell(0);
        Cell answerCell = row.getCell(1);
        Cell explanationCell = row.getCell(2);
        Cell typeCell = row.getCell(3);

        // Question text is required
        String questionText = getCellValueAsString(questionCell);
        
        // Skip empty rows (return null instead of throwing error)
        if (questionText == null || questionText.trim().isEmpty()) {
            return null; // Empty row, skip it
        }

        // Answer is required
        String correctAnswer = getCellValueAsString(answerCell);
        if (correctAnswer == null || correctAnswer.trim().isEmpty()) {
            throw new BadRequestException("Correct answer is required in column B");
        }

        // Explanation is optional
        String explanation = getCellValueAsString(explanationCell);

        // Question type - default to MULTIPLE_CHOICE if not provided
        String typeStr = getCellValueAsString(typeCell);
        QuestionType questionType = QuestionType.MULTIPLE_CHOICE;
        if (typeStr != null && !typeStr.trim().isEmpty()) {
            try {
                questionType = QuestionType.valueOf(typeStr.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid question type '{}' in row {}, using MULTIPLE_CHOICE", typeStr, rowNumber);
            }
        }

        QuestionBankRequest request = new QuestionBankRequest();
        request.setQuestionText(questionText.trim());
        request.setCorrectAnswer(correctAnswer.trim());
        request.setExplanation(explanation != null ? explanation.trim() : null);
        request.setQuestionType(questionType);

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
}
