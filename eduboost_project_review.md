# 🔍 EduBoost Project — Tổng Quan & Đánh Giá Toàn Diện

## Tóm tắt dự án

EduBoost là nền tảng giáo dục AI-powered gồm:
- **Backend**: Spring Boot 4.x + PostgreSQL + MinIO + VietQR
- **Frontend**: React (Vite) với RBAC cho 4 roles: Admin, Teacher, Student, Parent
- **Tính năng chính**: Quản lý đề thi, ngân hàng câu hỏi, sinh câu hỏi AI (DeepSeek), thanh toán VietQR, quản lý lớp học

---

## 🚨 PHẦN 1: Các chức năng HARD-CODE (KHÔNG chạy thực sự)

> [!CAUTION]
> Những phần dưới đây đang hoàn toàn sử dụng dữ liệu giả (mock/static), **không gọi API backend** và sẽ nhìn thấy cùng kết quả bất kể trạng thái thực của hệ thống.

### 1.1 🎯 Student — AI Chat (`AIChat.jsx`)
**Mức độ: 100% Hard-code**

- Chat AI hoàn toàn dùng logic `setTimeout` + matching keyword đơn giản (line 28-52)
- Không gọi API backend, không kết nối DeepSeek hay bất kỳ LLM nào
- Response được trả về cố định dựa trên keyword: "toán", "lý", "hóa", "anh"
- Nút **Mic** (Voice Input) chỉ có giao diện, **không có chức năng**

```jsx
// Chỉ là mock response, không phải AI thật
setTimeout(() => {
    let responseText = "Thầy đang suy nghĩ câu trả lời cho em...";
    if (lowerInput.includes("toán")) {
        responseText = "Về môn Toán, em đang gặp khó khăn ở phần nào?...";
    }
}, 1500);
```

---

### 1.2 📝 Student — Take Exam (`TakeExam.jsx`)
**Mức độ: 100% Hard-code**

- Toàn bộ đề thi (5 câu) được hard-code trực tiếp trong component (line 18-31)
- Mật khẩu bài thi hardcoded: `"123"` 
- Không gọi `examService` hay bất kỳ API nào để load đề
- Tính điểm, chấm bài **hoàn toàn ở client** — không gửi kết quả về server
- Không lưu kết quả (StudentExamResult) vào database

```jsx
const examConfig = {
    title: "Kiểm tra giữa kỳ Giải tích 1",
    password: "123",   // ← HARD-CODED
    questions: [
        { id: 1, text: "Tính đạo hàm...", options: [...], correct: "2x + 3" },
        // ...
    ]
};
```

---

### 1.3 📋 Student — Exam List (`ExamList.jsx`)
**Mức độ: 100% Hard-code**

- Danh sách bài thi: 6 đề thi mock cố định (line 108-115)
- Thống kê (bài tập chờ, đã hoàn thành, điểm TB): tất cả hardcoded
- Nút **Lọc** và **Tìm kiếm**: chỉ có giao diện, không hoạt động
- Không gọi API lấy danh sách exam được phân công cho student

---

### 1.4 📚 Student — Course Library (`CourseLibrary.jsx`)
**Mức độ: 100% Hard-code**

- 6 courses mẫu cố định (line 4-11)
- Tìm kiếm input: **không lọc, chỉ là giao diện**
- Nút "Học ngay": **không chuyển trang, không có hành động**
- Dropdown lọc khối/môn: lọc trên dữ liệu mock, không load từ API

---

### 1.5 💬 Student — Forum (`Forum.jsx`)
**Mức độ: 100% Hard-code**

- 3 bài viết mẫu cố định
- Nút "Tạo bài viết": **không hoạt động**
- Chủ đề hot: danh sách tĩnh
- Không có backend API cho forum, không có entity Forum/Post trong database

---

### 1.6 ⚙️ Admin — Settings (`Settings.jsx`)
**Mức độ: 100% Hard-code**

- Tất cả input/toggle chỉ là `defaultValue`, không bound với state
- Nút "Save Changes": **không gửi request, không lưu gì**
- Không có API backend cho system settings
- Maintenance Mode toggle: **chỉ là giao diện**

---

### 1.7 📊 Admin — Dashboard (`AdminDashboard.jsx`)
**Mức độ: 100% Hard-code**

- Server Status "Operational", Uptime "99.9%": dữ liệu tĩnh
- Total Users "2,453": hardcoded, không lấy từ API
- System Load "34%": hardcoded
- Revenue "$12,450": hardcoded, **không đúng đơn vị (USD thay vì VND)**
- System Logs: 5 log entry tĩnh

---

### 1.8 🧪 Pricing — Savings Calculation (`Pricing.jsx`)
**Vấn đề nhỏ**: Magic number fallback

```jsx
// Line 280 — fallback hardcode nếu monthly.price null
Tiết kiệm {fmtVND(monthly?.price ? monthly.price * 2 : 278000)} so với theo tháng
```

---

## 🔐 PHẦN 2: Lỗ hổng BẢO MẬT nghiêm trọng

> [!WARNING]
> Những vấn đề bảo mật dưới đây cần được khắc phục **NGAY** trước khi deploy production.

### 2.1 🚫 Admin API hoàn toàn KHÔNG CÓ authentication

Trong [SecurityConstants.java](file:///d:/EXE201/EduBoost/eduBoostBackend/src/main/java/com/fptu/eduBoostBackend/security/SecurityConstants.java#L23):

```java
"/api/admin/**",  // TODO: Remove after fixing role check
```

**Hậu quả**: Bất kỳ ai (kể cả chưa đăng nhập) đều có thể gọi TẤT CẢ các admin API: quản lý user, xóa dữ liệu, thay đổi subscription...

### 2.2 🔑 Credentials bị lộ trong `.env`

File [.env](file:///d:/EXE201/EduBoost/eduBoostBackend/.env) **KHÔNG NẰM TRONG .gitignore** (hoặc đang commit) chứa:
- JWT Secret key
- Database password (`123456`)
- Gmail App Password
- DeepSeek API Key
- Cloudinary credentials
- Google OAuth Client Secret
- VietQR credentials (username, password, account number)
- VNPay Secret Key

### 2.3 🔒 JWT Expiration quá dài

```
JWT_EXPIRATION_MS=360000000     → ~4.2 ngày (nên ~15-30 phút)
JWT_REFRESH_EXPIRATION_MS=8640000000  → ~100 ngày (nên ~7 ngày)
```

### 2.4 Student routes KHÔNG có RequireRole

Trong [App.jsx](file:///d:/EXE201/EduBoost/eduBoostFrontend/src/App.jsx#L152-L158):

```jsx
{/* Student Dashboard Routes — KHÔNG CÓ RequireRole */}
<Route path="/student" element={<StudentLayout />}>
```

So với Teacher và Admin **đều có** `<RequireRole>`:
```jsx
<Route element={<RequireRole allow={["TEACHER"]} />}>
<Route element={<RequireRole allow={["ADMIN"]} />}>
```

→ Student route bất kỳ ai đăng nhập đều vào được (Teacher, Parent có thể truy cập)

### 2.5 Parent routes KHÔNG có RequireRole

```jsx
<Route path="/parent" element={<ParentLayout />}>
```

→ Tương tự student, bất kỳ user nào cũng có thể xem thông tin phụ huynh.

---

## ⚠️ PHẦN 3: Vấn đề thiết kế & kỹ thuật

### 3.1 Code Structure Issues

| Vấn đề | Chi tiết |
|--------|----------|
| **File quá lớn** | `CreateQuestion.jsx` (112KB), `ExamGenerator.jsx` (107KB), `LessonResources.jsx` (57KB), `QuestionBank.jsx` (53KB) — cần tách component |
| **Inline CSS `<style>` tags** | Hầu hết student pages (`Forum`, `ExamList`, `TakeExam`, `CourseLibrary`, `AIChat`) đều dùng inline `<style>` tag thay vì CSS file riêng |
| **Mock data tràn lan** | `examService.js`, `teacherService.js`, `parentService.js`, `knowledgeService.js` đều có mock logic phức tạp trộn lẫn với production code |
| **Hàm `useMock()`** | Exported từ `invitationMockData.js` nhưng used bởi nhiều service không liên quan |
| **Mock fallback nguy hiểm** | `teacherService`, `parentService` tự động fallback sang mock khi gặp 404 hoặc network error → che giấu lỗi thật |

### 3.2 Architecture Concerns

| Vấn đề | Chi tiết |
|--------|----------|
| **Không có global error boundary** | React app không có ErrorBoundary component |
| **Không có loading/skeleton states** | Nhiều trang hiện blank trong khi loading |
| **AuthContext không re-fetch** | Sau login không có mechanism để refresh user info |
| **29 Initializer files** | Subject data (Math, Physics, Chemistry grades 6-12) hardcoded trong Java initializers → nên là migration scripts hoặc seed data |
| **Mixed language** | Code comments xen kẽ Tiếng Việt và Tiếng Anh; UI labels thiếu nhất quán |

---

## 🆕 PHẦN 4: Tính năng cần bổ sung / cải thiện

### 4.1 ⭐ Ưu tiên CAO — Cần làm sớm

| # | Tính năng | Lý do |
|---|-----------|-------|
| 1 | **Kết nối AI Chat thật** | Student chat hiện 100% giả — cần gọi DeepSeek API thông qua backend proxy |
| 2 | **Student làm bài thi thật** | TakeExam phải load đề từ API, gửi câu trả lời, lưu kết quả lên server |
| 3 | **Dashboard Admin thật** | Load thống kê real-time: tổng user, doanh thu VietQR, số đề thi |
| 4 | **Fix admin security** | Xóa dòng `"/api/admin/**"` khỏi PUBLIC_ENDPOINTS, thêm `@PreAuthorize("hasRole('ADMIN')")` |
| 5 | **Thêm RequireRole cho Student & Parent routes** | Ngăn cross-role access |
| 6 | **System Settings hoạt động** | Tạo bảng `system_settings` và API CRUD |

### 4.2 ⭐ Ưu tiên TRUNG BÌNH

| # | Tính năng | Mô tả |
|---|-----------|-------|
| 7 | **Forum thật** | Backend entities (Post, Comment, Like), API CRUD, real-time hoặc polling |
| 8 | **Course Library gắn với Resource** | Load từ `LessonResource` API thay vì mock; student xem tài liệu của lớp mình |
| 9 | **Student dashboard riêng** | Hiện student vào thẳng `/student/chat` — nên có overview: upcoming exams, recent scores |
| 10 | **Teacher dashboard** | TeacherDashboard đã bị comment out — cần phục hồi với dữ liệu thật |
| 11 | **Notification system** | Email/in-app khi: giao bài thi mới, phụ huynh liên kết, thanh toán thành công |
| 12 | **Student online exam result tracking** | Lưu kết quả thi online vào `StudentExamResult` và hiện cho teacher/parent |
| 13 | **Pagination frontend** | Nhiều list page (ExamManagement, QuestionBank) cần proper pagination thay vì load all |
| 14 | **Error boundary + Suspense** | Global error handling cho React app |

### 4.3 ⭐ Ưu tiên THẤP (Nice-to-have)

| # | Tính năng | Mô tả |
|---|-----------|-------|
| 15 | **Dark mode** | Design system đã có nền tảng, cần bật toggle |
| 16 | **Internationalization (i18n)** | Frontend mixed language — cần chuẩn hóa Vietnamese hoặc hỗ trợ multi-lang |
| 17 | **Audit logs** | Ghi lại thao tác admin (xóa user, thay đổi role) |
| 18 | **Rate limiting** | Protect AI endpoints, login attempts |
| 19 | **WebSocket for real-time** | Chat, exam timer sync, live notifications |
| 20 | **Analytics dashboard** | Biểu đồ doanh thu, users growth, exam completion rate |

---

## 📋 PHẦN 5: Tổng hợp theo mức độ ưu tiên

### 🔴 Cần sửa NGAY (Blocking Issues)

1. **Xóa** `"/api/admin/**"` khỏi `SecurityConstants.PUBLIC_ENDPOINTS`
2. **Thêm** `RequireRole` cho Student routes (`allow={["STUDENT"]}`)
3. **Thêm** `RequireRole` cho Parent routes (`allow={["PARENT"]}`)
4. **Rút ngắn** JWT expiration (access: 30 phút, refresh: 7 ngày)
5. **Đảm bảo** `.env` trong `.gitignore` (không commit credentials)

### 🟡 Nên làm trước khi demo/release

6. Kết nối AI Chat với backend DeepSeek proxy
7. Student TakeExam load đề từ API + submit kết quả
8. Student ExamList load danh sách đề thật được giao
9. Admin Dashboard load thống kê thật
10. Admin Settings save thật

### 🟢 Cải thiện dần

11. Tách component lớn (CreateQuestion, ExamGenerator > 100KB)
12. Loại bỏ mock fallback khỏi production services
13. Forum feature thật
14. Course Library gắn database
15. Teacher Dashboard phục hồi

---

## 📊 Thống kê số liệu

| Metric | Giá trị |
|--------|---------|
| Frontend pages | ~42 pages |
| Backend controllers | 23 controllers |
| Backend entities | 37 entities |
| Backend service interfaces | 31 services |
| Data initializer files | 29 files |
| Frontend services | 18 service files |
| Routes (App.jsx) | ~40 routes |
| **Pages 100% hardcode** | **6 pages** (AIChat, TakeExam, ExamList, CourseLibrary, Forum, Settings) |
| **Components > 50KB** | 4 files |
| **Security issues** | 5 critical |
