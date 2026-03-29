-- ============================================================
-- Script: Fix KHTN 7, 8, 9 chapter numbering
-- Mục đích: Xóa questions + resources, sửa chapter_number,
--           rồi cho bulk-import lại
-- ============================================================
-- Chạy trên PostgreSQL của EduBoost
-- ⚠️ BACKUP TRƯỚC KHI CHẠY: pg_dump -U postgres eduboost > backup.sql

-- ────────────────────────────────────────────────────────────
-- BƯỚC 1: XÓA TẤT CẢ QUESTIONS + RESOURCES CỦA KHTN 7, 8, 9
-- ────────────────────────────────────────────────────────────

-- 1a. Xóa exam_question liên quan (nếu có FK)
DELETE FROM exam_question
WHERE lesson_id IN (
    SELECT l.id FROM lesson l
    JOIN chapter c ON l.chapter_id = c.id
    JOIN subject s ON c.subject_id = s.id
    WHERE s.subject_code = 'SCI'
      AND c.grade_level IN (7, 8, 9)
);

-- 1b. Xóa ai_generation_history liên quan
DELETE FROM ai_generation_history
WHERE lesson_id IN (
    SELECT l.id FROM lesson l
    JOIN chapter c ON l.chapter_id = c.id
    JOIN subject s ON c.subject_id = s.id
    WHERE s.subject_code = 'SCI'
      AND c.grade_level IN (7, 8, 9)
);

-- 1c. Xóa exam_matrix_lesson_detail liên quan
DELETE FROM exam_matrix_lesson_detail
WHERE lesson_id IN (
    SELECT l.id FROM lesson l
    JOIN chapter c ON l.chapter_id = c.id
    JOIN subject s ON c.subject_id = s.id
    WHERE s.subject_code = 'SCI'
      AND c.grade_level IN (7, 8, 9)
);

-- 1d. Xóa tất cả questions (question_bank)
DELETE FROM question_bank
WHERE lesson_id IN (
    SELECT l.id FROM lesson l
    JOIN chapter c ON l.chapter_id = c.id
    JOIN subject s ON c.subject_id = s.id
    WHERE s.subject_code = 'SCI'
      AND c.grade_level IN (7, 8, 9)
);

-- 1e. Xóa tất cả resources (lesson_resource)
DELETE FROM lesson_resource
WHERE lesson_id IN (
    SELECT l.id FROM lesson l
    JOIN chapter c ON l.chapter_id = c.id
    JOIN subject s ON c.subject_id = s.id
    WHERE s.subject_code = 'SCI'
      AND c.grade_level IN (7, 8, 9)
);

-- ────────────────────────────────────────────────────────────
-- BƯỚC 2: XÓA LESSONS + CHAPTERS CŨ CỦA KHTN 7, 8, 9
-- ────────────────────────────────────────────────────────────

-- 2a. Xóa lessons
DELETE FROM lesson
WHERE chapter_id IN (
    SELECT c.id FROM chapter c
    JOIN subject s ON c.subject_id = s.id
    WHERE s.subject_code = 'SCI'
      AND c.grade_level IN (7, 8, 9)
);

-- 2b. Xóa chapters
DELETE FROM chapter
WHERE subject_id = (SELECT id FROM subject WHERE subject_code = 'SCI')
  AND grade_level IN (7, 8, 9);

-- ────────────────────────────────────────────────────────────
-- BƯỚC 3: TẠO LẠI CHAPTERS + LESSONS VỚI SỐ ĐÚNG
-- ────────────────────────────────────────────────────────────

-- ======== KHTN LỚP 7 ========

-- Bài mở đầu (chapter_number = 0)
INSERT INTO chapter (subject_id, grade_level, chapter_number, chapter_name, description, created_at)
SELECT s.id, 7, 0, 'Bài mở đầu', 'Bài mở đầu: Phương pháp và kĩ năng học tập môn KHTN', NOW()
FROM subject s WHERE s.subject_code = 'SCI';

INSERT INTO lesson (chapter_id, lesson_number, lesson_name, created_at, updated_at)
SELECT c.id, 1, 'Phương pháp và kĩ năng học tập môn Khoa học tự nhiên', NOW(), NOW()
FROM chapter c JOIN subject s ON c.subject_id = s.id
WHERE s.subject_code = 'SCI' AND c.grade_level = 7 AND c.chapter_number = 0;

-- Chương 1
INSERT INTO chapter (subject_id, grade_level, chapter_number, chapter_name, description, created_at)
SELECT s.id, 7, 1, 'Nguyên tử. Sơ lược về bảng tuần hoàn các nguyên tố hóa học', 'Chương 1: Nguyên tử. Sơ lược về bảng tuần hoàn các nguyên tố hóa học', NOW()
FROM subject s WHERE s.subject_code = 'SCI';

INSERT INTO lesson (chapter_id, lesson_number, lesson_name, created_at, updated_at)
SELECT c.id, n, name, NOW(), NOW()
FROM chapter c JOIN subject s ON c.subject_id = s.id,
(VALUES (2, 'Nguyên tử'), (3, 'Nguyên tố hóa học'), (4, 'Sơ lược về bảng tuần hoàn nguyên tố hóa học')) AS t(n, name)
WHERE s.subject_code = 'SCI' AND c.grade_level = 7 AND c.chapter_number = 1;

-- Chương 2
INSERT INTO chapter (subject_id, grade_level, chapter_number, chapter_name, description, created_at)
SELECT s.id, 7, 2, 'Phân tử. Liên kết hóa học', 'Chương 2: Phân tử. Liên kết hóa học', NOW()
FROM subject s WHERE s.subject_code = 'SCI';

INSERT INTO lesson (chapter_id, lesson_number, lesson_name, created_at, updated_at)
SELECT c.id, n, name, NOW(), NOW()
FROM chapter c JOIN subject s ON c.subject_id = s.id,
(VALUES (5, 'Phân tử - Đơn chất - Hợp chất'), (6, 'Giới thiệu về liên kết hóa học'), (7, 'Hóa trị và công thức hóa học')) AS t(n, name)
WHERE s.subject_code = 'SCI' AND c.grade_level = 7 AND c.chapter_number = 2;

-- Chương 3
INSERT INTO chapter (subject_id, grade_level, chapter_number, chapter_name, description, created_at)
SELECT s.id, 7, 3, 'Tốc độ', 'Chương 3: Tốc độ', NOW()
FROM subject s WHERE s.subject_code = 'SCI';

INSERT INTO lesson (chapter_id, lesson_number, lesson_name, created_at, updated_at)
SELECT c.id, n, name, NOW(), NOW()
FROM chapter c JOIN subject s ON c.subject_id = s.id,
(VALUES (8, 'Tốc độ chuyển động'), (9, 'Đo tốc độ'), (10, 'Đồ thị quãng đường - thời gian'), (11, 'Thảo luận về ảnh hưởng của tốc độ trong an toàn giao thông')) AS t(n, name)
WHERE s.subject_code = 'SCI' AND c.grade_level = 7 AND c.chapter_number = 3;

-- Chương 4
INSERT INTO chapter (subject_id, grade_level, chapter_number, chapter_name, description, created_at)
SELECT s.id, 7, 4, 'Âm thanh', 'Chương 4: Âm thanh', NOW()
FROM subject s WHERE s.subject_code = 'SCI';

INSERT INTO lesson (chapter_id, lesson_number, lesson_name, created_at, updated_at)
SELECT c.id, n, name, NOW(), NOW()
FROM chapter c JOIN subject s ON c.subject_id = s.id,
(VALUES (12, 'Sóng âm'), (13, 'Độ to và độ cao của âm'), (14, 'Phản xạ âm, chống ô nhiễm tiếng ồn')) AS t(n, name)
WHERE s.subject_code = 'SCI' AND c.grade_level = 7 AND c.chapter_number = 4;

-- Chương 5
INSERT INTO chapter (subject_id, grade_level, chapter_number, chapter_name, description, created_at)
SELECT s.id, 7, 5, 'Ánh sáng', 'Chương 5: Ánh sáng', NOW()
FROM subject s WHERE s.subject_code = 'SCI';

INSERT INTO lesson (chapter_id, lesson_number, lesson_name, created_at, updated_at)
SELECT c.id, n, name, NOW(), NOW()
FROM chapter c JOIN subject s ON c.subject_id = s.id,
(VALUES (15, 'Năng lượng ánh sáng. Tia sáng, vùng tối'), (16, 'Sự phản xạ ánh sáng'), (17, 'Ảnh của vật qua gương phẳng')) AS t(n, name)
WHERE s.subject_code = 'SCI' AND c.grade_level = 7 AND c.chapter_number = 5;

-- Chương 6
INSERT INTO chapter (subject_id, grade_level, chapter_number, chapter_name, description, created_at)
SELECT s.id, 7, 6, 'Từ', 'Chương 6: Từ', NOW()
FROM subject s WHERE s.subject_code = 'SCI';

INSERT INTO lesson (chapter_id, lesson_number, lesson_name, created_at, updated_at)
SELECT c.id, n, name, NOW(), NOW()
FROM chapter c JOIN subject s ON c.subject_id = s.id,
(VALUES (18, 'Nam châm'), (19, 'Từ trường'), (20, 'Chế tạo nam châm điện đơn giản')) AS t(n, name)
WHERE s.subject_code = 'SCI' AND c.grade_level = 7 AND c.chapter_number = 6;

-- Chương 7
INSERT INTO chapter (subject_id, grade_level, chapter_number, chapter_name, description, created_at)
SELECT s.id, 7, 7, 'Trao đổi chất và chuyển hóa năng lượng ở sinh vật', 'Chương 7: Trao đổi chất và chuyển hóa năng lượng ở sinh vật', NOW()
FROM subject s WHERE s.subject_code = 'SCI';

INSERT INTO lesson (chapter_id, lesson_number, lesson_name, created_at, updated_at)
SELECT c.id, n, name, NOW(), NOW()
FROM chapter c JOIN subject s ON c.subject_id = s.id,
(VALUES (21, 'Khái quát về trao đổi chất và chuyển hóa năng lượng'), (22, 'Quang hợp ở thực vật'), (23, 'Một số yếu tố ảnh hưởng đến quang hợp'), (24, 'Hô hấp tế bào'), (25, 'Một số yếu tố ảnh hưởng đến hô hấp tế bào'), (26, 'Trao đổi khí ở sinh vật'), (27, 'Vai trò của nước và chất dinh dưỡng ở thực vật'), (28, 'Trao đổi nước và chất dinh dưỡng ở thực vật'), (29, 'Trao đổi nước và chất dinh dưỡng ở động vật')) AS t(n, name)
WHERE s.subject_code = 'SCI' AND c.grade_level = 7 AND c.chapter_number = 7;

-- Chương 8
INSERT INTO chapter (subject_id, grade_level, chapter_number, chapter_name, description, created_at)
SELECT s.id, 7, 8, 'Cảm ứng ở sinh vật', 'Chương 8: Cảm ứng ở sinh vật', NOW()
FROM subject s WHERE s.subject_code = 'SCI';

INSERT INTO lesson (chapter_id, lesson_number, lesson_name, created_at, updated_at)
SELECT c.id, n, name, NOW(), NOW()
FROM chapter c JOIN subject s ON c.subject_id = s.id,
(VALUES (30, 'Cảm ứng ở sinh vật và tập tính ở động vật'), (31, 'Vận dụng cảm ứng ở sinh vật vào thực tiễn')) AS t(n, name)
WHERE s.subject_code = 'SCI' AND c.grade_level = 7 AND c.chapter_number = 8;

-- Chương 9
INSERT INTO chapter (subject_id, grade_level, chapter_number, chapter_name, description, created_at)
SELECT s.id, 7, 9, 'Sinh trưởng và phát triển ở sinh vật', 'Chương 9: Sinh trưởng và phát triển ở sinh vật', NOW()
FROM subject s WHERE s.subject_code = 'SCI';

INSERT INTO lesson (chapter_id, lesson_number, lesson_name, created_at, updated_at)
SELECT c.id, n, name, NOW(), NOW()
FROM chapter c JOIN subject s ON c.subject_id = s.id,
(VALUES (32, 'Khái quát về sinh trưởng và phát triển ở sinh vật'), (33, 'Ứng dụng sinh trưởng và phát triển ở sinh vật vào thực tiễn')) AS t(n, name)
WHERE s.subject_code = 'SCI' AND c.grade_level = 7 AND c.chapter_number = 9;

-- Chương 10
INSERT INTO chapter (subject_id, grade_level, chapter_number, chapter_name, description, created_at)
SELECT s.id, 7, 10, 'Sinh sản ở sinh vật', 'Chương 10: Sinh sản ở sinh vật', NOW()
FROM subject s WHERE s.subject_code = 'SCI';

INSERT INTO lesson (chapter_id, lesson_number, lesson_name, created_at, updated_at)
SELECT c.id, n, name, NOW(), NOW()
FROM chapter c JOIN subject s ON c.subject_id = s.id,
(VALUES (34, 'Sinh sản vô tính ở sinh vật'), (35, 'Sinh sản hữu tính ở sinh vật'), (36, 'Một số yếu tố ảnh hưởng và điều hòa, điều khiển sinh sản ở sinh vật'), (37, 'Cơ thể sinh vật là một thể thống nhất')) AS t(n, name)
WHERE s.subject_code = 'SCI' AND c.grade_level = 7 AND c.chapter_number = 10;


-- ======== KHTN LỚP 8 ========

-- Lời nói đầu (chapter_number = 0)
INSERT INTO chapter (subject_id, grade_level, chapter_number, chapter_name, description, created_at)
SELECT s.id, 8, 0, 'Lời nói đầu', 'Bài 1: Sử dụng một số hóa chất, thiết bị cơ bản trong phòng thí nghiệm', NOW()
FROM subject s WHERE s.subject_code = 'SCI';

INSERT INTO lesson (chapter_id, lesson_number, lesson_name, created_at, updated_at)
SELECT c.id, 1, 'Sử dụng một số hóa chất, thiết bị cơ bản trong phòng thí nghiệm', NOW(), NOW()
FROM chapter c JOIN subject s ON c.subject_id = s.id
WHERE s.subject_code = 'SCI' AND c.grade_level = 8 AND c.chapter_number = 0;

-- Chương 1
INSERT INTO chapter (subject_id, grade_level, chapter_number, chapter_name, description, created_at)
SELECT s.id, 8, 1, 'Phản ứng hóa học', 'Chương 1: Phản ứng hóa học', NOW()
FROM subject s WHERE s.subject_code = 'SCI';

INSERT INTO lesson (chapter_id, lesson_number, lesson_name, created_at, updated_at)
SELECT c.id, n, name, NOW(), NOW()
FROM chapter c JOIN subject s ON c.subject_id = s.id,
(VALUES (2, 'Phản ứng hóa học'), (3, 'Mol và tỉ khối chất khí'), (4, 'Dung dịch và nồng độ'), (5, 'Định luật bảo toàn khối lượng và phương trình hóa học'), (6, 'Tính theo phương trình hóa học'), (7, 'Tốc độ phản ứng và chất xúc tác')) AS t(n, name)
WHERE s.subject_code = 'SCI' AND c.grade_level = 8 AND c.chapter_number = 1;

-- Chương 2
INSERT INTO chapter (subject_id, grade_level, chapter_number, chapter_name, description, created_at)
SELECT s.id, 8, 2, 'Một số hợp chất thông dụng', 'Chương 2: Một số hợp chất thông dụng', NOW()
FROM subject s WHERE s.subject_code = 'SCI';

INSERT INTO lesson (chapter_id, lesson_number, lesson_name, created_at, updated_at)
SELECT c.id, n, name, NOW(), NOW()
FROM chapter c JOIN subject s ON c.subject_id = s.id,
(VALUES (8, 'Acid'), (9, 'Base. Thang pH'), (10, 'Oxide'), (11, 'Muối'), (12, 'Phân bón hóa học')) AS t(n, name)
WHERE s.subject_code = 'SCI' AND c.grade_level = 8 AND c.chapter_number = 2;

-- Chương 3
INSERT INTO chapter (subject_id, grade_level, chapter_number, chapter_name, description, created_at)
SELECT s.id, 8, 3, 'Khối lượng riêng và áp suất', 'Chương 3: Khối lượng riêng và áp suất', NOW()
FROM subject s WHERE s.subject_code = 'SCI';

INSERT INTO lesson (chapter_id, lesson_number, lesson_name, created_at, updated_at)
SELECT c.id, n, name, NOW(), NOW()
FROM chapter c JOIN subject s ON c.subject_id = s.id,
(VALUES (13, 'Khối lượng riêng'), (14, 'Thực hành xác định khối lượng riêng'), (15, 'Áp suất trên một bề mặt'), (16, 'Áp suất chất lỏng. Áp suất khí quyển'), (17, 'Lực đẩy Archimedes')) AS t(n, name)
WHERE s.subject_code = 'SCI' AND c.grade_level = 8 AND c.chapter_number = 3;

-- Chương 4
INSERT INTO chapter (subject_id, grade_level, chapter_number, chapter_name, description, created_at)
SELECT s.id, 8, 4, 'Tác dụng làm quay của lực', 'Chương 4: Tác dụng làm quay của lực', NOW()
FROM subject s WHERE s.subject_code = 'SCI';

INSERT INTO lesson (chapter_id, lesson_number, lesson_name, created_at, updated_at)
SELECT c.id, n, name, NOW(), NOW()
FROM chapter c JOIN subject s ON c.subject_id = s.id,
(VALUES (18, 'Tác dụng làm quay của lực. Moment lực'), (19, 'Đòn bẩy và ứng dụng')) AS t(n, name)
WHERE s.subject_code = 'SCI' AND c.grade_level = 8 AND c.chapter_number = 4;

-- Chương 5
INSERT INTO chapter (subject_id, grade_level, chapter_number, chapter_name, description, created_at)
SELECT s.id, 8, 5, 'Điện', 'Chương 5: Điện', NOW()
FROM subject s WHERE s.subject_code = 'SCI';

INSERT INTO lesson (chapter_id, lesson_number, lesson_name, created_at, updated_at)
SELECT c.id, n, name, NOW(), NOW()
FROM chapter c JOIN subject s ON c.subject_id = s.id,
(VALUES (20, 'Nhiễm điện do cọ xát'), (21, 'Dòng điện, nguồn điện'), (22, 'Mạch điện đơn giản'), (23, 'Tác dụng của dòng điện'), (24, 'Cường độ dòng điện và hiệu điện thế'), (25, 'Thực hành đo cường độ dòng điện và hiệu điện thế')) AS t(n, name)
WHERE s.subject_code = 'SCI' AND c.grade_level = 8 AND c.chapter_number = 5;

-- Chương 6
INSERT INTO chapter (subject_id, grade_level, chapter_number, chapter_name, description, created_at)
SELECT s.id, 8, 6, 'Nhiệt', 'Chương 6: Nhiệt', NOW()
FROM subject s WHERE s.subject_code = 'SCI';

INSERT INTO lesson (chapter_id, lesson_number, lesson_name, created_at, updated_at)
SELECT c.id, n, name, NOW(), NOW()
FROM chapter c JOIN subject s ON c.subject_id = s.id,
(VALUES (26, 'Năng lượng nhiệt và nội năng'), (27, 'Sự truyền nhiệt'), (28, 'Sự nở vì nhiệt'), (29, 'Nhiệt dung riêng')) AS t(n, name)
WHERE s.subject_code = 'SCI' AND c.grade_level = 8 AND c.chapter_number = 6;

-- Chương 7
INSERT INTO chapter (subject_id, grade_level, chapter_number, chapter_name, description, created_at)
SELECT s.id, 8, 7, 'Sinh học cơ thể người', 'Chương 7: Sinh học cơ thể người', NOW()
FROM subject s WHERE s.subject_code = 'SCI';

INSERT INTO lesson (chapter_id, lesson_number, lesson_name, created_at, updated_at)
SELECT c.id, n, name, NOW(), NOW()
FROM chapter c JOIN subject s ON c.subject_id = s.id,
(VALUES (30, 'Khái quát về cơ thể người'), (31, 'Hệ vận động ở người'), (32, 'Dinh dưỡng và tiêu hóa ở người'), (33, 'Máu và hệ tuần hoàn ở cơ thể người'), (34, 'Hệ hô hấp ở người'), (35, 'Hệ bài tiết ở người'), (36, 'Điều hòa môi trường trong của cơ thể người'), (37, 'Hệ thần kinh và các giác quan ở người'), (38, 'Hệ nội tiết ở người'), (39, 'Da và điều hòa thân nhiệt ở người'), (40, 'Sinh sản ở người')) AS t(n, name)
WHERE s.subject_code = 'SCI' AND c.grade_level = 8 AND c.chapter_number = 7;

-- Chương 8
INSERT INTO chapter (subject_id, grade_level, chapter_number, chapter_name, description, created_at)
SELECT s.id, 8, 8, 'Sinh vật và môi trường', 'Chương 8: Sinh vật và môi trường', NOW()
FROM subject s WHERE s.subject_code = 'SCI';

INSERT INTO lesson (chapter_id, lesson_number, lesson_name, created_at, updated_at)
SELECT c.id, n, name, NOW(), NOW()
FROM chapter c JOIN subject s ON c.subject_id = s.id,
(VALUES (41, 'Môi trường và các nhân tố sinh thái'), (42, 'Quần thể sinh vật'), (43, 'Quần xã sinh vật'), (44, 'Hệ sinh thái'), (45, 'Sinh quyển'), (46, 'Cân bằng tự nhiên'), (47, 'Bảo vệ môi trường')) AS t(n, name)
WHERE s.subject_code = 'SCI' AND c.grade_level = 8 AND c.chapter_number = 8;

-- ======== KHTN LỚP 9 ========

-- Chương 1: NĂNG LƯỢNG CƠ HỌC
INSERT INTO chapter (subject_id, grade_level, chapter_number, chapter_name, description, created_at)
SELECT s.id, 9, 1, 'Năng lượng cơ học', 'Chương I. Năng lượng cơ học', NOW()
FROM subject s WHERE s.subject_code = 'SCI';

INSERT INTO lesson (chapter_id, lesson_number, lesson_name, created_at, updated_at)
SELECT c.id, n, name, NOW(), NOW()
FROM chapter c JOIN subject s ON c.subject_id = s.id,
(VALUES (1, 'Nhận biết một số dụng cụ, hoá chất. Thuyết trình một vấn đề khoa học'), (2, 'Động năng'), (3, 'Cơ năng'), (4, 'Công và công suất')) AS t(n, name)
WHERE s.subject_code = 'SCI' AND c.grade_level = 9 AND c.chapter_number = 1;

-- Chương 2: ÁNH SÁNG
INSERT INTO chapter (subject_id, grade_level, chapter_number, chapter_name, description, created_at)
SELECT s.id, 9, 2, 'Ánh sáng', 'Chương II. Ánh sáng', NOW()
FROM subject s WHERE s.subject_code = 'SCI';

INSERT INTO lesson (chapter_id, lesson_number, lesson_name, created_at, updated_at)
SELECT c.id, n, name, NOW(), NOW()
FROM chapter c JOIN subject s ON c.subject_id = s.id,
(VALUES (5, 'Khúc xạ ánh sáng'), (6, 'Phản xạ toàn phần'), (7, 'Lăng kính'), (8, 'Thấu kính'), (10, 'Kính lúp. Bài tập thấu kính')) AS t(n, name)
WHERE s.subject_code = 'SCI' AND c.grade_level = 9 AND c.chapter_number = 2;

-- Chương 3: ĐIỆN
INSERT INTO chapter (subject_id, grade_level, chapter_number, chapter_name, description, created_at)
SELECT s.id, 9, 3, 'Điện', 'Chương III. Điện', NOW()
FROM subject s WHERE s.subject_code = 'SCI';

INSERT INTO lesson (chapter_id, lesson_number, lesson_name, created_at, updated_at)
SELECT c.id, n, name, NOW(), NOW()
FROM chapter c JOIN subject s ON c.subject_id = s.id,
(VALUES (11, 'Điện trở. Định luật Ohm'), (12, 'Đoạn mạch nối tiếp, song song'), (13, 'Năng lượng của dòng điện và công suất điện')) AS t(n, name)
WHERE s.subject_code = 'SCI' AND c.grade_level = 9 AND c.chapter_number = 3;

-- Chương 4: ĐIỆN TỪ
INSERT INTO chapter (subject_id, grade_level, chapter_number, chapter_name, description, created_at)
SELECT s.id, 9, 4, 'Điện từ', 'Chương IV. Điện từ', NOW()
FROM subject s WHERE s.subject_code = 'SCI';

INSERT INTO lesson (chapter_id, lesson_number, lesson_name, created_at, updated_at)
SELECT c.id, n, name, NOW(), NOW()
FROM chapter c JOIN subject s ON c.subject_id = s.id,
(VALUES (14, 'Cảm ứng điện từ. Nguyên tắc tạo ra dòng điện xoay chiều'), (15, 'Tác dụng của dòng điện xoay chiều')) AS t(n, name)
WHERE s.subject_code = 'SCI' AND c.grade_level = 9 AND c.chapter_number = 4;

-- Chương 5: NĂNG LƯỢNG VỚI CUỘC SỐNG
INSERT INTO chapter (subject_id, grade_level, chapter_number, chapter_name, description, created_at)
SELECT s.id, 9, 5, 'Năng lượng với cuộc sống', 'Chương V. Năng lượng với cuộc sống', NOW()
FROM subject s WHERE s.subject_code = 'SCI';

INSERT INTO lesson (chapter_id, lesson_number, lesson_name, created_at, updated_at)
SELECT c.id, n, name, NOW(), NOW()
FROM chapter c JOIN subject s ON c.subject_id = s.id,
(VALUES (16, 'Vòng năng lượng trên Trái Đất. Năng lượng hoá thạch'), (17, 'Một số dạng năng lượng tái tạo')) AS t(n, name)
WHERE s.subject_code = 'SCI' AND c.grade_level = 9 AND c.chapter_number = 5;

-- Chương 6: KIM LOẠI
INSERT INTO chapter (subject_id, grade_level, chapter_number, chapter_name, description, created_at)
SELECT s.id, 9, 6, 'Kim loại. Sự khác nhau cơ bản giữa phi kim và kim loại', 'Chương VI. Kim loại', NOW()
FROM subject s WHERE s.subject_code = 'SCI';

INSERT INTO lesson (chapter_id, lesson_number, lesson_name, created_at, updated_at)
SELECT c.id, n, name, NOW(), NOW()
FROM chapter c JOIN subject s ON c.subject_id = s.id,
(VALUES (18, 'Tính chất chung của kim loại'), (19, 'Dãy hoạt động hoá học'), (20, 'Tách kim loại và việc sử dụng hợp kim'), (21, 'Sự khác nhau cơ bản giữa phi kim và kim loại')) AS t(n, name)
WHERE s.subject_code = 'SCI' AND c.grade_level = 9 AND c.chapter_number = 6;

-- Chương 7: CHẤT HỮU CƠ, HYDROCARBON
INSERT INTO chapter (subject_id, grade_level, chapter_number, chapter_name, description, created_at)
SELECT s.id, 9, 7, 'Giới thiệu về chất hữu cơ. Hydrocarbon và nguồn nhiên liệu', 'Chương VII. Chất hữu cơ', NOW()
FROM subject s WHERE s.subject_code = 'SCI';

INSERT INTO lesson (chapter_id, lesson_number, lesson_name, created_at, updated_at)
SELECT c.id, n, name, NOW(), NOW()
FROM chapter c JOIN subject s ON c.subject_id = s.id,
(VALUES (22, 'Giới thiệu về hợp chất hữu cơ'), (23, 'Alkane'), (24, 'Alkene'), (25, 'Nguồn nhiên liệu')) AS t(n, name)
WHERE s.subject_code = 'SCI' AND c.grade_level = 9 AND c.chapter_number = 7;

-- Chương 8: ETHYLIC ALCOHOL VÀ ACETIC ACID
INSERT INTO chapter (subject_id, grade_level, chapter_number, chapter_name, description, created_at)
SELECT s.id, 9, 8, 'Ethylic alcohol và acetic acid', 'Chương VIII. Ethylic alcohol và acetic acid', NOW()
FROM subject s WHERE s.subject_code = 'SCI';

INSERT INTO lesson (chapter_id, lesson_number, lesson_name, created_at, updated_at)
SELECT c.id, n, name, NOW(), NOW()
FROM chapter c JOIN subject s ON c.subject_id = s.id,
(VALUES (26, 'Ethylic alcohol'), (27, 'Acetic acid')) AS t(n, name)
WHERE s.subject_code = 'SCI' AND c.grade_level = 9 AND c.chapter_number = 8;

-- Chương 9: LIPID, CARBOHYDRATE, PROTEIN, POLYMER
INSERT INTO chapter (subject_id, grade_level, chapter_number, chapter_name, description, created_at)
SELECT s.id, 9, 9, 'Lipid. Carbohydrate. Protein. Polymer', 'Chương IX. Lipid. Carbohydrate. Protein. Polymer', NOW()
FROM subject s WHERE s.subject_code = 'SCI';

INSERT INTO lesson (chapter_id, lesson_number, lesson_name, created_at, updated_at)
SELECT c.id, n, name, NOW(), NOW()
FROM chapter c JOIN subject s ON c.subject_id = s.id,
(VALUES (28, 'Lipid'), (29, 'Carbohydrate. Glucose và saccharose'), (30, 'Tinh bột và cellulose'), (31, 'Protein'), (32, 'Polymer')) AS t(n, name)
WHERE s.subject_code = 'SCI' AND c.grade_level = 9 AND c.chapter_number = 9;

-- Chương 10: KHAI THÁC TÀI NGUYÊN TỪ VỎ TRÁI ĐẤT
INSERT INTO chapter (subject_id, grade_level, chapter_number, chapter_name, description, created_at)
SELECT s.id, 9, 10, 'Khai thác tài nguyên từ vỏ Trái Đất', 'Chương X. Khai thác tài nguyên từ vỏ Trái Đất', NOW()
FROM subject s WHERE s.subject_code = 'SCI';

INSERT INTO lesson (chapter_id, lesson_number, lesson_name, created_at, updated_at)
SELECT c.id, n, name, NOW(), NOW()
FROM chapter c JOIN subject s ON c.subject_id = s.id,
(VALUES (33, 'Sơ lược về hoá học vỏ Trái Đất và khai thác tài nguyên từ vỏ Trái Đất'), (34, 'Khai thác đá vôi. Công nghiệp silicate'), (35, 'Khai thác nhiên liệu hoá thạch. Nguồn carbon. Chu trình carbon và sự ấm lên toàn cầu')) AS t(n, name)
WHERE s.subject_code = 'SCI' AND c.grade_level = 9 AND c.chapter_number = 10;

-- Chương 11: DI TRUYỀN HỌC MENDEL
INSERT INTO chapter (subject_id, grade_level, chapter_number, chapter_name, description, created_at)
SELECT s.id, 9, 11, 'Di truyền học Mendel. Cơ sở phân tử của hiện tượng di truyền', 'Chương XI. Di truyền học Mendel', NOW()
FROM subject s WHERE s.subject_code = 'SCI';

INSERT INTO lesson (chapter_id, lesson_number, lesson_name, created_at, updated_at)
SELECT c.id, n, name, NOW(), NOW()
FROM chapter c JOIN subject s ON c.subject_id = s.id,
(VALUES (36, 'Khái quát về di truyền học'), (37, 'Các quy luật di truyền của Mendel'), (38, 'Nucleic acid và gene'), (39, 'Tái bản DNA và phiên mã tạo RNA'), (40, 'Dịch mã và mối quan hệ từ gene đến tính trạng'), (41, 'Đột biến gene')) AS t(n, name)
WHERE s.subject_code = 'SCI' AND c.grade_level = 9 AND c.chapter_number = 11;

-- Chương 12: DI TRUYỀN NHIỄM SẮC THỂ
INSERT INTO chapter (subject_id, grade_level, chapter_number, chapter_name, description, created_at)
SELECT s.id, 9, 12, 'Di truyền nhiễm sắc thể', 'Chương XII. Di truyền nhiễm sắc thể', NOW()
FROM subject s WHERE s.subject_code = 'SCI';

INSERT INTO lesson (chapter_id, lesson_number, lesson_name, created_at, updated_at)
SELECT c.id, n, name, NOW(), NOW()
FROM chapter c JOIN subject s ON c.subject_id = s.id,
(VALUES (42, 'Nhiễm sắc thể và bộ nhiễm sắc thể'), (43, 'Nguyên phân và giảm phân'), (44, 'Nhiễm sắc thể giới tính và cơ chế xác định giới tính'), (45, 'Di truyền liên kết'), (46, 'Đột biến nhiễm sắc thể')) AS t(n, name)
WHERE s.subject_code = 'SCI' AND c.grade_level = 9 AND c.chapter_number = 12;

-- Chương 13: DI TRUYỀN HỌC VỚI CON NGƯỜI VÀ ĐỜI SỐNG
INSERT INTO chapter (subject_id, grade_level, chapter_number, chapter_name, description, created_at)
SELECT s.id, 9, 13, 'Di truyền học với con người và đời sống', 'Chương XIII. Di truyền học với con người và đời sống', NOW()
FROM subject s WHERE s.subject_code = 'SCI';

INSERT INTO lesson (chapter_id, lesson_number, lesson_name, created_at, updated_at)
SELECT c.id, 47, 'Di truyền học với con người', NOW(), NOW()
FROM chapter c JOIN subject s ON c.subject_id = s.id
WHERE s.subject_code = 'SCI' AND c.grade_level = 9 AND c.chapter_number = 13;


-- ────────────────────────────────────────────────────────────
-- BƯỚC 4: KIỂM TRA KẾT QUẢ
-- ────────────────────────────────────────────────────────────

SELECT c.grade_level AS "Lớp", c.chapter_number AS "Chương", c.chapter_name AS "Tên chương",
       l.lesson_number AS "Bài", l.lesson_name AS "Tên bài"
FROM chapter c
JOIN subject s ON c.subject_id = s.id
JOIN lesson l ON l.chapter_id = c.id
WHERE s.subject_code = 'SCI' AND c.grade_level IN (7, 8, 9)
ORDER BY c.grade_level, c.chapter_number, l.lesson_number;

