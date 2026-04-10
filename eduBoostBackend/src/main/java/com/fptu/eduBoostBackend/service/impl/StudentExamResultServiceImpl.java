package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.dto.response.StudentExamResultDetailResponse;
import com.fptu.eduBoostBackend.dto.response.StudentExamResultSummaryResponse;
import com.fptu.eduBoostBackend.entities.Exam;
import com.fptu.eduBoostBackend.entities.Student;
import com.fptu.eduBoostBackend.entities.StudentExamResult;
import com.fptu.eduBoostBackend.exception.exceptions.ResourceNotFoundException;
import com.fptu.eduBoostBackend.repositories.ExamRepository;
import com.fptu.eduBoostBackend.repositories.StudentExamResultRepository;
import com.fptu.eduBoostBackend.repositories.StudentRepository;
import com.fptu.eduBoostBackend.service.StudentExamResultService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentExamResultServiceImpl implements StudentExamResultService {

    private final StudentExamResultRepository studentExamResultRepository;
    private final StudentRepository studentRepository;
    private final ExamRepository examRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<StudentExamResultSummaryResponse> getStudentResults(String studentId,
                                                                    Long subjectId,
                                                                    Integer semester,
                                                                    String schoolYear,
                                                                    Pageable pageable) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        List<StudentExamResult> allResults = studentExamResultRepository.findByStudentStudentId(studentId);

        List<StudentExamResult> filtered = allResults.stream()
                .filter(result -> {
                    Exam exam = result.getExam();
                    if (exam == null) {
                        return false;
                    }
                    if (subjectId != null && (exam.getSubject() == null || !subjectId.equals(exam.getSubject().getId()))) {
                        return false;
                    }
                    if (semester != null && !semester.equals(exam.getSemester())) {
                        return false;
                    }
                    if (schoolYear != null && !schoolYear.equals(exam.getSchoolYear())) {
                        return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filtered.size());
        List<StudentExamResult> pageContent = start > filtered.size() ? Collections.emptyList() : filtered.subList(start, end);

        List<StudentExamResultSummaryResponse> summaries = pageContent.stream()
                .map(this::mapToSummary)
                .collect(Collectors.toList());

        return new PageImpl<>(summaries, pageable, filtered.size());
    }

    @Override
    @Transactional(readOnly = true)
    public StudentExamResultDetailResponse getStudentResultDetail(String studentId, Long resultId) {
        StudentExamResult result = studentExamResultRepository
                .findByStudentStudentIdAndResultId(studentId, resultId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam result not found for this student"));

        return mapToDetail(result);
    }

    private StudentExamResultSummaryResponse mapToSummary(StudentExamResult result) {
        Exam exam = result.getExam();

        BigDecimal maxScore = result.getMaxScore() != null ? result.getMaxScore() : exam != null ? exam.getTotalPoints() : null;
        BigDecimal percentage = result.getPercentage();
        if (percentage == null && maxScore != null && maxScore.compareTo(BigDecimal.ZERO) > 0) {
            percentage = result.getScore()
                    .multiply(BigDecimal.valueOf(100))
                    .divide(maxScore, 2, BigDecimal.ROUND_HALF_UP);
        }

        return StudentExamResultSummaryResponse.builder()
                .resultId(result.getResultId())
                .examId(exam != null ? exam.getId() : null)
                .examTitle(exam != null ? exam.getExamTitle() : null)
                .subjectName(exam != null && exam.getSubject() != null ? exam.getSubject().getDescription() : null)
                .subjectCode(exam != null && exam.getSubject() != null ? exam.getSubject().getSubjectCode() : null)
                .chapterName(exam != null && exam.getChapter() != null ? exam.getChapter().getChapterName() : null)
                .semester(exam != null ? exam.getSemester() : null)
                .schoolYear(exam != null ? exam.getSchoolYear() : null)
                .takenAt(result.getTakenAt())
                .score(result.getScore())
                .maxScore(maxScore)
                .percentage(percentage)
                .status(result.getStatus())
                .sourceType(result.getSourceType())
                .build();
    }

    private StudentExamResultDetailResponse mapToDetail(StudentExamResult result) {
        Exam exam = result.getExam();

        BigDecimal maxScore = result.getMaxScore() != null ? result.getMaxScore() : exam != null ? exam.getTotalPoints() : null;
        BigDecimal percentage = result.getPercentage();
        if (percentage == null && maxScore != null && maxScore.compareTo(BigDecimal.ZERO) > 0) {
            percentage = result.getScore()
                    .multiply(BigDecimal.valueOf(100))
                    .divide(maxScore, 2, BigDecimal.ROUND_HALF_UP);
        }

        return StudentExamResultDetailResponse.builder()
                .resultId(result.getResultId())
                .examId(exam != null ? exam.getId() : null)
                .examTitle(exam != null ? exam.getExamTitle() : null)
                .subjectName(exam != null && exam.getSubject() != null ? exam.getSubject().getDescription() : null)
                .subjectCode(exam != null && exam.getSubject() != null ? exam.getSubject().getSubjectCode() : null)
                .chapterName(exam != null && exam.getChapter() != null ? exam.getChapter().getChapterName() : null)
                .semester(exam != null ? exam.getSemester() : null)
                .schoolYear(exam != null ? exam.getSchoolYear() : null)
                .takenAt(result.getTakenAt())
                .score(result.getScore())
                .maxScore(maxScore)
                .percentage(percentage)
                .status(result.getStatus())
                .sourceType(result.getSourceType())
                .gradingCriteria(null)
                .teacherComment(null)
                .questionBreakdowns(Collections.emptyList())
                .build();
    }
}

