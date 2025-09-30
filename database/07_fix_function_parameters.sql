-- ============================================
-- FIX FUNCTION PARAMETER ORDER
-- ============================================
-- This fixes the parameter order issue that Supabase is reporting

-- Drop the existing functions
DROP FUNCTION IF EXISTS update_admin_username(BIGINT, VARCHAR(100));
DROP FUNCTION IF EXISTS update_admin_password(VARCHAR(100), VARCHAR(255), VARCHAR(255));

-- 1. CREATE USERNAME UPDATE FUNCTION WITH CORRECT PARAMETER ORDER
-- ============================================
-- Note: Supabase hint suggests: update_admin_username(p_new_username, p_user_id)
CREATE OR REPLACE FUNCTION update_admin_username(
    p_new_username VARCHAR(100),
    p_user_id BIGINT
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

-- 2. CREATE PASSWORD UPDATE FUNCTION WITH CORRECT PARAMETER ORDER
-- ============================================
-- Note: Supabase hint suggests: update_admin_password(p_new_password, p_old_password, p_username)
CREATE OR REPLACE FUNCTION update_admin_password(
    p_new_password VARCHAR(255),
    p_old_password VARCHAR(255),
    p_username VARCHAR(100)
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

-- 4. TEST THE FUNCTIONS
-- ============================================
-- You can test these functions after running this SQL:
-- SELECT update_admin_username('testuser', 1);
-- SELECT update_admin_password('newpass123', 'oldpass123', 'admin');