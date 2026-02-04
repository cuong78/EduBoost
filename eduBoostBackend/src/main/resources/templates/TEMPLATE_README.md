# Hướng dẫn tạo file Template Excel

## Tên file: `question-import-template.xlsx`

Đặt file Excel ở cùng folder này: `src/main/resources/templates/`

---

## Cấu trúc file Excel

### Sheet 1 (Sheet mặc định)

**Row 1 - Header:**

| Cột A | Cột B | Cột C | Cột D |
|-------|-------|-------|-------|
| Câu hỏi | Câu trả lời | Giải thích | Dạng câu hỏi |

**Row 2 trở đi - Dữ liệu mẫu:**

| Cột A (Bắt buộc) | Cột B (Bắt buộc) | Cột C (Tùy chọn) | Cột D (Tùy chọn) |
|------------------|------------------|------------------|------------------|
| Tìm $x$ sao cho $2x + 5 = 15$ | $x = 5$ | $2x = 15 - 5 = 10$, suy ra $x = 5$ | MULTIPLE_CHOICE |
| Việt Nam độc lập năm nào? | 1945 | Ngày 2/9/1945, Bác Hồ đọc Tuyên ngôn độc lập | MULTIPLE_CHOICE |
| Nước sôi ở 100°C? | Đúng | Ở áp suất khí quyển tiêu chuẩn | TRUE_FALSE |
| Thủ đô của Pháp là ___ | Paris | | FILL_BLANK |
| Cho tam giác ABC với $AB = 3$, $BC = 4$, $AC = 5$. Tính diện tích? | $S = 6$ | Tam giác vuông tại B, $S = \frac{1}{2} \times 3 \times 4 = 6$ | MULTIPLE_CHOICE |

---

## Chi tiết các cột

### Cột A - Câu hỏi (Bắt buộc)
- Nội dung câu hỏi
- Hỗ trợ công thức toán KaTeX: `$x^2 + y^2 = z^2$`
- Hỗ trợ HTML tags nếu cần

### Cột B - Câu trả lời (Bắt buộc)  
- Đáp án đúng của câu hỏi
- Hỗ trợ KaTeX: `$\frac{1}{2}$`

### Cột C - Giải thích (Tùy chọn)
- Lời giải chi tiết
- Có thể để trống

### Cột D - Dạng câu hỏi (Tùy chọn)
Các giá trị hợp lệ:
- `MULTIPLE_CHOICE` - Trắc nghiệm (mặc định nếu để trống)
- `TRUE_FALSE` - Đúng/Sai  
- `FILL_BLANK` - Điền khuyết

---

## Lưu ý quan trọng

1. **Row 1 là header** - Hệ thống sẽ bỏ qua row này
2. **Định dạng file**: `.xlsx` hoặc `.xls`
3. **Encoding**: UTF-8 (để hỗ trợ tiếng Việt)
4. **Công thức toán**: Dùng KaTeX syntax `$...$` hoặc `$$...$$`
5. **Nếu cột D trống**: Mặc định là MULTIPLE_CHOICE

---

## Ví dụ công thức toán KaTeX

| Công thức | Cách viết |
|-----------|-----------|
| x² + y² = z² | `$x^2 + y^2 = z^2$` |
| Phân số ½ | `$\frac{1}{2}$` |
| Căn bậc 2 | `$\sqrt{2}$` |
| Tổng Σ | `$\sum_{i=1}^{n} i$` |
| Tích phân | `$\int_0^1 x^2 dx$` |
| Ma trận | `$\begin{pmatrix} a & b \\ c & d \end{pmatrix}$` |
