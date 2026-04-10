package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.dto.DocumentExtractionResult;
import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.entities.enums.LessonResourceType;
import com.fptu.eduBoostBackend.repositories.*;
import com.fptu.eduBoostBackend.service.ActivityLogService;
import com.fptu.eduBoostBackend.service.DocumentProcessingService;
import com.fptu.eduBoostBackend.service.FileStorageService;
import com.fptu.eduBoostBackend.service.ResourceBulkImportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.text.Normalizer;
import java.util.*;
import java.util.regex.*;
import java.util.stream.Collectors;
import java.util.zip.*;

/**
 * Bulk imports LessonResources from a ZIP with folder structure:
 *   Lớp X / Môn / Chương N_TenChuong / Bài M_TenBai / file1.docx, file2.docx, ...
 *
 * Matches to existing Grade → Subject → Chapter → Lesson in DB.
 * Creates one LessonResource per .docx file under each Bài folder.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ResourceBulkImportServiceImpl implements ResourceBulkImportService {

    private final LessonResourceRepository lessonResourceRepository;
    private final LessonRepository lessonRepository;
    private final ChapterRepository chapterRepository;
    private final SubjectRepository subjectRepository;
    private final FileStorageService fileStorageService;
    private final DocumentProcessingService documentProcessingService;
    private final ActivityLogService activityLogService;

    @Override
    @Transactional
    public Map<String, Object> importResourcesFromFolder(MultipartFile folderZip, Long subjectId, Integer gradeLevel) {
        throw new UnsupportedOperationException("Use importResourcesFromZip instead");
    }

    @Override
    @Transactional
    public Map<String, Object> importResourcesFromFolderWithPath(String folderPath, Long subjectId, Integer gradeLevel) {
        throw new UnsupportedOperationException("Use importResourcesFromZip instead");
    }

    /**
     * Main entry point: parse ZIP and create LessonResources.
     * ZIP structure: Lop X / Mon / Chuong N / Bai M / file.docx
     */
    // NO @Transactional here — prevents rollback-only poisoning
    public BulkResourceResult importResourcesFromZip(MultipartFile zipFile) {
        log.info("Starting bulk resource import from ZIP: {}", zipFile.getOriginalFilename());
        String zipFileName = zipFile.getOriginalFilename();

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) auth.getPrincipal();

        List<String> errors = new ArrayList<>();
        Map<String, Integer> byGrade = new LinkedHashMap<>();
        int totalFiles = 0;
        int totalCreated = 0;
        int skipped = 0;

        try (ZipInputStream zis = new ZipInputStream(zipFile.getInputStream())) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if (entry.isDirectory()) continue;
                String entryName = entry.getName();

                // Only process .docx files
                if (!entryName.toLowerCase().endsWith(".docx")) continue;
                // Skip hidden/system files
                if (entryName.startsWith("__MACOSX") || entryName.contains("/.")) continue;

                totalFiles++;
                log.info("Processing ZIP entry: {}", entryName);

                try {
                    // Parse structure (pass ZIP filename for grade fallback)
                    EntryContext ctx = parseEntryPath(entryName, zipFileName, errors);
                    if (ctx == null) { skipped++; continue; }

                    // Match DB
                    Lesson lesson = matchLesson(ctx, errors);
                    if (lesson == null) { skipped++; continue; }

                    // Read bytes
                    byte[] fileBytes = readZipEntryBytes(zis);

                    // Create MultipartFile wrapper
                    String fileName = entryName.substring(entryName.lastIndexOf('/') + 1);
                    MultipartFile multipartFile = wrapBytes(fileBytes, fileName);

                    // Upload to MinIO + extract content
                    String objectKey = fileStorageService.storeFile(multipartFile);

                    LessonResource resource = new LessonResource();
                    resource.setLesson(lesson);
                    resource.setUploadedBy(currentUser);
                    resource.setResourceType(LessonResourceType.DOCX);
                    resource.setResourceName(StringUtils.cleanPath(fileName));
                    resource.setFilePath(objectKey);
                    resource.setFileSize((long) fileBytes.length);
                    resource.setMimeType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");

                    // Extract DOCX content for AI
                    try {
                        DocumentExtractionResult extraction = documentProcessingService.extractContent(multipartFile);
                        resource.setExtractedContent(extraction.getContent());
                        log.info("Extracted content from {} — {} words", fileName, extraction.getWordCount());
                    } catch (Exception e) {
                        log.warn("Failed to extract content from {}: {}", fileName, e.getMessage());
                    }

                    lessonResourceRepository.save(resource);
                    totalCreated++;
                    String gradeKey = "Lớp " + ctx.gradeLevel;
                    byGrade.merge(gradeKey, 1, Integer::sum);
                    log.info("Created LessonResource: {} → lesson: {}", fileName, lesson.getLessonName());

                } catch (Exception e) {
                    log.error("Error processing {}: {}", entryName, e.getMessage(), e);
                    errors.add("File " + entryName + ": " + e.getMessage());
                }
            }
        } catch (IOException e) {
            log.error("Error reading ZIP: {}", e.getMessage(), e);
            errors.add("Không thể đọc file ZIP: " + e.getMessage());
        }
        activityLogService.log("Đã import từ zip thành công");
        log.info("Bulk resource import done: {} files, {} created, {} skipped", totalFiles, totalCreated, skipped);

        return new BulkResourceResult(totalFiles, totalCreated, skipped, errors, byGrade);
    }

    // ─────────── Path parsing ───────────

    private static class EntryContext {
        int gradeLevel;
        String subjectName;
        int chapterNumber;
        int lessonNumber;
    }

    private EntryContext parseEntryPath(String entryName, String zipFileName, List<String> errors) {
        String normalized = entryName.replace("\\", "/");
        String[] parts = normalized.split("/");

        // Skip hidden or system entries
        for (String p : parts) {
            if (p.startsWith(".")) return null;
        }

        if (parts.length < 3) {
            errors.add("'" + entryName + "': Cấu trúc folder quá ngắn");
            return null;
        }

        EntryContext ctx = new EntryContext();

        // Find grade folder index inside ZIP
        int gradeIdx = -1;
        for (int i = 0; i < parts.length; i++) {
            String lower = removeDiacritics(parts[i]).toLowerCase();
            if ((lower.startsWith("lop") || lower.startsWith("lớp")) && extractNumber(parts[i]) != null) {
                gradeIdx = i;
                break;
            }
        }

        if (gradeIdx != -1 && gradeIdx + 3 <= parts.length) {
            // Grade folder found inside ZIP
            ctx.gradeLevel = extractNumber(parts[gradeIdx]);
        } else {
            // No grade folder → extract from ZIP filename (e.g. "Lớp 8.zip")
            gradeIdx = -1;
            Integer gradeFromZip = (zipFileName != null) ? extractNumber(zipFileName) : null;
            if (gradeFromZip == null) {
                errors.add("'" + entryName + "': Không tìm thấy Lớp trong folder hoặc tên file ZIP");
                return null;
            }
            ctx.gradeLevel = gradeFromZip;
        }

        // Subject = folder right after grade (or first folder if no grade folder)
        int subjectIdx = gradeIdx + 1;
        ctx.subjectName = parts[subjectIdx].trim();

        // Chapter folder
        int chapterIdx = subjectIdx + 1;
        if (chapterIdx >= parts.length - 1) {
            errors.add("'" + entryName + "': Không tìm thấy folder Chương");
            return null;
        }
        Integer chapterNum = extractNumber(parts[chapterIdx]);
        if (chapterNum == null) {
            errors.add("'" + entryName + "': Không đọc được số chương từ '" + parts[chapterIdx] + "'");
            return null;
        }
        ctx.chapterNumber = chapterNum;

        // Lesson: either from folder or from file name
        int lessonIdx = chapterIdx + 1;
        if (lessonIdx < parts.length - 1) {
            // Lesson is a folder: .../Chương N/Bài M/file.docx
            Integer lessonNum = extractNumber(parts[lessonIdx]);
            if (lessonNum == null) {
                errors.add("'" + entryName + "': Không đọc được số bài từ '" + parts[lessonIdx] + "'");
                return null;
            }
            ctx.lessonNumber = lessonNum;
        } else {
            // Lesson from filename: .../Chương N/Bài_M.docx
            String fileNameNoExt = parts[parts.length - 1].replaceAll("\\.docx$", "");
            Integer lessonNum = extractNumber(fileNameNoExt);
            if (lessonNum == null) {
                errors.add("'" + entryName + "': Không đọc được số bài từ tên file '" + parts[parts.length - 1] + "'");
                return null;
            }
            ctx.lessonNumber = lessonNum;
        }

        return ctx;
    }

    private Lesson matchLesson(EntryContext ctx, List<String> errors) {
        // Match subject
        List<Subject> allSubjects = subjectRepository.findAll();
        Subject subject = matchSubject(allSubjects, ctx.subjectName);
        if (subject == null) {
            errors.add("Không tìm thấy môn '" + ctx.subjectName + "'. Có: " +
                    allSubjects.stream().map(Subject::getSubjectName).collect(Collectors.joining(", ")));
            return null;
        }

        // Match chapter
        List<Chapter> chapters = chapterRepository.findBySubjectAndGradeLevel(subject, ctx.gradeLevel);
        Chapter chapter = chapters.stream()
                .filter(c -> c.getChapterNumber() != null && c.getChapterNumber() == ctx.chapterNumber)
                .findFirst().orElse(null);
        if (chapter == null) {
            errors.add("Không tìm thấy Chương " + ctx.chapterNumber + " — " + subject.getSubjectName() + " Lớp " + ctx.gradeLevel +
                    ". Có: " + chapters.stream().map(c -> "Chương " + c.getChapterNumber()).collect(Collectors.joining(", ")));
            return null;
        }

        // Match lesson
        List<Lesson> lessons = lessonRepository.findByChapterId(chapter.getId());
        Lesson lesson = lessons.stream()
                .filter(l -> l.getLessonNumber() != null && l.getLessonNumber() == ctx.lessonNumber)
                .findFirst().orElse(null);
        if (lesson == null) {
            errors.add("Không tìm thấy Bài " + ctx.lessonNumber + " trong Chương " + ctx.chapterNumber +
                    " — " + subject.getSubjectName() + " Lớp " + ctx.gradeLevel +
                    ". Có: " + lessons.stream().map(l -> "Bài " + l.getLessonNumber()).collect(Collectors.joining(", ")));
            return null;
        }

        return lesson;
    }

    private Subject matchSubject(List<Subject> subjects, String folderName) {
        String norm = removeDiacritics(folderName).toLowerCase().trim();
        Map<String, String> aliases = new LinkedHashMap<>();
        aliases.put("khtn", "sci");
        aliases.put("khoa hoc tu nhien", "sci");
        aliases.put("toan", "toan");
        aliases.put("toan hoc", "toan");
        aliases.put("vat li", "ly");
        aliases.put("vat ly", "ly");
        aliases.put("hoa", "hoa");
        aliases.put("hoa hoc", "hoa");
        aliases.put("ly", "ly");
        aliases.put("sinh hoc", "sinh");

        String aliasCode = aliases.get(norm);
        if (aliasCode != null) {
            for (Subject s : subjects) {
                if (s.getSubjectCode().equalsIgnoreCase(aliasCode)) return s;
            }
        }
        for (Subject s : subjects) {
            String sn = removeDiacritics(s.getSubjectName()).toLowerCase();
            String sc = s.getSubjectCode().toLowerCase();
            if (sn.equals(norm) || sc.equals(norm) || sn.contains(norm) || norm.contains(sn) || norm.contains(sc)) {
                return s;
            }
        }
        return null;
    }

    // ─────────── Utilities ───────────

    private Integer extractNumber(String text) {
        Matcher m = Pattern.compile("(\\d+)").matcher(text);
        return m.find() ? Integer.parseInt(m.group(1)) : null;
    }

    private String removeDiacritics(String text) {
        if (text == null) return "";
        String nfd = Normalizer.normalize(text, Normalizer.Form.NFD);
        return nfd.replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                  .replaceAll("đ", "d").replaceAll("Đ", "D");
    }

    private byte[] readZipEntryBytes(ZipInputStream zis) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        byte[] buf = new byte[65536]; // 64KB buffer for faster I/O
        int len;
        while ((len = zis.read(buf)) > 0) baos.write(buf, 0, len);
        return baos.toByteArray();
    }

    private MultipartFile wrapBytes(byte[] bytes, String fileName) {
        return new MultipartFile() {
            @Override public String getName() { return "file"; }
            @Override public String getOriginalFilename() { return fileName; }
            @Override public String getContentType() { return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"; }
            @Override public boolean isEmpty() { return bytes.length == 0; }
            @Override public long getSize() { return bytes.length; }
            @Override public byte[] getBytes() { return bytes; }
            @Override public InputStream getInputStream() { return new ByteArrayInputStream(bytes); }
            @Override public void transferTo(java.io.File dest) throws IOException {
                try (FileOutputStream fos = new FileOutputStream(dest)) { fos.write(bytes); }
            }
        };
    }

    // ─────────── Result DTO ───────────

    public static class BulkResourceResult {
        public final int totalFiles;
        public final int totalCreated;
        public final int skipped;
        public final List<String> errors;
        public final Map<String, Integer> byGrade;

        public BulkResourceResult(int totalFiles, int totalCreated, int skipped,
                                  List<String> errors, Map<String, Integer> byGrade) {
            this.totalFiles = totalFiles;
            this.totalCreated = totalCreated;
            this.skipped = skipped;
            this.errors = errors;
            this.byGrade = byGrade;
        }
    }
}
