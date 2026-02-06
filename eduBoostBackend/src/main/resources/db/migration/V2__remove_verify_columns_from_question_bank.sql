-- Migration: Remove verify columns from question_bank table
-- These columns are no longer needed as verification logic has been removed
-- Run this script manually against your PostgreSQL database

-- Drop the foreign key constraint first (if exists)
ALTER TABLE question_bank DROP CONSTRAINT IF EXISTS fk_question_bank_verified_by;

-- Drop the columns
ALTER TABLE question_bank DROP COLUMN IF EXISTS is_verified;
ALTER TABLE question_bank DROP COLUMN IF EXISTS verified_by;
ALTER TABLE question_bank DROP COLUMN IF EXISTS verified_at;
