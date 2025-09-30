-- ============================================
-- FIX ADMIN CREDENTIAL UPDATE FUNCTIONS
-- ============================================
-- This file fixes the admin credential update functions that are causing errors

-- Drop existing functions to recreate them properly
DROP FUNCTION IF EXISTS update_admin_credentials(BIGINT, VARCHAR(100), VARCHAR(255), VARCHAR(255));
DROP FUNCTION IF EXISTS change_admin_password(VARCHAR(100), VARCHAR(255), VARCHAR(255));

-- 1. SIMPLIFIED USERNAME UPDATE FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_admin_username(
    p_user_id BIGINT,
    p_new_username VARCHAR(100)
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if username already exists
    IF EXISTS (SELECT 1 FROM admin_users WHERE username = p_new_username AND id != p_user_id) THEN
        RAISE EXCEPTION 'Username already exists';
    END IF;

    -- Update username
    UPDATE admin_users
    SET username = p_new_username,
        updated_at = NOW()
    WHERE id = p_user_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 2. SIMPLIFIED PASSWORD UPDATE FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_admin_password(
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
    WHERE LOWER(username) = LOWER(p_username) AND is_active = true;

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
    SET password = p_new_password,
        updated_at = NOW()
    WHERE id = v_user_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 3. GRANT PERMISSIONS
-- ============================================
GRANT EXECUTE ON FUNCTION update_admin_username TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_admin_password TO anon, authenticated;

-- 4. TEST THE FUNCTIONS (Uncomment to test)
-- ============================================
-- Test username update:
-- SELECT update_admin_username(1, 'newusername');

-- Test password update:
-- SELECT update_admin_password('admin', 'admin123', 'newpassword123');