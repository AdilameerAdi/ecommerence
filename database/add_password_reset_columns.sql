-- Add password reset columns to admin_users table
ALTER TABLE admin_users
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_expires TIMESTAMP WITH TIME ZONE;

-- Create index for faster token lookup
CREATE INDEX IF NOT EXISTS idx_admin_users_reset_token
ON admin_users(reset_token)
WHERE reset_token IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN admin_users.reset_token IS 'Token for password reset functionality';
COMMENT ON COLUMN admin_users.reset_expires IS 'Expiration timestamp for the reset token';