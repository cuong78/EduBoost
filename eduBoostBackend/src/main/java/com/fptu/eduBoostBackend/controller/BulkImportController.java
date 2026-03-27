package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.dto.response.BulkImportResponse;
import com.fptu.eduBoostBackend.repositories.LessonResourceRepository;
import com.fptu.eduBoostBackend.repositories.QuestionBankRepository;
import com.fptu.eduBoostBackend.service.BulkImportService;
import com.fptu.eduBoostBackend.service.impl.ResourceBulkImportServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@SecurityRequirement(name = "api")
@Tag(name = "Bulk Import", description = "APIs for bulk importing questions from ZIP files")
public class BulkImportController {

    private final BulkImportService bulkImportService;
    private final ResourceBulkImportServiceImpl resourceBulkImportService;
    private final LessonResourceRepository lessonResourceRepository;
    private final QuestionBankRepository questionBankRepository;

    @PostMapping(value = "/question-bank/bulk-import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Bulk import questions from ZIP")
    public ResponseEntity<BulkImportResponse> bulkImport(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "useAiClassification", defaultValue = "true") boolean useAiClassification) {

        log.info("Bulk import request: file={}, useAi={}", file.getOriginalFilename(), useAiClassification);
        if (file.isEmpty()) return ResponseEntity.badRequest().build();
        String fileName = file.getOriginalFilename();
        if (fileName == null || !fileName.endsWith(".zip")) {
            return ResponseEntity.badRequest().body(BulkImportResponse.builder()
                    .errors(List.of("File phải là định dạng ZIP (.zip)")).build());
        }
        return ResponseEntity.ok(bulkImportService.bulkImportFromZip(file, useAiClassification));
    }

    @PostMapping(value = "/resources/bulk-import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Bulk import resources from ZIP")
    public ResponseEntity<ResourceBulkImportServiceImpl.BulkResourceResult> bulkImportResources(
            @RequestParam("file") MultipartFile file) {

        log.info("Bulk resource import request: file={}", file.getOriginalFilename());
        if (file.isEmpty()) return ResponseEntity.badRequest().build();
        String fileName = file.getOriginalFilename();
        if (fileName == null || !fileName.endsWith(".zip")) {
            return ResponseEntity.badRequest().body(
                    new ResourceBulkImportServiceImpl.BulkResourceResult(0, 0, 0,
                            List.of("File phải là định dạng ZIP (.zip)"), new HashMap<>()));
        }
        return ResponseEntity.ok(resourceBulkImportService.importResourcesFromZip(file));
    }

    // ─── Diagnostic APIs ────────────────────────────────────────────

    @GetMapping("/resources/lessons-without-resources")
    @Operation(summary = "Get lessons that have no resources uploaded",
               description = "Returns all lessons in the system that have zero lesson resources, grouped by grade/subject/chapter.")
    public ResponseEntity<List<Map<String, Object>>> getLessonsWithoutResources() {
        List<Object[]> rows = lessonResourceRepository.findLessonsWithoutResources();
        List<Map<String, Object>> result = mapLessonRows(rows);
        log.info("Lessons without resources: {} found", result.size());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/question-bank/lessons-without-questions")
    @Operation(summary = "Get lessons that have no questions in question bank",
               description = "Returns all lessons in the system that have zero questions, grouped by grade/subject/chapter.")
    public ResponseEntity<List<Map<String, Object>>> getLessonsWithoutQuestions() {
        List<Object[]> rows = questionBankRepository.findLessonsWithoutQuestions();
        List<Map<String, Object>> result = mapLessonRows(rows);
        log.info("Lessons without questions: {} found", result.size());
        return ResponseEntity.ok(result);
    }

    private List<Map<String, Object>> mapLessonRows(List<Object[]> rows) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("lessonId",       row[0]);
            item.put("lessonName",     row[1]);
            item.put("lessonNumber",   row[2]);
            item.put("chapterId",      row[3]);
            item.put("chapterNumber",  row[4]);
            item.put("chapterName",    row[5]);
            item.put("subjectId",      row[6]);
            item.put("subjectName",    row[7]);
            item.put("gradeLevel",     row[8]);
            result.add(item);
        }
        return result;
    }
}
