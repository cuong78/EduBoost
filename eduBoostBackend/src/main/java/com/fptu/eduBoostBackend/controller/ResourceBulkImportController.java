package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.service.ResourceBulkImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/resources/bulk")
@CrossOrigin(origins = "*")
public class ResourceBulkImportController {

    @Autowired
    private ResourceBulkImportService resourceBulkImportService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadResourcesZip(
            @RequestParam("file") MultipartFile file,
            @RequestParam("subjectId") Long subjectId,
            @RequestParam("gradeLevel") Integer gradeLevel) {

        Map<String, Object> result = new HashMap<>();

        if (file.isEmpty()) {
            result.put("success", false);
            result.put("message", "Please select a file to upload");
            return ResponseEntity.badRequest().body(result);
        }

        try {
            result = resourceBulkImportService.importResourcesFromFolder(file, subjectId, gradeLevel);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }

    @PostMapping("/import-from-path")
    public ResponseEntity<Map<String, Object>> importResourcesFromPath(
            @RequestParam("folderPath") String folderPath,
            @RequestParam("subjectId") Long subjectId,
            @RequestParam("gradeLevel") Integer gradeLevel) {

        Map<String, Object> result = resourceBulkImportService.importResourcesFromFolderWithPath(
                folderPath, subjectId, gradeLevel);

        return ResponseEntity.ok(result);
    }
}
