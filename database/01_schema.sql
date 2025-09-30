-- ============================================
-- SUPABASE SCHEMA SETUP
-- ============================================
-- This file creates all the necessary tables for the e-commerce website
-- Execute these queries in order in Supabase SQL Editor

-- 1. CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policy for public read access
CREATE POLICY "Allow public read access" ON categories
    FOR SELECT USING (true);

-- Policy for authenticated users to manage categories
CREATE POLICY "Allow authenticated users to insert" ON categories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update" ON categories
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete" ON categories
    FOR DELETE USING (auth.role() = 'authenticated');

-- 2. PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    is_trending BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_trending ON products(is_trending);
CREATE INDEX idx_products_active ON products(is_active);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy for public read access (only active products)
CREATE POLICY "Allow public read active products" ON products
    FOR SELECT USING (is_active = true);

-- Policy for authenticated users to manage products
CREATE POLICY "Allow authenticated users to insert products" ON products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update products" ON products
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete products" ON products
    FOR DELETE USING (auth.role() = 'authenticated');

-- 3. PRODUCT IMAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_main BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_images_main ON product_images(is_main);

-- Enable Row Level Security
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Policy for public read access
CREATE POLICY "Allow public read product images" ON product_images
    FOR SELECT USING (true);

-- Policy for authenticated users to manage images
CREATE POLICY "Allow authenticated users to insert images" ON product_images
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update images" ON product_images
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete images" ON product_images
    FOR DELETE USING (auth.role() = 'authenticated');

-- 4. TRENDING BANNER TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS trending_banner (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    discount_text VARCHAR(100),
    button_text VARCHAR(100) DEFAULT 'Shop Now',
    banner_image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE trending_banner ENABLE ROW LEVEL SECURITY;

-- Policy for public read access (only active banners)
CREATE POLICY "Allow public read active banners" ON trending_banner
    FOR SELECT USING (is_active = true);

-- Policy for authenticated users to manage banners
CREATE POLICY "Allow authenticated users to insert banners" ON trending_banner
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update banners" ON trending_banner
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete banners" ON trending_banner
    FOR DELETE USING (auth.role() = 'authenticated');

-- 5. ADMIN SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_settings (
    id BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users only
CREATE POLICY "Allow authenticated users to read settings" ON admin_settings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert settings" ON admin_settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update settings" ON admin_settings
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete settings" ON admin_settings
    FOR DELETE USING (auth.role() = 'authenticated');

-- 6. CREATE UPDATE TRIGGERS
-- ============================================
-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trending_banner_updated_at BEFORE UPDATE ON trending_banner
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON admin_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. CREATE VIEWS FOR EASIER QUERYING
-- ============================================
-- View for products with their main image
CREATE OR REPLACE VIEW products_with_main_image AS
SELECT
    p.*,
    pi.image_url as main_image_url,
    c.name as category_name
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_main = true
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true;

-- View for products with all images
CREATE OR REPLACE VIEW products_with_all_images AS
SELECT
    p.*,
    c.name as category_name,
    COALESCE(
        json_agg(
            json_build_object(
                'id', pi.id,
                'image_url', pi.image_url,
                'is_main', pi.is_main,
                'display_order', pi.display_order
            ) ORDER BY pi.display_order, pi.id
        ) FILTER (WHERE pi.id IS NOT NULL),
        '[]'::json
    ) as images
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true
GROUP BY p.id, c.name;

-- Grant access to views
GRANT SELECT ON products_with_main_image TO anon, authenticated;
GRANT SELECT ON products_with_all_images TO anon, authenticated;