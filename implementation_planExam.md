# Exam Preview Enhancements

## Issues & Features

### 1. Bug: 15MIN exam generates 20 questions instead of 10
**Root cause**: In [autoSelectQuestionsWithConfig](file:///d:/EXE201/EduBoost/eduBoostBackend/src/main/java/com/fptu/eduBoostBackend/service/impl/ExamServiceImpl.java#401-504), the cognitive level loop (`for levelEntry : cognitiveLevelDist`) runs inside the lesson loop — for each lesson, ALL cognitive level quotas are filled. With 2 lessons × 10 cognitive level total = 20 questions.

**Fix**: Distribute cognitive level counts proportionally across lessons.

### 2. AI questions don't show cognitive level badge
**Root cause**: AI-generated [ExamQuestion](file:///d:/EXE201/EduBoost/eduBoostBackend/src/main/java/com/fptu/eduBoostBackend/service/impl/ExamServiceImpl.java#686-718) has no `question` (QuestionBank) reference, so [mapToExamQuestionResponse](file:///d:/EXE201/EduBoost/eduBoostBackend/src/main/java/com/fptu/eduBoostBackend/service/impl/ExamServiceImpl.java#1028-1063) returns `cognitiveLevelName = null`.

**Fix**: Store `cognitiveLevel` directly on [ExamQuestion](file:///d:/EXE201/EduBoost/eduBoostBackend/src/main/java/com/fptu/eduBoostBackend/service/impl/ExamServiceImpl.java#686-718) entity, populate it during AI generation, and read it in the mapper.

### 3. New: "AI tạo lại" button — regenerate a single question via AI  
### 4. New: "Load câu hỏi khác" — swap with another from question bank (same filters)
### 5. New: "Lưu vào ngân hàng" — save AI/edited questions to QuestionBank

---

## Proposed Changes

### Backend — ExamQuestion entity & mapper

#### [MODIFY] [ExamQuestion.java](file:///d:/EXE201/EduBoost/eduBoostBackend/src/main/java/com/fptu/eduBoostBackend/entities/ExamQuestion.java)
- Add `cognitiveLevel` field (ManyToOne to CognitiveLevel)

#### [MODIFY] [ExamServiceImpl.java](file:///d:/EXE201/EduBoost/eduBoostBackend/src/main/java/com/fptu/eduBoostBackend/service/impl/ExamServiceImpl.java)
- [autoSelectQuestionsWithConfig](file:///d:/EXE201/EduBoost/eduBoostBackend/src/main/java/com/fptu/eduBoostBackend/service/impl/ExamServiceImpl.java#401-504): Fix distribution logic — divide cognitive level counts proportionally across lessons
- [generateAIQuestionsForExam](file:///d:/EXE201/EduBoost/eduBoostBackend/src/main/java/com/fptu/eduBoostBackend/service/impl/ExamServiceImpl.java#552-617): Set `cognitiveLevel` on the [ExamQuestion](file:///d:/EXE201/EduBoost/eduBoostBackend/src/main/java/com/fptu/eduBoostBackend/service/impl/ExamServiceImpl.java#686-718)
- [mapToExamQuestionResponse](file:///d:/EXE201/EduBoost/eduBoostBackend/src/main/java/com/fptu/eduBoostBackend/service/impl/ExamServiceImpl.java#1028-1063): Also read `eq.getCognitiveLevel()` as fallback when `eq.getQuestion()` is null

---

### Frontend — ExamGenerator.jsx

#### [MODIFY] [ExamGenerator.jsx](file:///d:/EXE201/EduBoost/eduBoostFrontend/src/pages/teacher/ExamGenerator.jsx)
- Add 3 new action buttons per question card:
  - **🔄 AI tạo lại**: Calls `examService.aiRegenerateQuestion(examId, questionId)` → replaces the question
  - **📚 Load câu hỏi khác**: Opens a modal to pick from question bank (filtered by lesson/chapter/subject/grade + cognitive level)
  - **💾 Lưu vào ngân hàng**: Saves AI/edited question to QuestionBank (for AI_GENERATED or TEACHER_EDITED only)

---

## Verification Plan

### Automated
- Create a 15MIN exam with 10 questions (2 lessons × 5 each, nb=4 th=4 vd=2) → verify exactly 10 questions generated
- Verify AI questions show cognitive level badge

### Manual
- Test all 5 buttons (Edit, Delete, AI Regenerate, Bank Swap, Save to Bank)
