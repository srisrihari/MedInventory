-- =====================================================
-- Fix user_audit_log table schema
-- =====================================================
-- Add missing columns to user_audit_log table

-- Add input_data and output_data columns to user_audit_log
ALTER TABLE user_audit_log 
ADD COLUMN IF NOT EXISTS input_data JSONB,
ADD COLUMN IF NOT EXISTS output_data JSONB;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_user_audit_log_organization_id ON user_audit_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_audit_log_user_id ON user_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_audit_log_action ON user_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_user_audit_log_created_at ON user_audit_log(created_at);

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_audit_log' 
ORDER BY ordinal_position; 