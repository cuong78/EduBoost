package com.fptu.eduBoostBackend.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;
import java.util.Map;

public interface ResourceBulkImportService {
    Map<String, Object> importResourcesFromFolder(MultipartFile folderZip, Long subjectId, Integer gradeLevel);

    Map<String, Object> importResourcesFromFolderWithPath(String folderPath, Long subjectId, Integer gradeLevel);
}
