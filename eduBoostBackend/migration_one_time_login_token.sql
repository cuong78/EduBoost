-- Migration: Add One-Time Login Token table
-- Date: 2024
-- Description: Support auto-login feature via email

CREATE TABLE IF NOT EXISTS one_time_login_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(64) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_one_time_token_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_one_time_token ON one_time_login_tokens(token);
CREATE INDEX IF NOT EXISTS idx_one_time_token_user ON one_time_login_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_one_time_token_expires ON one_time_login_tokens(expires_at);

-- Comment
COMMENT ON TABLE one_time_login_tokens IS 'Store one-time auto-login tokens sent via email';
COMMENT ON COLUMN one_time_login_tokens.token IS 'Random 256-bit token (Base64 URL-safe encoded)';
COMMENT ON COLUMN one_time_login_tokens.expires_at IS 'Token expiration time (24 hours from creation)';
COMMENT ON COLUMN one_time_login_tokens.used IS 'Flag to track if token has been used (one-time only)';
