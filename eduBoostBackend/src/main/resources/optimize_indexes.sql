-- ============================================================
-- EduBoost High-Concurrency Database Indexes Script
-- Run this script on PostgreSQL to optimize queries under load
-- ============================================================

-- 1. Students Table: Optimization for enrollment & student lookup
CREATE INDEX IF NOT EXISTS idx_students_user_class ON students(user_id, class_id);
CREATE INDEX IF NOT EXISTS idx_students_student_code ON students(student_code);

-- 2. Student Exam Results Table: Optimization for exam submissions and score lookup
CREATE INDEX IF NOT EXISTS idx_results_student_id ON student_exam_results(student_id);
CREATE INDEX IF NOT EXISTS idx_results_exam_id ON student_exam_results(exam_id);
CREATE INDEX IF NOT EXISTS idx_results_assignment_id ON student_exam_results(assignment_id);

-- 3. Users Table: Optimization for authentication & lookup by email
CREATE INDEX IF NOT EXISTS idx_users_email ON Users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON Users(username);

-- 4. Classes Table: Optimization for teacher class list & active status filter
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_status ON classes(status);

-- 5. Exam Questions Table: Optimization for exam assembly & rendering
CREATE INDEX IF NOT EXISTS idx_exam_questions_exam_id ON exam_questions(exam_id);
