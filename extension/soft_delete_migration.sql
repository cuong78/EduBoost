-- =====================================================================
-- Soft Delete Migration
-- Run this script ONCE against the production/dev PostgreSQL database
-- BEFORE deploying the new backend build.
-- This adds is_deleted + deleted_at columns with safe defaults so
-- ddl-auto=update does not fail on existing non-null rows.
-- =====================================================================

-- exam
ALTER TABLE exam
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- question_bank
ALTER TABLE question_bank
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- lesson_resource
ALTER TABLE lesson_resource
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- exam_matrix_template
ALTER TABLE exam_matrix_template
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Optional: create indexes for faster filtering
CREATE INDEX IF NOT EXISTS idx_exam_not_deleted        ON exam(is_deleted) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_qb_not_deleted          ON question_bank(is_deleted) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_lr_not_deleted          ON lesson_resource(is_deleted) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_emt_not_deleted         ON exam_matrix_template(is_deleted) WHERE is_deleted = false;
