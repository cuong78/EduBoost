## 🎯 SƠ ĐỒ LUỒNG HỆ THỐNG
```
┌─────────────────────────────────────────────────────────────────────┐
│                       HỆ THỐNG TẠO ĐỀ THI AI                        │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│  1. SETUP HỆ THỐNG   │
└──────────┬───────────┘
           │
           ├─► Tạo môn học (Toán, Lý, Hóa, Anh)
           ├─► Tạo lớp học (10A1, 11B2...)
           ├─► Thêm giáo viên, học sinh
           ├─► Phân quyền
           │
           ▼
┌──────────────────────┐
│  2. QUẢN LÝ KIẾN     │
│     THỨC             │
└──────────┬───────────┘
           │
           ├─► Tạo chương (theo môn + khối)
           ├─► Tạo bài học trong chương
           ├─► Upload tài nguyên (PDF, DOCX, URL)
           │   └─► Hệ thống tự động extract nội dung
           │
           ▼
┌──────────────────────────────────────────────────────────┐
│  3. XÂY DỰNG NGÂN HÀNG CÂU HỎI                           │
└──────────┬───────────────────────────────────────────────┘
           │
           ├─► CÁCH 1: Nhập thủ công
           │   └─► Form tạo câu hỏi + đáp án đúng
           │
           ├─► CÁCH 2: Import từ Excel/CSV
           │   └─► Template có sẵn
           │
           ├─► CÁCH 3: AI tự sinh từ tài nguyên
           │   ├─► Chọn bài học + tài nguyên
           │   ├─► Cấu hình: số câu, mức độ, độ khó
           │   ├─► AI đọc nội dung → Tạo câu hỏi
           │   └─► Giáo viên review & verify
           │
           └─► CÁCH 4: AI sinh dựa trên câu có sẵn
               ├─► Chọn câu hỏi mẫu
               ├─► AI tạo biến thể (variation)
               └─► Lưu vào ngân hàng
           │
           ▼
┌──────────────────────────────────────────────────────────┐
│  4. TẠO ĐỀ THI                                           │
└──────────┬───────────────────────────────────────────────┘
           │
           ├─► CHỌN LOẠI ĐỀ:
           │   ├─► 15 phút (không cần ma trận)
           │   ├─► 1 tiết (cần ma trận)
           │   └─► Học kì (cần ma trận)
           │
           ▼
    ┌──────────────┴──────────────┐
    │                             │
    ▼                             ▼
┌────────────┐            ┌─────────────┐
│ ĐỀ 15 PHÚT │            │ ĐỀ 1 TIẾT   │
└─────┬──────┘            │ & HỌC KÌ    │
      │                   └─────┬───────┘
      │                         │
      ├─► Chọn 2-3 bài          ├─► Chọn/Tạo ma trận
      ├─► Cấu hình:             ├─► Chọn nhiều bài
      │   • Tổng số câu         ├─► Phân bổ câu theo:
      │   • Điểm/câu            │   • Bài học
      │   • Phân bổ theo bài    │   • Mức độ nhận thức
      │                         │   • Số câu mỗi loại
      │                         │
      └─────────┬───────────────┘
                │
                ▼
        ┌──────────────────────────┐
        │ HỆ THỐNG TỰ ĐỘNG LẤY CÂU │
        └────────┬─────────────────┘
                 │
                 ├─► 1. Tìm trong ngân hàng (ưu tiên)
                 │   └─► Lọc theo: bài, mức độ, đã verify
                 │
                 ├─► 2. Nếu thiếu → AI tạo mới
                 │   ├─► Đọc tài nguyên bài học
                 │   ├─► Tham khảo câu mẫu
                 │   ├─► Tạo câu mới
                 │   └─► AI sinh 3 đáp án sai
                 │
                 ▼
        ┌──────────────────────────┐
        │ PREVIEW & CHỈNH SỬA ĐỀ   │
        └────────┬─────────────────┘
                 │
                 ├─► Hiển thị danh sách câu:
                 │   ├─► 🤖 AI generated
                 │   ├─► 📚 Từ ngân hàng
                 │   └─► ✏️ Đã chỉnh sửa
                 │
                 ├─► Giáo viên có thể:
                 │   ├─► Sửa câu hỏi
                 │   ├─► Sửa đáp án đúng
                 │   ├─► Sinh lại đáp án sai
                 │   ├─► Xóa câu
                 │   ├─► Thêm câu từ bank
                 │   ├─► Để AI tạo thêm
                 │   └─► Sắp xếp lại thứ tự
                 │
                 ▼
        ┌──────────────────────────┐
        │ DUYỆT ĐỀ                 │
        └────────┬─────────────────┘
                 │
                 ├─► Validate đề thi
                 ├─► Lưu câu hỏi vào ngân hàng:
                 │   ├─► Câu AI mới → Tạo record mới
                 │   ├─► Câu đã sửa → Tạo version mới
                 │   └─► Câu từ bank → Tăng usage_count
                 │
                 ├─► Đổi status: DRAFT → APPROVED
                 │
                 ▼
        ┌──────────────────────────┐
        │ EXPORT ĐỀ THI            │
        └────────┬─────────────────┘
                 │
                 ├─► PDF (in đẹp)
                 ├─► DOCX (chỉnh sửa)
                 └─► Đề + Đáp án riêng

┌──────────────────────────────────────────────────────────┐
│  5. QUẢN LÝ & PHÂN TÍCH (Tương lai)                      │
└──────────┬───────────────────────────────────────────────┘
           │
           ├─► Giao đề cho lớp
           ├─► Học sinh làm bài online
           ├─► Chấm điểm tự động
           ├─► Thống kê & báo cáo
           └─► Phân tích chất lượng câu hỏi


MODULE 1: KNOWLEDGE STRUCTURE

// Subjects (Môn học)
GET    /api/subjects                // Danh sách môn học
POST   /api/subjects                // Tạo môn học mới
GET    /api/subjects/{id}           // Chi tiết môn học
PUT    /api/subjects/{id}           // Cập nhật môn học
DELETE /api/subjects/{id}           // Xóa môn học

// Chapters (Chương)
GET    /api/subjects/{subjectId}/chapters?classid=10   // Danh sách chương theo môn & khối
POST   /api/subjects/{subjectId}/chapters   // Tạo chương mới
GET    /api/chapters/{id}           // Chi tiết chương
PUT    /api/chapters/{id}           // Cập nhật chương
DELETE /api/chapters/{id}           // Xóa chương

// Lessons (Bài học)
GET    /api/chapters/{chapterId}/lessons  // Danh sách bài trong chương
POST   /api/chapters/{chapterId}/lessons   // Tạo bài học mới
GET    /api/lessons/{id}            // Chi tiết bài học
PUT    /api/lessons/{id}            // Cập nhật bài học
DELETE /api/lessons/{id}            // Xóa bài học

// Lesson Resources (Tài nguyên)
GET    /api/lessons/{lessonId}/resources  // Danh sách tài nguyên của bài
POST   /api/lessons/{lessonId}/resources // Upload tài nguyên (PDF, DOCX, URL)
GET    /api/resources/{id}          // Chi tiết tài nguyên
GET    /api/resources/{id}/download // Download file
DELETE /api/resources/{id}          // Xóa tài nguyên
POST   /api/resources/{id}/extract  // Extract nội dung từ file



MODULE 2: QUESTION BANK
// Cognitive Levels
GET    /api/cognitive-levels        // Danh sách mức độ nhận thức

// Question Bank
GET    /api/question-bank           // Danh sách câu hỏi
       ?lessonId=1
       &cognitiveLevelId=2
       &isVerified=true
       &sourceType=AI_GENERATED

(trường nào null thì sẽ get hết) 

POST   /api/question-bank           // Tạo câu hỏi thủ công
{
  "lessonId": 1,
  "questionText": "...",
  "correctAnswer": "...",
  "explanation": "...",
  "questionType": "MULTIPLE_CHOICE",
  "cognitiveLevelId": 2,
  "difficultyLevel": "MEDIUM",
  "sourceType": "MANUAL"
}

GET    /api/question-bank/{id}      // Chi tiết câu hỏi
PUT    /api/question-bank/{id}      // Cập nhật câu hỏi
DELETE /api/question-bank/{id}      // Xóa câu hỏi
PUT    /api/question-bank/{id}/verify  // Verify câu hỏi (giáo viên senior)

// Import/Export
POST   /api/question-bank/import    // Import từ Excel/CSV
GET    /api/question-bank/export ?lessonId=1&format=EXCEL
    // Export ra Excel 

GET    /api/question-bank/template  // Download template Excel

// Statistics
GET    /api/question-bank/stats     // Thống kê ngân hàng câu hỏi
       ?subjectId=1&gradeLevel=10
Response: {
  "totalQuestions": 1500,
  "byLesson": [...],
  "byCognitiveLevel": {...},
  "byDifficultyLevel": {...},
  "verifiedCount": 1200,
  "aiGeneratedCount": 500
}



MODULE 3: AI SERVICES
// Generate Questions from Resources
POST   /api/ai/generate-from-resource
{
  "resourceId": 5,
  "lessonId": 1,
  "numberOfQuestions": 10,
  "cognitiveLevelDistribution": {
    "RECOGNITION": 4,
    "COMPREHENSION": 4,
    "APPLICATION": 2
  },
  "questionType": "MULTIPLE_CHOICE",
  "aiProvider": "DEEPSEEK"
}
Response: {
  "generatedQuestions": [
    {
      "questionText": "...",
      "correctAnswer": "...",
      "wrongAnswers": ["...", "...", "..."],
      "explanation": "...",
      "cognitiveLevel": "RECOGNITION"
    }
  ],
  "tokensUsed": 2500,
  "generationTimeMs": 3500
}

// Generate Question Variations
POST   /api/ai/generate-variations
{
  "baseQuestionIds": [1, 2, 3],
  "numberOfVariations": 5,
  "aiProvider": "CLAUDE"
}

// Generate from URL
POST   /api/ai/generate-from-url
{
  "url": "https://example.com/article",
  "lessonId": 1,
  "numberOfQuestions": 5,
  "cognitiveLevelId": 2
}

// Generate Wrong Answers
POST   /api/ai/generate-wrong-answers
{
  "questionText": "...",
  "correctAnswer": "...",
  "subjectCode": "TOAN",
  "cognitiveLevelCode": "RECOGNITION"
}
Response: {
  "wrongAnswers": [
    "Đáp án sai 1",
    "Đáp án sai 2",
    "Đáp án sai 3"
  ]
}

ghi chú: {API độc lập, không liên quan đến đề thi cụ thể
Dùng khi giáo viên đang tạo/sửa câu hỏi trong ngân hàng
Hoặc khi cần preview/test đáp án sai  (không lưu xuống database)
}

// Evaluate Question Quality
POST   /api/ai/evaluate-question
{
  "questionId": 10
}
Response: {
  "score": 8.5,
  "feedback": "Câu hỏi rõ ràng, đáp án hợp lý...",
  "suggestions": [
    "Có thể làm đáp án sai khó hơn để tăng tính phân biệt"
  ]
}

// AI Generation History
GET    /api/ai/history              // Lịch sử generate
       ?lessonId=1&aiProvider=DEEPSEEK



MODULE 6: EXAM MANAGEMENT

// Exam Types
GET    /api/exam-types              // Danh sách loại đề

// Matrix Templates
GET    /api/matrix-templates        // Danh sách ma trận mẫu
       ?examTypeId=2&subjectId=1&gradeLevel=10

POST   /api/matrix-templates        // Tạo ma trận mới
{
  "templateName": "Ma trận Toán 10 - 1 tiết",
  "examTypeId": 2,
  "subjectId": 1,
  "gradeLevel": 10,
  "totalQuestions": 20,
  "totalPoints": 10,
  "details": [
    {
      "cognitiveLevelId": 1,
      "numberOfQuestions": 8,
      "pointsPerQuestion": 0.5
    },
    ...
  ]
}

GET    /api/matrix-templates/{id}   // Chi tiết ma trận
PUT    /api/matrix-templates/{id}   // Cập nhật ma trận
DELETE /api/matrix-templates/{id}   // Xóa ma trận

// Exams
GET    /api/exams                   // Danh sách đề thi
       ?subjectId=1
       &gradeLevel=10
       &examTypeId=2
       &status=APPROVED
       &createdBy=5
       &page=0&size=20

POST   /api/exams                   // Tạo đề thi mới
{
  "examTitle": "Kiểm tra 15' - Chương 1",
  "examTypeId": 1,
  "subjectId": 1,
  "gradeLevel": 10,
  "chapterId": 1,
  "durationMinutes": 15,
  "lessonIds": [1, 2, 3],
  "config": {
    // Cho đề 15 phút
    "totalQuestions": 10,
    "pointsPerQuestion": 1.0,
    "lessonDistribution": [
      { "lessonId": 1, "numberOfQuestions": 4 },
      { "lessonId": 2, "numberOfQuestions": 3 },
      { "lessonId": 3, "numberOfQuestions": 3 }
    ]
  }
}

// Hoặc cho đề 1 tiết/học kì
POST   /api/exams
{
  "examTitle": "Kiểm tra 1 tiết - Chương 1",
  "examTypeId": 2,
  "subjectId": 1,
  "gradeLevel": 10,
  "chapterId": 1,
  "matrixTemplateId": 5,
  "durationMinutes": 45,
  "lessonIds": [1, 2, 3, 4],
  "requirements": [
    {
      "lessonId": 1,
      "cognitiveLevelId": 1,
      "numberOfQuestions": 2,
      "pointsPerQuestion": 0.5
    },
    ...
  ]
}

GET    /api/exams/{id}                  // Chi tiết đề thi
PUT    /api/exams/{id}                  // Cập nhật thông tin đề
DELETE /api/exams/{id}              // Xóa đề (chỉ DRAFT)

// Auto-select Questions
POST   /api/exams/{examId}/auto-select
                                    // Tự động chọn câu hỏi cho đề
Response: {
  "totalQuestionsAdded": 20,
  "fromExistingBank": 15,
  "aiGenerated": 5,
  "questions": [...]
}

// Manual Add Questions
POST   /api/exams/{examId}/questions
{
  "questionId": 456,
  "orderNumber": 5,
  "points": 0.5
}

// AI Generate More Questions
POST   /api/exams/{examId}/questions/ai-generate
{
  "lessonId": 2,
  "cognitiveLevelId": 1,
  "numberOfQuestions": 2
}

// Edit Question in Exam
PUT    /api/exams/{examId}/questions/{examQuestionId}
{
  "modifiedQuestionText": "...",
  "modifiedCorrectAnswer": "...",
  "modifiedExplanation": "..."
}

// Regenerate Wrong Answers
POST   /api/exams/{examId}/questions/{examQuestionId}/regenerate-wrong-answers
(ghi chú: API phụ thuộc vào context của đề thi đang tạo
Dùng khi giáo viên đang preview/chỉnh sửa đề thi
Đáp án sai sẽ được lưu trực tiếp vào exam_question table
)

// Delete Question from Exam
DELETE /api/exams/{examId}/questions/{examQuestionId}

// Reorder Questions
PUT    /api/exams/{examId}/questions/reorder
{
  "questionOrders": [
    { "examQuestionId": 1, "newOrderNumber": 2 },
    { "examQuestionId": 2, "newOrderNumber": 1 }
  ]
}

// Approve Exam
POST   /api/exams/{examId}/approve  // Duyệt đề, lưu câu vào bank
Response: {
  "examId": 123,
  "status": "APPROVED",
  "newQuestionsSaved": 8,
  "breakdown": {
    "aiGenerated": 5,
    "teacherEdited": 3
  }
}

// Change Status
PUT    /api/exams/{examId}/status
{
  "newStatus": "PUBLISHED",
  "note": "Đề đã được kiểm tra kỹ"
}

// Export
GET    /api/exams/{id}/export?format=PDF
GET    /api/exams/{id}/export?format=DOCX
GET    /api/exams/{id}/export-answer-key?format=PDF

// Clone Exam
POST   /api/exams/{id}/clone        // Nhân bản đề thi

// Statistics
GET    /api/exams/{id}/statistics   // Thống kê về đề
GET    /api/exams/my-exams          // Đề thi của tôi tạo
