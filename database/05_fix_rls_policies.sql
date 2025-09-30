-- ============================================
-- FIX ROW LEVEL SECURITY POLICIES
-- ============================================
-- This file fixes all RLS policies to allow proper CRUD operations
-- Run this after all other SQL files to fix permission issues

-- ============================================
-- OPTION 1: DISABLE RLS (SIMPLEST SOLUTION)
-- ============================================
-- This is the easiest fix - disables RLS for admin operations
-- Since you're not using Supabase Auth, this is the recommended approach

-- Disable RLS on all tables
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE trending_banner DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- ============================================
-- OPTION 2: FIX RLS POLICIES (IF YOU WANT TO KEEP RLS)
-- ============================================
-- If you prefer to keep RLS enabled, comment out Option 1 above
-- and uncomment the following section:

/*
-- First, drop all existing policies
DROP POLICY IF EXISTS "Allow public read access" ON categories;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON categories;
DROP POLICY IF EXISTS "Allow authenticated users to update" ON categories;
DROP POLICY IF EXISTS "Allow authenticated users to delete" ON categories;

DROP POLICY IF EXISTS "Allow public read active products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to insert products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to update products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to delete products" ON products;

DROP POLICY IF EXISTS "Allow public read product images" ON product_images;
DROP POLICY IF EXISTS "Allow authenticated users to insert images" ON product_images;
DROP POLICY IF EXISTS "Allow authenticated users to update images" ON product_images;
DROP POLICY IF EXISTS "Allow authenticated users to delete images" ON product_images;

DROP POLICY IF EXISTS "Allow public read active banners" ON trending_banner;
DROP POLICY IF EXISTS "Allow authenticated users to insert banners" ON trending_banner;
DROP POLICY IF EXISTS "Allow authenticated users to update banners" ON trending_banner;
DROP POLICY IF EXISTS "Allow authenticated users to delete banners" ON trending_banner;

DROP POLICY IF EXISTS "Allow authenticated users to read settings" ON admin_settings;
DROP POLICY IF EXISTS "Allow authenticated users to insert settings" ON admin_settings;
DROP POLICY IF EXISTS "Allow authenticated users to update settings" ON admin_settings;
DROP POLICY IF EXISTS "Allow authenticated users to delete settings" ON admin_settings;

DROP POLICY IF EXISTS "Allow public to validate login" ON admin_users;

-- Create new permissive policies for all operations
-- Since you're using anon key, we'll make policies permissive

-- Categories - Allow all operations
CREATE POLICY "Enable all operations for categories" ON categories
    FOR ALL USING (true) WITH CHECK (true);

-- Products - Allow all operations
CREATE POLICY "Enable read for products" ON products
    FOR SELECT USING (true);
CREATE POLICY "Enable insert for products" ON products
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for products" ON products
    FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for products" ON products
    FOR DELETE USING (true);

-- Product Images - Allow all operations
CREATE POLICY "Enable all operations for product_images" ON product_images
    FOR ALL USING (true) WITH CHECK (true);

-- Trending Banner - Allow all operations
CREATE POLICY "Enable all operations for trending_banner" ON trending_banner
    FOR ALL USING (true) WITH CHECK (true);

-- Admin Settings - Allow all operations
CREATE POLICY "Enable all operations for admin_settings" ON admin_settings
    FOR ALL USING (true) WITH CHECK (true);

-- Admin Users - Allow read for login validation
CREATE POLICY "Enable read for admin_users" ON admin_users
    FOR SELECT USING (true);
CREATE POLICY "Enable update for admin_users" ON admin_users
    FOR UPDATE USING (true) WITH CHECK (true);
*/

-- ============================================
-- GRANT NECESSARY PERMISSIONS
-- ============================================
-- Grant permissions to anon and authenticated roles

-- Categories
GRANT ALL ON categories TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE categories_id_seq TO anon, authenticated;

-- Products
GRANT ALL ON products TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE products_id_seq TO anon, authenticated;

-- Product Images
GRANT ALL ON product_images TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE product_images_id_seq TO anon, authenticated;

-- Trending Banner
GRANT ALL ON trending_banner TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE trending_banner_id_seq TO anon, authenticated;

-- Admin Settings
GRANT ALL ON admin_settings TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE admin_settings_id_seq TO anon, authenticated;

-- Admin Users
GRANT ALL ON admin_users TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE admin_users_id_seq TO anon, authenticated;

-- ============================================
-- VERIFY THE FIX
-- ============================================
-- After running this file, test the following:

-- Test inserting a category (should work now)
-- INSERT INTO categories (name) VALUES ('Test Category');

-- Test updating a category (should work now)
-- UPDATE categories SET name = 'Updated Test' WHERE name = 'Test Category';

-- Test deleting a category (should work now)
-- DELETE FROM categories WHERE name = 'Updated Test';

-- ============================================
-- IMPORTANT NOTES
-- ============================================
-- 1. Option 1 (Disabling RLS) is recommended for your use case
--    since you're not using Supabase Auth properly
--
-- 2. If you later implement proper Supabase Auth, you can
--    re-enable RLS with proper policies
--
-- 3. For production, consider implementing proper authentication
--    with Supabase Auth instead of custom admin_users table
-- ============================================