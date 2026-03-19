# Chức năng Feedback cho Giáo viên

## Mục tiêu
Giáo viên gửi phản hồi/góp ý/báo lỗi về hệ thống EduBoost. Admin xem, phản hồi và quản lý.

---

## Kịch bản sử dụng (User Stories)

### 🧑‍🏫 Giáo viên

| # | Scenario | Mô tả |
|---|---|---|
| F1 | **Gửi feedback** | GV click "Góp ý" trên sidebar → chọn loại (Góp ý / Báo lỗi / Yêu cầu tính năng / Khác) → nhập tiêu đề + nội dung → gửi |
| F2 | **Đánh giá sao** | GV chấm 1-5 ⭐ đánh giá tổng quan hệ thống (tùy chọn) |
| F3 | **Xem lịch sử** | GV xem danh sách feedback đã gửi + trạng thái (Đã gửi / Đang xử lý / Đã phản hồi / Đóng) |
| F4 | **Xem phản hồi admin** | GV click vào feedback → xem phản hồi từ admin |

### 👨‍💼 Admin

| # | Scenario | Mô tả |
|---|---|---|
| A1 | **Dashboard tổng quan** | Xem số feedback mới, đang xử lý, đã xong. Rating trung bình |
| A2 | **Xem chi tiết** | Click vào feedback → xem nội dung, thông tin GV, loại, ngày gửi |
| A3 | **Phản hồi** | Admin ghi note phản hồi + đổi trạng thái (→ Đang xử lý / Đã phản hồi / Đóng) |
| A4 | **Lọc & tìm** | Filter theo loại, trạng thái, rating, ngày |

---

## Thiết kế Data Model

### Entity: `Feedback`

| Field | Type | Mô tả |
|---|---|---|
| [id](file:///d:/EXE201/EduBoost/eduBoostFrontend/src/layouts/AdminLayout.jsx#27-32) | Long (PK) | Auto-increment |
| `teacher` | Teacher (FK) | GV gửi feedback |
| `category` | Enum | `SUGGESTION`, `BUG_REPORT`, `FEATURE_REQUEST`, `OTHER` |
| `title` | String(200) | Tiêu đề ngắn |
| `content` | Text | Nội dung chi tiết |
| `rating` | Integer(1-5) | Đánh giá sao (nullable) |
| `status` | Enum | `SUBMITTED`, `IN_PROGRESS`, `RESPONDED`, `CLOSED` |
| `adminResponse` | Text | Phản hồi từ admin (nullable) |
| `respondedBy` | Long (FK) | userId admin phản hồi |
| `respondedAt` | LocalDateTime | Thời điểm phản hồi |
| `createdAt` | LocalDateTime | Thời điểm gửi |
| `updatedAt` | LocalDateTime | Cập nhật cuối |

### Enum: `FeedbackCategory`
```
SUGGESTION, BUG_REPORT, FEATURE_REQUEST, OTHER
```

### Enum: `FeedbackStatus`
```
SUBMITTED, IN_PROGRESS, RESPONDED, CLOSED
```

---

## API Endpoints

### Teacher
| Method | Path | Mô tả |
|---|---|---|
| `POST` | `/api/feedback` | Gửi feedback mới |
| `GET` | `/api/feedback/my` | Danh sách feedback đã gửi |
| `GET` | `/api/feedback/my/{id}` | Chi tiết 1 feedback |

### Admin
| Method | Path | Mô tả |
|---|---|---|
| `GET` | `/api/feedback/admin/all` | Tất cả feedback + filter |
| `GET` | `/api/feedback/admin/stats` | Thống kê (count by status, avg rating) |
| `GET` | `/api/feedback/admin/{id}` | Chi tiết feedback |
| `PUT` | `/api/feedback/admin/{id}/respond` | Phản hồi + đổi trạng thái |

---

## Frontend Pages

### Teacher: `FeedbackPage.jsx`
- **Tab 1 — Gửi feedback**: Form gửi mới (category dropdown, title, content, rating stars)
- **Tab 2 — Lịch sử**: Bảng feedback đã gửi + status pill + xem phản hồi admin

### Admin: `FeedbackAdmin.jsx`
- **Tab 1 — Tổng quan**: 4 KPI cards + danh sách feedback mới nhất
- **Tab 2 — Tất cả feedback**: Table + filter + actions (phản hồi/đổi trạng thái)

### Sidebar Navigation
- **Teacher sidebar**: Thêm menu "💬 Góp ý" → `/teacher/feedback`
- **Admin sidebar**: Thêm menu "💬 Feedback" → `/admin/feedback`

---

## UI Flow chi tiết

### Flow 1: GV gửi feedback
```
Sidebar: "💬 Góp ý" → Tab "Gửi góp ý"
    ↓
Chọn loại: [Góp ý] [Báo lỗi] [Yêu cầu tính năng] [Khác]
    ↓
Nhập tiêu đề: "Đề xuất thêm chức năng xuất Excel"
    ↓
Nhập nội dung: "Em muốn có thể xuất điểm ra Excel để..."
    ↓
Đánh giá: ⭐⭐⭐⭐☆ (4/5, tùy chọn)
    ↓
[Gửi feedback] → Toast: "✅ Gửi thành công!" → Clear form
```

### Flow 2: Admin phản hồi
```
Sidebar: "💬 Feedback" → Tab "Tất cả"
    ↓
Bảng: [🟡 Mới] "Đề xuất thêm chức năng xuất Excel" — Nguyễn Văn A — 2 giờ trước
    ↓
Click → Modal chi tiết:
    Loại: Yêu cầu tính năng
    Nội dung: "Em muốn có thể xuất điểm ra Excel..."
    Rating: ⭐⭐⭐⭐☆
    ↓
Admin ghi: "Cảm ơn góp ý, team sẽ xem xét thêm tính năng này"
Đổi trạng thái: [Đang xử lý] hoặc [Đã phản hồi]
    ↓
[Lưu] → GV thấy phản hồi khi xem lại
```

---

## Proposed Files

### Backend (6 files mới)
- `[NEW]` `entities/Feedback.java`
- `[NEW]` `entities/enums/FeedbackCategory.java`
- `[NEW]` `entities/enums/FeedbackStatus.java`
- `[NEW]` `repositories/FeedbackRepository.java`
- `[NEW]` `controller/FeedbackController.java`
- `[NEW]` `service/FeedbackService.java` + `service/impl/FeedbackServiceImpl.java`
- `[NEW]` `dto/request/CreateFeedbackRequest.java`
- `[NEW]` `dto/request/RespondFeedbackRequest.java`
- `[NEW]` `dto/response/FeedbackResponse.java`
- `[NEW]` `dto/response/FeedbackStatsResponse.java`

### Frontend (4 files mới + 2 sửa)
- `[NEW]` `pages/teacher/FeedbackPage.jsx`
- `[NEW]` `pages/admin/FeedbackAdmin.jsx`
- `[NEW]` `services/feedbackService.js`
- `[MODIFY]` [layouts/TeacherLayout.jsx](file:///d:/EXE201/EduBoost/eduBoostFrontend/src/layouts/TeacherLayout.jsx) — thêm sidebar menu
- `[MODIFY]` [layouts/AdminLayout.jsx](file:///d:/EXE201/EduBoost/eduBoostFrontend/src/layouts/AdminLayout.jsx) — thêm sidebar menu
- `[MODIFY]` [App.jsx](file:///d:/EXE201/EduBoost/eduBoostFrontend/src/App.jsx) — thêm routes

---

## Verification Plan
- `mvn compile -q` — Backend compile
- Browser test: Teacher gửi feedback → Admin xem + phản hồi → Teacher thấy phản hồi
