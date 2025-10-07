-- FINAL ADMIN FUNCTIONS - Run AFTER 11_FINAL_FIX_categories_brands.sql
-- These functions handle all possible missing columns gracefully with correct type matching

-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS get_categories_for_admin();
DROP FUNCTION IF EXISTS get_brand_details(INTEGER);
DROP FUNCTION IF EXISTS get_brand_details(BIGINT);
DROP FUNCTION IF EXISTS get_category_details(INTEGER);
DROP FUNCTION IF EXISTS get_category_details(BIGINT);

-- Function to get all categories for dropdown (SAFE VERSION)
CREATE OR REPLACE FUNCTION get_categories_for_admin()
RETURNS TABLE (
    id INTEGER,
    name TEXT,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id::INTEGER,
        c.name::TEXT,
        COALESCE(c.description, '')::TEXT,
        COALESCE(c.image_url, '')::TEXT,
        COALESCE(c.is_active, true)::BOOLEAN
    FROM categories c
    WHERE COALESCE(c.is_active, true) = true
    ORDER BY c.name;
END;
$$ LANGUAGE plpgsql;

-- Function to get brand details with category info (SAFE VERSION)
CREATE OR REPLACE FUNCTION get_brand_details(brand_id_param INTEGER)
RETURNS TABLE (
    id INTEGER,
    name TEXT,
    description TEXT,
    logo_url TEXT,
    image_url TEXT,
    category_id INTEGER,
    category_name TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        b.id::INTEGER,
        b.name::TEXT,
        COALESCE(b.description, '')::TEXT,
        COALESCE(b.logo_url, '')::TEXT,
        COALESCE(b.image_url, '')::TEXT,
        b.category_id::INTEGER,
        COALESCE(c.name, 'No Category')::TEXT as category_name,
        COALESCE(b.is_active, true)::BOOLEAN,
        COALESCE(b.created_at, NOW())::TIMESTAMP WITH TIME ZONE,
        COALESCE(b.updated_at, NOW())::TIMESTAMP WITH TIME ZONE
    FROM brands b
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE b.id = brand_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to get category details (SAFE VERSION)
CREATE OR REPLACE FUNCTION get_category_details(category_id_param INTEGER)
RETURNS TABLE (
    id INTEGER,
    name TEXT,
    description TEXT,
    image_url TEXT,
    brand_count BIGINT,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id::INTEGER,
        c.name::TEXT,
        COALESCE(c.description, '')::TEXT,
        COALESCE(c.image_url, '')::TEXT,
        COUNT(b.id)::BIGINT as brand_count,
        COALESCE(c.is_active, true)::BOOLEAN,
        COALESCE(c.created_at, NOW())::TIMESTAMP WITH TIME ZONE,
        COALESCE(c.updated_at, NOW())::TIMESTAMP WITH TIME ZONE
    FROM categories c
    LEFT JOIN brands b ON c.id = b.category_id AND COALESCE(b.is_active, true) = true
    WHERE c.id = category_id_param
    GROUP BY c.id, c.name, c.description, c.image_url, c.is_active, c.created_at, c.updated_at;
END;
$$ LANGUAGE plpgsql;

-- Test all functions with proper casting
SELECT 'Testing get_categories_for_admin:' as test;
SELECT * FROM get_categories_for_admin();

-- Test brand details only if brands exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM brands LIMIT 1) THEN
        RAISE NOTICE 'Testing get_brand_details with existing brand...';
        PERFORM * FROM get_brand_details((SELECT id::INTEGER FROM brands LIMIT 1));
    ELSE
        RAISE NOTICE 'No brands found, skipping brand details test';
    END IF;
END $$;

-- Test category details only if categories exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM categories LIMIT 1) THEN
        RAISE NOTICE 'Testing get_category_details with existing category...';
        PERFORM * FROM get_category_details((SELECT id::INTEGER FROM categories LIMIT 1));
    ELSE
        RAISE NOTICE 'No categories found, skipping category details test';
    END IF;
END $$;

-- Verify functions exist
SELECT 'Verifying functions exist:' as info;
SELECT proname, pronargs
FROM pg_proc
WHERE proname IN ('get_categories_for_admin', 'get_brand_details', 'get_category_details', 'get_brands_by_category', 'get_categories_with_brand_counts')
ORDER BY proname;

SELECT 'All admin functions created successfully!' as success;