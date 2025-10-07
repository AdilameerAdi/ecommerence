-- COMPLETE FIX FOR CATEGORIES AND BRANDS TABLES
-- This SQL handles ALL possible issues and missing columns

-- First, check what columns actually exist in your tables
SELECT 'CURRENT CATEGORIES COLUMNS:' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'categories';

SELECT 'CURRENT BRANDS COLUMNS:' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'brands';

-- Add ALL potentially missing columns to categories table
DO $$
BEGIN
    -- Add image_url if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'image_url') THEN
        ALTER TABLE categories ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Added image_url to categories';
    END IF;

    -- Add description if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'description') THEN
        ALTER TABLE categories ADD COLUMN description TEXT;
        RAISE NOTICE 'Added description to categories';
    END IF;

    -- Add is_active if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'is_active') THEN
        ALTER TABLE categories ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_active to categories';
    END IF;

    -- Add created_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'created_at') THEN
        ALTER TABLE categories ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at to categories';
    END IF;

    -- Add updated_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'updated_at') THEN
        ALTER TABLE categories ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at to categories';
    END IF;
END $$;

-- Add ALL potentially missing columns to brands table
DO $$
BEGIN
    -- Add image_url if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brands' AND column_name = 'image_url') THEN
        ALTER TABLE brands ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Added image_url to brands';
    END IF;

    -- Add category_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brands' AND column_name = 'category_id') THEN
        ALTER TABLE brands ADD COLUMN category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added category_id to brands';
    END IF;

    -- Add description if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brands' AND column_name = 'description') THEN
        ALTER TABLE brands ADD COLUMN description TEXT;
        RAISE NOTICE 'Added description to brands';
    END IF;

    -- Add logo_url if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brands' AND column_name = 'logo_url') THEN
        ALTER TABLE brands ADD COLUMN logo_url TEXT;
        RAISE NOTICE 'Added logo_url to brands';
    END IF;

    -- Add is_active if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brands' AND column_name = 'is_active') THEN
        ALTER TABLE brands ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_active to brands';
    END IF;

    -- Add created_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brands' AND column_name = 'created_at') THEN
        ALTER TABLE brands ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at to brands';
    END IF;

    -- Add updated_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brands' AND column_name = 'updated_at') THEN
        ALTER TABLE brands ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at to brands';
    END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_brands_category_id ON brands(category_id);

-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS get_brands_by_category(INTEGER);
DROP FUNCTION IF EXISTS get_categories_with_brand_counts();

-- Create function to get brands by category (SAFE VERSION)
CREATE OR REPLACE FUNCTION get_brands_by_category(category_id_param INTEGER DEFAULT NULL)
RETURNS TABLE (
    id INTEGER,
    name TEXT,
    description TEXT,
    image_url TEXT,
    category_id INTEGER,
    category_name TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        b.id::INTEGER,
        b.name::TEXT,
        COALESCE(b.description, '')::TEXT,
        COALESCE(b.image_url, '')::TEXT,
        b.category_id::INTEGER,
        COALESCE(c.name, 'No Category')::TEXT as category_name,
        COALESCE(b.is_active, true)::BOOLEAN,
        COALESCE(b.created_at, NOW())::TIMESTAMP WITH TIME ZONE
    FROM brands b
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE COALESCE(b.is_active, true) = true
      AND (category_id_param IS NULL OR b.category_id = category_id_param)
    ORDER BY b.name;
END;
$$ LANGUAGE plpgsql;

-- Create function to get categories with brand counts (SAFE VERSION)
CREATE OR REPLACE FUNCTION get_categories_with_brand_counts()
RETURNS TABLE (
    id INTEGER,
    name TEXT,
    description TEXT,
    image_url TEXT,
    brand_count BIGINT,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
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
        COALESCE(c.created_at, NOW())::TIMESTAMP WITH TIME ZONE
    FROM categories c
    LEFT JOIN brands b ON c.id = b.category_id AND COALESCE(b.is_active, true) = true
    WHERE COALESCE(c.is_active, true) = true
    GROUP BY c.id, c.name, c.description, c.image_url, c.is_active, c.created_at
    ORDER BY c.name;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON categories TO anon, authenticated;
GRANT ALL ON brands TO anon, authenticated;

-- Verify the structure after changes
SELECT 'FINAL CATEGORIES STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'categories'
ORDER BY ordinal_position;

SELECT 'FINAL BRANDS STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'brands'
ORDER BY ordinal_position;

-- Test the functions
SELECT 'Testing get_categories_with_brand_counts:' as test;
SELECT * FROM get_categories_with_brand_counts();

SELECT 'Testing get_brands_by_category:' as test;
SELECT * FROM get_brands_by_category();

-- Show sample data
SELECT 'Sample categories:' as info;
SELECT id, name, description, image_url, is_active FROM categories LIMIT 5;

SELECT 'Sample brands:' as info;
SELECT id, name, description, image_url, category_id, is_active FROM brands LIMIT 5;