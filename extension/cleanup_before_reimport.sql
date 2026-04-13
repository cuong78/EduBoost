-- =====================================================================
-- cleanup_before_reimport.sql
-- Bước 2: Xóa dữ liệu liên quan trước khi re-import câu hỏi đúng format.
--
-- HƯỚNG DẪN:
-- 1. Thay <lesson_id> bằng ID bài học thực tế (query ở BƯỚC 0)
-- 2. Chạy từng khối theo thứ tự A → B → C → D → E
-- 3. Dùng BEGIN; ... COMMIT; hoặc ROLLBACK; để an toàn
-- =====================================================================


-- ─────────────────────────────────────────────────────────────────────
-- BƯỚC A: Xem trước — tìm exam có chứa câu hỏi của lesson cần xóa
-- ─────────────────────────────────────────────────────────────────────
DO $$
DECLARE
    v_lesson_ids BIGINT[] := ARRAY[<lesson_id_1>, <lesson_id_2>]; -- THAY ID Ở ĐÂY
BEGIN
    RAISE NOTICE '=== CÁC ĐỀ THI CHỨA CÂU HỎI CẦN XÓA ===';
END $$;

SELECT DISTINCT
    e.id          AS exam_id,
    e.exam_code,
    e.exam_title,
    e.status
FROM exam e
JOIN exam_question eq ON eq.exam_id = e.id
JOIN question_bank qb ON eq.question_bank_id = qb.id
WHERE qb.lesson_id IN (<lesson_id_1>, <lesson_id_2>)  -- THAY ID
ORDER BY e.id;

-- ─────────────────────────────────────────────────────────────────────
-- BƯỚC B: Xóa answer details (nếu có bảng riêng)
-- student_exam_result → exam_assignment → exam
-- ─────────────────────────────────────────────────────────────────────
BEGIN;

-- B1: Xóa student_exam_result liên quan đến các exam chứa câu hỏi của lesson
DELETE FROM student_exam_result
WHERE exam_assignment_id IN (
    SELECT ea.id
    FROM exam_assignment ea
    WHERE ea.exam_id IN (
        SELECT DISTINCT eq.exam_id
        FROM exam_question eq
        JOIN question_bank qb ON eq.question_bank_id = qb.id
        WHERE qb.lesson_id IN (<lesson_id_1>, <lesson_id_2>)  -- THAY ID
    )
);

-- B2: Xóa exam_assignment liên quan
DELETE FROM exam_assignment
WHERE exam_id IN (
    SELECT DISTINCT eq.exam_id
    FROM exam_question eq
    JOIN question_bank qb ON eq.question_bank_id = qb.id
    WHERE qb.lesson_id IN (<lesson_id_1>, <lesson_id_2>)  -- THAY ID
);

-- B3: Xóa exam_violation_log liên quan (nếu có)
DELETE FROM exam_violation_log
WHERE exam_assignment_id NOT IN (SELECT id FROM exam_assignment);  -- Orphan cleanup

COMMIT;

-- ─────────────────────────────────────────────────────────────────────
-- BƯỚC C: Xóa exam và exam_question chứa câu hỏi của lesson
-- ─────────────────────────────────────────────────────────────────────
BEGIN;

-- C1: Xóa exam_question trước (FK parent)
DELETE FROM exam_question
WHERE exam_id IN (
    SELECT DISTINCT eq2.exam_id
    FROM exam_question eq2
    JOIN question_bank qb ON eq2.question_bank_id = qb.id
    WHERE qb.lesson_id IN (<lesson_id_1>, <lesson_id_2>)  -- THAY ID
);

-- C2: Xóa exam (soft delete — cập nhật is_deleted = true)
-- Hoặc xóa thật nếu muốn:
UPDATE exam SET is_deleted = true, deleted_at = NOW()
WHERE id IN (
    SELECT DISTINCT eq.exam_id
    FROM exam_question eq
    JOIN question_bank qb ON eq.question_bank_id = qb.id
    WHERE qb.lesson_id IN (<lesson_id_1>, <lesson_id_2>)  -- THAY ID
);
-- Nếu muốn xóa thật: DELETE FROM exam WHERE id IN (...);

COMMIT;

-- ─────────────────────────────────────────────────────────────────────
-- BƯỚC D: Xóa câu hỏi trong bank (question_bank)
-- ─────────────────────────────────────────────────────────────────────
BEGIN;

-- Kiểm tra trước khi xóa
SELECT COUNT(*) AS so_cau_se_xoa
FROM question_bank
WHERE lesson_id IN (<lesson_id_1>, <lesson_id_2>);  -- THAY ID

-- Xóa thật (hoặc soft delete)
DELETE FROM question_bank
WHERE lesson_id IN (<lesson_id_1>, <lesson_id_2>);  -- THAY ID

-- Soft delete thay thế:
-- UPDATE question_bank SET is_deleted = true, deleted_at = NOW()
-- WHERE lesson_id IN (<lesson_id_1>, <lesson_id_2>);

COMMIT;

-- ─────────────────────────────────────────────────────────────────────
-- BƯỚC E: Xác nhận cleanup thành công
-- ─────────────────────────────────────────────────────────────────────
SELECT
    l.id          AS lesson_id,
    l.lesson_name,
    COUNT(qb.id)  AS con_lai
FROM lesson l
LEFT JOIN question_bank qb
       ON qb.lesson_id = l.id
      AND qb.is_deleted = false
WHERE l.id IN (<lesson_id_1>, <lesson_id_2>)  -- THAY ID
GROUP BY l.id, l.lesson_name;

-- Kỳ vọng: con_lai = 0 cho tất cả lesson đã xóa
