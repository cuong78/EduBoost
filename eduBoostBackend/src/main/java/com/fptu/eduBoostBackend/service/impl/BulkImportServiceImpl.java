package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.dto.response.BulkImportResponse;
import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.entities.enums.DifficultyLevel;
import com.fptu.eduBoostBackend.entities.enums.QuestionSourceType;
import com.fptu.eduBoostBackend.entities.enums.QuestionType;
import com.fptu.eduBoostBackend.repositories.*;
import com.fptu.eduBoostBackend.service.BulkImportService;
import com.fptu.eduBoostBackend.service.FileStorageService;
import com.fptu.eduBoostBackend.service.WordImportService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.text.Normalizer;
import java.util.*;
import java.util.regex.*;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class BulkImportServiceImpl implements BulkImportService {

    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;
    private final QuestionBankRepository questionBankRepository;
    private final CognitiveLevelRepository cognitiveLevelRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final WordImportService wordImportService;

    @Value("${ai.deepseek.api-key:}")
    private String deepseekApiKey;

    private static final String DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
    private static final int AI_BATCH_SIZE = 20;

    @Override
    // NO @Transactional here — each file runs its own transaction via importFromWord/saveAll
    // This prevents rollback-only poisoning from inner @Transactional methods
    public BulkImportResponse bulkImportFromZip(MultipartFile zipFile, boolean useAiClassification) {
        log.info("Starting bulk import from ZIP: {}, AI classification: {}", zipFile.getOriginalFilename(), useAiClassification);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) auth.getPrincipal();

        List<String> errors = new ArrayList<>();
        Map<String, Integer> byGrade = new LinkedHashMap<>();
        int totalFiles = 0;
        int totalQuestions = 0;
        int successCount = 0;
        int aiClassifiedCount = 0;

        List<CognitiveLevel> allCognitiveLevels = cognitiveLevelRepository.findAll();
        CognitiveLevel defaultLevel = allCognitiveLevels.isEmpty() ? null : allCognitiveLevels.get(0);

        try (ZipInputStream zis = new ZipInputStream(zipFile.getInputStream())) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if (entry.isDirectory()) continue;
                String entryName = entry.getName();

                // Process Excel (.xlsx/.xls) and Word (.docx) files
                if (!entryName.endsWith(".xlsx") && !entryName.endsWith(".xls") && !entryName.endsWith(".docx")) continue;

                totalFiles++;
                log.info("Processing ZIP entry: {}", entryName);

                try {
                    // Parse folder structure: Lop X/MonHoc/Chuong N/Bai M.xlsx
                    FolderContext ctx = parseFolderStructure(entryName, errors);
                    if (ctx == null) continue;

                    // Match to DB entities
                    Lesson lesson = matchToLesson(ctx, errors);
                    if (lesson == null) continue;

                    String gradeKey = "Lớp " + ctx.gradeLevel;

                    // Read the file from ZIP stream
                    byte[] fileBytes = readZipEntryBytes(zis);

                    List<QuestionBank> questions;
                    if (entryName.endsWith(".docx")) {
                        // Parse Word file
                        questions = parseWordToQuestions(
                                fileBytes, entryName, lesson, currentUser, allCognitiveLevels, defaultLevel, errors);
                    } else {
                        // Parse Excel file
                        questions = parseExcelToQuestions(
                                fileBytes, entryName, lesson, currentUser, allCognitiveLevels, defaultLevel, errors);
                    }

                    if (questions.isEmpty()) {
                        log.warn("No valid questions found in: {}", entryName);
                        continue;
                    }

                    // AI classification if enabled
                    if (useAiClassification && deepseekApiKey != null && !deepseekApiKey.isEmpty()) {
                        int classified = classifyWithAI(questions, ctx, allCognitiveLevels, errors);
                        aiClassifiedCount += classified;
                    }

                    // Save all questions (for Excel files that aren't saved by importFromWord)
                    // For Word files, questions are already saved by importFromWord — this updates cognitive levels
                    questionBankRepository.saveAll(questions);
                    questionBankRepository.flush();
                    int count = questions.size();
                    successCount += count;
                    totalQuestions += count;
                    byGrade.merge(gradeKey, count, Integer::sum);

                    log.info("Imported {} questions from {} to lesson {} ({})", count, entryName,
                            lesson.getLessonName(), gradeKey);

                } catch (Exception e) {
                    log.error("Error processing entry: {}", entryName, e);
                    errors.add("File " + entryName + ": " + e.getMessage());
                }
            }
        } catch (IOException e) {
            log.error("Error reading ZIP file", e);
            errors.add("Không thể đọc file ZIP: " + e.getMessage());
        }

        log.info("Bulk import complete: {} files, {} questions, {} success, {} AI classified",
                totalFiles, totalQuestions, successCount, aiClassifiedCount);

        return BulkImportResponse.builder()
                .totalFiles(totalFiles)
                .totalQuestions(totalQuestions)
                .successCount(successCount)
                .aiClassifiedCount(aiClassifiedCount)
                .errors(errors)
                .byGrade(byGrade)
                .build();
    }

    // --- Folder structure parsing ---

    private static class FolderContext {
        int gradeLevel;
        String subjectName;
        int chapterNumber;
        int lessonNumber;
        String chapterName;
        String lessonName;
    }

    private FolderContext parseFolderStructure(String entryName, List<String> errors) {
        // Supports two structures:
        // 5 levels: Lớp 6/KHTN/Chương 1_ Tên chương/Bài 1_ Tên bài/file.xlsx
        // 4 levels: Lớp 6/Toán/Chương 1_ Tên chương/Bài 1_ Tên bài.xlsx
        String normalized = entryName.replace("\\", "/");
        String[] parts = normalized.split("/");

        // Remove __MACOSX and hidden files
        if (normalized.startsWith("__MACOSX") || normalized.startsWith(".")) {
            return null;
        }
        // Skip hidden files within folders
        for (String part : parts) {
            if (part.startsWith(".")) return null;
        }

        if (parts.length < 4) {
            errors.add("File '" + entryName + "': Cấu trúc folder phải là Lớp X/Môn/Chương N/Bài M/file.xlsx hoặc Lớp X/Môn/Chương N/Bài M.xlsx");
            return null;
        }

        FolderContext ctx = new FolderContext();

        // Find grade folder - look for folder containing "Lớp" or "Lop" with a number
        int gradeIdx = -1;
        for (int i = 0; i < parts.length; i++) {
            String lower = removeVietnameseDiacritics(parts[i]).toLowerCase();
            if (lower.startsWith("lop") && parseNumber(parts[i]) != null) {
                gradeIdx = i;
                break;
            }
        }
        if (gradeIdx == -1) {
            // Fallback: first folder with a number
            for (int i = 0; i < parts.length - 1; i++) {
                if (parseNumber(parts[i]) != null) {
                    gradeIdx = i;
                    break;
                }
            }
        }
        if (gradeIdx == -1 || gradeIdx + 2 >= parts.length) {
            errors.add("File '" + entryName + "': Không tìm thấy folder Lớp (ví dụ: Lớp 6)");
            return null;
        }
        ctx.gradeLevel = parseNumber(parts[gradeIdx]);

        // Subject = folder right after grade
        int subjectIdx = gradeIdx + 1;
        ctx.subjectName = parts[subjectIdx].trim();

        // Chapter = folder right after subject
        int chapterIdx = subjectIdx + 1;
        if (chapterIdx >= parts.length - 1) {
            errors.add("File '" + entryName + "': Không tìm thấy folder Chương");
            return null;
        }
        Integer chapterNum = parseNumber(parts[chapterIdx]);
        if (chapterNum == null) {
            errors.add("File '" + entryName + "': Không tìm thấy số chương trong folder '" + parts[chapterIdx] + "'");
            return null;
        }
        ctx.chapterNumber = chapterNum;
        ctx.chapterName = parts[chapterIdx].trim();

        // Lesson: could be in folder (5-level) or in filename (4-level)
        int lessonIdx = chapterIdx + 1;
        String fileName = parts[parts.length - 1];

        if (lessonIdx < parts.length - 1) {
            // 5-level structure: Lớp X/Mon/Chuong N/Bài M_ Ten bai/file.xlsx
            Integer lessonNum = parseNumber(parts[lessonIdx]);
            if (lessonNum == null) {
                errors.add("File '" + entryName + "': Không tìm thấy số bài trong folder '" + parts[lessonIdx] + "'");
                return null;
            }
            ctx.lessonNumber = lessonNum;
            ctx.lessonName = parts[lessonIdx].trim()
                    .replaceAll("^[Bb]ài\\s*\\d+[_:\\s-]*\\s*", "").trim();
        } else {
            // 4-level structure: Lớp X/Mon/Chuong N/Bài M_ Ten bai.xlsx
            String fileNameNoExt = fileName.replaceAll("\\.(xlsx|xls)$", "");
            Integer lessonNum = parseNumber(fileNameNoExt);
            if (lessonNum == null) {
                errors.add("File '" + entryName + "': Không tìm thấy số bài trong tên file '" + fileName + "'");
                return null;
            }
            ctx.lessonNumber = lessonNum;
            ctx.lessonName = fileNameNoExt.trim();
        }

        log.debug("Parsed: grade={}, subject={}, chapter={}, lesson={} from '{}'",
                ctx.gradeLevel, ctx.subjectName, ctx.chapterNumber, ctx.lessonNumber, entryName);

        return ctx;
    }

    private Integer parseNumber(String text) {
        // Extract first number from text, e.g. "Lop 6" -> 6, "Chuong 11" -> 11, "Bai 1 - Ten bai" -> 1
        Matcher matcher = Pattern.compile("(\\d+)").matcher(text);
        if (matcher.find()) {
            return Integer.parseInt(matcher.group(1));
        }
        return null;
    }

    // --- DB matching ---

    private Lesson matchToLesson(FolderContext ctx, List<String> errors) {
        // 1. Find subject by name (fuzzy match)
        List<Subject> allSubjects = subjectRepository.findAll();
        Subject subject = matchSubject(allSubjects, ctx.subjectName);
        if (subject == null) {
            errors.add("Không tìm thấy môn học match với '" + ctx.subjectName + "'. Các môn có: " +
                    allSubjects.stream().map(Subject::getSubjectName).collect(Collectors.joining(", ")));
            return null;
        }

        // 2. Find chapter by subject + gradeLevel + chapterNumber
        List<Chapter> chapters = chapterRepository.findBySubjectAndGradeLevel(subject, ctx.gradeLevel);
        Chapter chapter = chapters.stream()
                .filter(c -> c.getChapterNumber() != null && c.getChapterNumber() == ctx.chapterNumber)
                .findFirst()
                .orElse(null);
        if (chapter == null) {
            errors.add("Không tìm thấy Chương " + ctx.chapterNumber + " của " + subject.getSubjectName() +
                    " Lớp " + ctx.gradeLevel + ". Các chương có: " +
                    chapters.stream().map(c -> "Chương " + c.getChapterNumber()).collect(Collectors.joining(", ")));
            return null;
        }

        // 3. Find lesson by chapter + lessonNumber
        List<Lesson> lessons = lessonRepository.findByChapter(chapter);
        Lesson lesson = lessons.stream()
                .filter(l -> l.getLessonNumber() != null && l.getLessonNumber() == ctx.lessonNumber)
                .findFirst()
                .orElse(null);
        if (lesson == null) {
            errors.add("Không tìm thấy Bài " + ctx.lessonNumber + " trong Chương " + ctx.chapterNumber +
                    " " + subject.getSubjectName() + " Lớp " + ctx.gradeLevel + ". Các bài có: " +
                    lessons.stream().map(l -> "Bài " + l.getLessonNumber()).collect(Collectors.joining(", ")));
            return null;
        }

        return lesson;
    }

    private Subject matchSubject(List<Subject> subjects, String folderName) {
        String normalized = removeVietnameseDiacritics(folderName).toLowerCase().trim();

        // Hardcoded aliases for common Vietnamese subject abbreviations
        Map<String, String> aliases = new LinkedHashMap<>();
        aliases.put("khtn", "sci");           // Khoa học tự nhiên
        aliases.put("khoa hoc tu nhien", "sci");
        aliases.put("toan", "toan");          // Toán học
        aliases.put("toan hoc", "toan");
        aliases.put("ly", "ly");              // Vật lí
        aliases.put("vat li", "ly");
        aliases.put("vat ly", "ly");
        aliases.put("hoa", "hoa");            // Hóa học
        aliases.put("hoa hoc", "hoa");
        aliases.put("sinh", "sinh");          // Sinh học
        aliases.put("sinh hoc", "sinh");

        // Check alias mapping first
        String aliasCode = aliases.get(normalized);
        if (aliasCode != null) {
            for (Subject s : subjects) {
                if (s.getSubjectCode().equalsIgnoreCase(aliasCode)) {
                    return s;
                }
            }
        }

        for (Subject s : subjects) {
            String subjectNormalized = removeVietnameseDiacritics(s.getSubjectName()).toLowerCase().trim();
            String codeNormalized = s.getSubjectCode().toLowerCase().trim();

            // Exact match on normalized name or code
            if (subjectNormalized.equals(normalized) || codeNormalized.equals(normalized)) {
                return s;
            }
            // Fuzzy: folder contains subject name or vice versa
            if (subjectNormalized.contains(normalized) || normalized.contains(subjectNormalized)) {
                return s;
            }
            // Fuzzy: folder contains subject code
            if (normalized.contains(codeNormalized)) {
                return s;
            }
        }
        return null;
    }

    private String removeVietnameseDiacritics(String text) {
        if (text == null) return "";
        String normalized = Normalizer.normalize(text, Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .replaceAll("đ", "d").replaceAll("Đ", "D");
    }

    // --- Excel parsing ---

    private byte[] readZipEntryBytes(ZipInputStream zis) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        byte[] buffer = new byte[4096];
        int len;
        while ((len = zis.read(buffer)) > 0) {
            baos.write(buffer, 0, len);
        }
        return baos.toByteArray();
    }

    private List<QuestionBank> parseExcelToQuestions(byte[] fileBytes, String fileName, Lesson lesson,
            User createdBy, List<CognitiveLevel> cognitiveLevels, CognitiveLevel defaultLevel,
            List<String> errors) {
        List<QuestionBank> questions = new ArrayList<>();

        try (InputStream is = new ByteArrayInputStream(fileBytes);
             Workbook workbook = fileName.endsWith(".xlsx") ? new XSSFWorkbook(is) : new HSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                try {
                    String questionText = getCellValueAsString(row.getCell(0));
                    if (questionText == null || questionText.trim().isEmpty()) continue;

                    String correctAnswer = getCellValueAsString(row.getCell(1));
                    if (correctAnswer == null || correctAnswer.trim().isEmpty()) {
                        errors.add(fileName + " dòng " + (i + 1) + ": Thiếu đáp án");
                        continue;
                    }

                    String explanation = getCellValueAsString(row.getCell(2));
                    String typeStr = getCellValueAsString(row.getCell(3));
                    String cognitiveLevelStr = getCellValueAsString(row.getCell(4));

                    QuestionType questionType = parseQuestionType(typeStr);

                    // Parse cognitive level from Excel (might be null — AI will fill later)
                    CognitiveLevel cogLevel = null;
                    if (cognitiveLevelStr != null && !cognitiveLevelStr.trim().isEmpty()) {
                        String trimmed = cognitiveLevelStr.trim();
                        cogLevel = cognitiveLevels.stream()
                                .filter(c -> c.getLevel().trim().equalsIgnoreCase(trimmed))
                                .findFirst().orElse(null);
                    }
                    if (cogLevel == null) {
                        cogLevel = defaultLevel; // Will be overwritten by AI if enabled
                    }

                    QuestionBank q = QuestionBank.builder()
                            .lesson(lesson)
                            .questionText(questionText.trim())
                            .correctAnswer(correctAnswer.trim())
                            .explanation(explanation != null ? explanation.trim() : null)
                            .questionType(questionType)
                            .cognitiveLevel(cogLevel)
                            .difficultyLevel(DifficultyLevel.MEDIUM)
                            .sourceType(QuestionSourceType.IMPORTED)
                            .createdBy(createdBy)
                            .usageCount(0)
                            .build();
                    questions.add(q);

                } catch (Exception e) {
                    errors.add(fileName + " dòng " + (i + 1) + ": " + e.getMessage());
                }
            }
        } catch (IOException e) {
            errors.add(fileName + ": Không thể đọc file Excel - " + e.getMessage());
        }

        return questions;
    }

    private List<QuestionBank> parseWordToQuestions(byte[] fileBytes, String fileName, Lesson lesson,
            User createdBy, List<CognitiveLevel> cognitiveLevels, CognitiveLevel defaultLevel,
            List<String> errors) {
        List<QuestionBank> questions = new ArrayList<>();

        try {
            // Create a MultipartFile wrapper for the word import service
            MultipartFile wordFile = new MultipartFile() {
                @Override public String getName() { return "file"; }
                @Override public String getOriginalFilename() { return fileName; }
                @Override public String getContentType() { return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"; }
                @Override public boolean isEmpty() { return fileBytes.length == 0; }
                @Override public long getSize() { return fileBytes.length; }
                @Override public byte[] getBytes() { return fileBytes; }
                @Override public InputStream getInputStream() { return new ByteArrayInputStream(fileBytes); }
                @Override public void transferTo(java.io.File dest) throws IOException {
                    try (FileOutputStream fos = new FileOutputStream(dest)) { fos.write(fileBytes); }
                }
            };

            // Delegate to WordImportService (without AI classification — bulk import handles that separately)
            var results = wordImportService.importFromWord(wordFile, lesson.getId(), false);

            // Convert responses back to entities for AI batch classification
            for (var r : results) {
                QuestionBank q = questionBankRepository.findById(r.getId()).orElse(null);
                if (q != null) questions.add(q);
            }

            log.info("Parsed {} questions from Word file: {}", questions.size(), fileName);
        } catch (Exception e) {
            errors.add(fileName + ": Không thể đọc file Word - " + e.getMessage());
            log.error("Error parsing Word file {}: {}", fileName, e.getMessage(), e);
        }

        return questions;
    }

    private QuestionType parseQuestionType(String typeStr) {
        if (typeStr == null || typeStr.trim().isEmpty()) return QuestionType.MULTIPLE_CHOICE;
        String t = typeStr.trim();
        if (t.equalsIgnoreCase("Trắc nghiệm") || t.equalsIgnoreCase("MULTIPLE_CHOICE")) return QuestionType.MULTIPLE_CHOICE;
        if (t.equalsIgnoreCase("Đúng/Sai") || t.equalsIgnoreCase("TRUE_FALSE")) return QuestionType.TRUE_FALSE;
        if (t.equalsIgnoreCase("Điền khuyết") || t.equalsIgnoreCase("FILL_BLANK")) return QuestionType.FILL_BLANK;
        return QuestionType.MULTIPLE_CHOICE;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return null;
        switch (cell.getCellType()) {
            case STRING: return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) return cell.getDateCellValue().toString();
                double val = cell.getNumericCellValue();
                return val == (long) val ? String.valueOf((long) val) : String.valueOf(val);
            case BOOLEAN: return String.valueOf(cell.getBooleanCellValue());
            case FORMULA: return cell.getCellFormula();
            default: return null;
        }
    }

    // --- AI Cognitive Level Classification ---

    private int classifyWithAI(List<QuestionBank> questions, FolderContext ctx,
            List<CognitiveLevel> cognitiveLevels, List<String> errors) {
        int classified = 0;
        String levelNames = cognitiveLevels.stream()
                .map(CognitiveLevel::getLevel)
                .collect(Collectors.joining(", "));

        // Process in batches
        for (int i = 0; i < questions.size(); i += AI_BATCH_SIZE) {
            int end = Math.min(i + AI_BATCH_SIZE, questions.size());
            List<QuestionBank> batch = questions.subList(i, end);

            try {
                Map<Integer, String> results = callDeepSeekForClassification(batch, ctx, levelNames);
                for (Map.Entry<Integer, String> entry : results.entrySet()) {
                    int idx = entry.getKey();
                    String levelName = entry.getValue();

                    if (idx >= 0 && idx < batch.size()) {
                        CognitiveLevel matched = cognitiveLevels.stream()
                                .filter(c -> c.getLevel().trim().equalsIgnoreCase(levelName.trim()))
                                .findFirst().orElse(null);
                        if (matched != null) {
                            batch.get(idx).setCognitiveLevel(matched);
                            classified++;
                        }
                    }
                }
                log.info("AI classified {} questions in batch starting at {}", results.size(), i);
            } catch (Exception e) {
                log.error("AI classification failed for batch starting at {}: {}", i, e.getMessage());
                errors.add("AI classification lỗi batch " + (i / AI_BATCH_SIZE + 1) + ": " + e.getMessage());
            }
        }
        return classified;
    }

    private Map<Integer, String> callDeepSeekForClassification(List<QuestionBank> batch,
            FolderContext ctx, String levelNames) throws Exception {

        // Build the question list for the prompt
        StringBuilder questionsText = new StringBuilder();
        for (int i = 0; i < batch.size(); i++) {
            questionsText.append(i).append(". ").append(batch.get(i).getQuestionText()).append("\n");
        }

        String systemPrompt = "Bạn là chuyên gia giáo dục Việt Nam. Hãy phân loại mức độ nhận thức (cognitive level) " +
                "cho từng câu hỏi theo thang Bloom đã Việt hóa.\n\n" +
                "Các mức độ có sẵn: " + levelNames + "\n\n" +
                "Quy tắc phân loại:\n" +
                "- Nhận biết: Nhớ, nhận ra kiến thức đã học (định nghĩa, công thức, sự kiện)\n" +
                "- Thông hiểu: Giải thích, so sánh, suy luận từ kiến thức đã học\n" +
                "- Vận dụng: Áp dụng kiến thức vào tình huống tương tự đã học\n" +
                "- Vận dụng cao: Phân tích, tổng hợp, giải quyết vấn đề mới, sáng tạo\n\n" +
                "Trả lời CHÍNH XÁC bằng JSON array, không thêm text nào khác:\n" +
                "[{\"index\": 0, \"level\": \"Nhận biết\"}, ...]";

        String userPrompt = "Môn: " + ctx.subjectName + ", Lớp: " + ctx.gradeLevel +
                ", Chương " + ctx.chapterNumber + ", Bài " + ctx.lessonNumber + "\n\n" +
                "Các câu hỏi:\n" + questionsText;

        // Build request body
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "deepseek-chat");
        requestBody.put("temperature", 0.1);
        requestBody.put("messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userPrompt)
        ));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(deepseekApiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.exchange(DEEPSEEK_API_URL, HttpMethod.POST, entity, String.class);

        // Parse response
        JsonNode root = objectMapper.readTree(response.getBody());
        String content = root.path("choices").get(0).path("message").path("content").asText();

        // Extract JSON from response (might have markdown code blocks)
        content = content.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();

        JsonNode results = objectMapper.readTree(content);
        Map<Integer, String> classified = new HashMap<>();
        if (results.isArray()) {
            for (JsonNode item : results) {
                int index = item.path("index").asInt(-1);
                String level = item.path("level").asText("");
                if (index >= 0 && !level.isEmpty()) {
                    classified.put(index, level);
                }
            }
        }

        return classified;
    }
}
