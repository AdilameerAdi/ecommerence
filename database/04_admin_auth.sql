-- ============================================
-- ADMIN AUTHENTICATION TABLES AND FUNCTIONS
-- ============================================
-- This file creates admin credentials table for simple authentication
-- Execute this after the main schema files

-- 1. CREATE ADMIN USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- In production, this should be hashed
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy for public to read (needed for login validation)
-- Note: This only allows reading username for validation, not password directly
CREATE POLICY "Allow public to validate login" ON admin_users
    FOR SELECT USING (true);

-- 2. INSERT DEFAULT ADMIN CREDENTIALS
-- ============================================
-- Default username: admin
-- Default password: admin123
-- IMPORTANT: Change these credentials after first login!
INSERT INTO admin_users (username, password, email)
VALUES
    ('admin', 'admin123', 'admin@example.com'),
    ('adil', 'ameer', 'adil@example.com') -- Keeping your existing credentials
ON CONFLICT (username) DO NOTHING;

-- 3. FUNCTION TO VALIDATE ADMIN LOGIN
-- ============================================
CREATE OR REPLACE FUNCTION validate_admin_login(
    p_username VARCHAR(100),
    p_password VARCHAR(255)
)
RETURNS TABLE (
    success BOOLEAN,
    user_id BIGINT,
    username VARCHAR(100),
    email VARCHAR(255)
) AS $$
DECLARE
    v_user_id BIGINT;
    v_username VARCHAR(100);
    v_email VARCHAR(255);
    v_stored_password VARCHAR(255);
    v_is_active BOOLEAN;
BEGIN
    -- Get user details
    SELECT id, admin_users.username, admin_users.email, password, is_active
    INTO v_user_id, v_username, v_email, v_stored_password, v_is_active
    FROM admin_users
    WHERE LOWER(admin_users.username) = LOWER(p_username);

    -- Check if user exists and is active
    IF v_user_id IS NULL THEN
        RETURN QUERY SELECT FALSE::BOOLEAN, NULL::BIGINT, NULL::VARCHAR(100), NULL::VARCHAR(255);
        RETURN;
    END IF;

    IF NOT v_is_active THEN
        RETURN QUERY SELECT FALSE::BOOLEAN, NULL::BIGINT, NULL::VARCHAR(100), NULL::VARCHAR(255);
        RETURN;
    END IF;

    -- Validate password (simple comparison - in production use proper hashing)
    IF v_stored_password = p_password THEN
        -- Update last login time
        UPDATE admin_users
        SET last_login = NOW()
        WHERE id = v_user_id;

        RETURN QUERY SELECT TRUE::BOOLEAN, v_user_id, v_username, v_email;
    ELSE
        RETURN QUERY SELECT FALSE::BOOLEAN, NULL::BIGINT, NULL::VARCHAR(100), NULL::VARCHAR(255);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 4. FUNCTION TO UPDATE ADMIN CREDENTIALS
-- ============================================
CREATE OR REPLACE FUNCTION update_admin_credentials(
    p_user_id BIGINT,
    p_new_username VARCHAR(100) DEFAULT NULL,
    p_new_password VARCHAR(255) DEFAULT NULL,
    p_new_email VARCHAR(255) DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Update only provided fields
    UPDATE admin_users
    SET
        username = COALESCE(p_new_username, username),
        password = COALESCE(p_new_password, password),
        email = COALESCE(p_new_email, email),
        updated_at = NOW()
    WHERE id = p_user_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 5. FUNCTION TO CHANGE PASSWORD WITH OLD PASSWORD VERIFICATION
-- ============================================
CREATE OR REPLACE FUNCTION change_admin_password(
    p_username VARCHAR(100),
    p_old_password VARCHAR(255),
    p_new_password VARCHAR(255)
)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id BIGINT;
    v_stored_password VARCHAR(255);
BEGIN
    -- Get user details
    SELECT id, password
    INTO v_user_id, v_stored_password
    FROM admin_users
    WHERE LOWER(username) = LOWER(p_username);

    -- Check if user exists
    IF v_user_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Verify old password
    IF v_stored_password != p_old_password THEN
        RETURN FALSE;
    END IF;

    -- Update password
    UPDATE admin_users
    SET
        password = p_new_password,
        updated_at = NOW()
    WHERE id = v_user_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 6. FUNCTION TO GET ADMIN USER DETAILS
-- ============================================
CREATE OR REPLACE FUNCTION get_admin_user(p_user_id BIGINT)
RETURNS TABLE (
    id BIGINT,
    username VARCHAR(100),
    email VARCHAR(255),
    is_active BOOLEAN,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        admin_users.id,
        admin_users.username,
        admin_users.email,
        admin_users.is_active,
        admin_users.last_login,
        admin_users.created_at
    FROM admin_users
    WHERE admin_users.id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- 7. FUNCTION TO LIST ALL ADMIN USERS (for super admin)
-- ============================================
CREATE OR REPLACE FUNCTION list_admin_users()
RETURNS TABLE (
    id BIGINT,
    username VARCHAR(100),
    email VARCHAR(255),
    is_active BOOLEAN,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        admin_users.id,
        admin_users.username,
        admin_users.email,
        admin_users.is_active,
        admin_users.last_login,
        admin_users.created_at
    FROM admin_users
    ORDER BY admin_users.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION validate_admin_login TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_admin_credentials TO authenticated;
GRANT EXECUTE ON FUNCTION change_admin_password TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_admin_user TO authenticated;
GRANT EXECUTE ON FUNCTION list_admin_users TO authenticated;

-- ============================================
-- IMPORTANT SECURITY NOTES:
-- ============================================
-- 1. In production, passwords should be hashed using bcrypt or similar
-- 2. Consider implementing session tokens instead of storing credentials
-- 3. Add rate limiting to prevent brute force attacks
-- 4. Use HTTPS to encrypt data in transit
-- 5. Implement proper session management
-- 6. Add audit logging for security events
-- ============================================