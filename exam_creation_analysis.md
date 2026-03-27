# Phân tích luồng tạo đề thi EduBoost

## Tổng quan luồng

Frontend ([ExamGenerator.jsx](file:///d:/EXE201/EduBoost/eduBoostFrontend/src/pages/teacher/ExamGenerator.jsx)) có **2 luồng** tạo đề thi:

```mermaid
flowchart TD
    A[Teacher chọn cấu hình] --> B{Loại đề?}
    B -->|15MIN| C[POST /api/exams - createExam]
    B -->|45MIN/MIDTERM/FINAL| D[POST /api/exams - createExam<br/>+ matrixTemplateId]
    C --> E[POST /api/exams/{id}/auto-select-with-config<br/>gửi lessonDistribution + levelDistribution]
    D --> F[POST /api/exams/{id}/auto-select<br/>không gửi config - đọc từ matrix]
    E --> G[Backend: autoSelectQuestionsWithConfig]
    F --> H[Backend: autoSelectQuestions]
    G --> I[Preview đề thi]
    H --> I
```

---

## Luồng 1: Kiểm tra 15 phút (15MIN)

### Frontend gửi gì:

1. **`POST /api/exams`** — tạo exam DRAFT:
   ```json
   {
     "examTitle": "...",
     "examTypeId": 1,
     "subjectId": 5,
     "gradeLevel": 10,
     "chapterId": 12,
     "durationMinutes": 15,
     "lessonIds": [31, 32],
     "config": {
       "totalQuestions": 10,
       "pointsPerQuestion": 1,
       "lessonDistribution": [
         { "lessonId": 31, "numberOfQuestions": 5 },
         { "lessonId": 32, "numberOfQuestions": 5 }
       ]
     }
   }
   ```

2. **`POST /api/exams/{id}/auto-select-with-config`** — chọn câu hỏi:
   ```json
   {
     "lessonDistribution": [
       { "lessonId": 31, "numberOfQuestions": 5 },
       { "lessonId": 32, "numberOfQuestions": 5 }
     ],
     "cognitiveLevelDistributionByCode": {
       "nb": 4, "th": 4, "vd": 2, "vdc": 0
     },
     "useAiGeneration": true
   }
   ```

---

## Luồng 2: Ma trận (45MIN / MIDTERM / FINAL)

1. **`POST /api/exams`** — tạo exam với `matrixTemplateId`
2. **`POST /api/exams/{id}/auto-select`** — backend tự đọc matrix template để phân bổ

---

## 🔴 Bug 1: Số câu bị nhân đôi (15MIN flow)

### File: [ExamServiceImpl.java](file:///d:/EXE201/EduBoost/eduBoostBackend/src/main/java/com/fptu/eduBoostBackend/service/impl/ExamServiceImpl.java#L401-L503)

**Vấn đề**: [autoSelectQuestionsWithConfig](file:///d:/EXE201/EduBoost/eduBoostBackend/src/main/java/com/fptu/eduBoostBackend/controller/ExamController.java#107-116) lặp qua **mỗi lesson** × **mỗi cognitive level**, nhưng áp dụng **toàn bộ** cognitive level distribution cho **mỗi lesson**.

```java
// Line 425-458: Vòng lặp lồng nhau
for (LessonDistributionRequest lessonDist : request.getLessonDistribution()) {
    // Lesson 1, Lesson 2, ...
    for (Map.Entry<Long, Integer> levelEntry : cognitiveLevelDist.entrySet()) {
        int neededForLevel = levelEntry.getValue(); // nb=4, th=4, vd=2
        // ← BUG: Lấy 4 câu NB cho LESSON 1, rồi 4 câu NB cho LESSON 2 = 8 câu NB total!
    }
}
```

**Ví dụ**: User chọn 2 bài × phân bổ NB=4, TH=4, VD=2 (tổng 10)
- **Kỳ vọng**: 10 câu total
- **Thực tế**: 2 lessons × (4+4+2) = **20 câu** (nếu đủ câu trong bank)
- Hoặc **ít hơn 10** nếu bank thiếu câu và AI fail

> [!CAUTION]
> Đây là bug chính gây ra hiện tượng "yêu cầu 10 câu, lại ra 2 câu" hoặc ra nhiều hơn 10 câu. Số câu phụ thuộc vào quesiton bank có bao nhiêu câu matching.

---

## 🔴 Bug 2: AI generation fail im lặng

### File: [ExamServiceImpl.java:552-616](file:///d:/EXE201/EduBoost/eduBoostBackend/src/main/java/com/fptu/eduBoostBackend/service/impl/ExamServiceImpl.java#L552-L616)

[generateAIQuestionsForExam](file:///d:/EXE201/EduBoost/eduBoostBackend/src/main/java/com/fptu/eduBoostBackend/service/impl/ExamServiceImpl.java#552-617) trả về **list rỗng** (0 câu) mà không throw exception trong các trường hợp:

| Trường hợp | Hành vi | Dòng |
|---|---|---|
| Lesson không có resource | `return generated` (rỗng) | 562-564 |
| Resource không có `extractedContent` | `return generated` (rỗng) | 573-575 |
| DeepSeek API lỗi (429/500/timeout) | `catch` → log error → return rỗng | 611-613 |

→ User thấy đề thi có **ít câu hơn yêu cầu** nhưng không biết tại sao.

---

## 🟡 Bug 3: Non-matrix [autoSelectQuestions](file:///d:/EXE201/EduBoost/eduBoostBackend/src/main/java/com/fptu/eduBoostBackend/service/impl/ExamServiceImpl.java#225-400) không gọi AI

### File: [ExamServiceImpl.java:354-389](file:///d:/EXE201/EduBoost/eduBoostBackend/src/main/java/com/fptu/eduBoostBackend/service/impl/ExamServiceImpl.java#L354-L389)

Khi exam **không có matrix** và bank thiếu câu:

```java
// Line 376-384
if (needed > 0 && exam.getChapter() != null) {
    for (Lesson lesson : lessons) {
        if (needed <= 0) break;
        List<LessonResource> resources = resourceRepository.findByLessonId(lesson.getId());
        if (!resources.isEmpty()) {
            log.info("Would generate {} AI questions...", ...); // CHỈ LOG, KHÔNG GENERATE!
        }
    }
}
```

→ AI fallback chỉ **log** mà **không thực sự generate** câu hỏi.

---

## 🟡 Bug 4: Lỗi "Không thể tạo/preview đề thi" (screenshot của user)

Lỗi này xảy ra khi frontend catch exception ở `ExamGenerator.jsx:502-506`:

```javascript
} catch (e) {
    showErrorToast("Không thể tạo/preview đề thi. Vui lòng kiểm tra backend API.");
}
```

Nguyên nhân có thể:
1. **Token hết hạn** (đã fix ở task trước)
2. **Backend throw exception** — `totalQuestions = 0` (line 416), exam type not found, etc.
3. **Timeout** — [autoSelectQuestionsWithConfig](file:///d:/EXE201/EduBoost/eduBoostBackend/src/main/java/com/fptu/eduBoostBackend/controller/ExamController.java#107-116) timeout sau 120s (nếu AI generate lâu)

---

## Tóm tắt

| Bug | Mức độ | Ảnh hưởng |
|---|---|---|
| **Bug 1**: Cognitive level × Lesson multiplication | 🔴 Critical | Số câu sai so với yêu cầu |
| **Bug 2**: AI fail im lặng | 🔴 Critical | Thiếu câu mà không có thông báo |
| **Bug 3**: Non-matrix AI chỉ log | 🟡 Medium | AI không generate cho 15MIN non-config flow |
| **Bug 4**: Generic error toast | 🟡 Medium | User không biết nguyên nhân lỗi |
