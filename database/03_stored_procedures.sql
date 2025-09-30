-- ============================================
-- STORED PROCEDURES AND FUNCTIONS
-- ============================================
-- This file creates helpful stored procedures for common operations
-- Execute this after creating schema and initial data

-- 1. FUNCTION TO ADD PRODUCT WITH IMAGES
-- ============================================
CREATE OR REPLACE FUNCTION add_product_with_images(
    p_name VARCHAR(255),
    p_code VARCHAR(100),
    p_price DECIMAL(10, 2),
    p_description TEXT,
    p_category_id BIGINT,
    p_is_trending BOOLEAN,
    p_images TEXT[] -- Array of image URLs
)
RETURNS BIGINT AS $$
DECLARE
    new_product_id BIGINT;
    image_url TEXT;
    image_counter INT := 0;
BEGIN
    -- Insert the product
    INSERT INTO products (name, code, price, description, category_id, is_trending, is_active)
    VALUES (p_name, p_code, p_price, p_description, p_category_id, p_is_trending, true)
    RETURNING id INTO new_product_id;

    -- Insert images
    IF p_images IS NOT NULL THEN
        FOREACH image_url IN ARRAY p_images
        LOOP
            image_counter := image_counter + 1;
            INSERT INTO product_images (product_id, image_url, display_order, is_main)
            VALUES (new_product_id, image_url, image_counter, image_counter = 1);
        END LOOP;
    END IF;

    RETURN new_product_id;
END;
$$ LANGUAGE plpgsql;

-- 2. FUNCTION TO UPDATE PRODUCT WITH IMAGES
-- ============================================
CREATE OR REPLACE FUNCTION update_product_with_images(
    p_product_id BIGINT,
    p_name VARCHAR(255),
    p_code VARCHAR(100),
    p_price DECIMAL(10, 2),
    p_description TEXT,
    p_category_id BIGINT,
    p_is_trending BOOLEAN,
    p_images TEXT[] -- Array of image URLs
)
RETURNS BOOLEAN AS $$
DECLARE
    image_url TEXT;
    image_counter INT := 0;
BEGIN
    -- Update the product
    UPDATE products
    SET name = p_name,
        code = p_code,
        price = p_price,
        description = p_description,
        category_id = p_category_id,
        is_trending = p_is_trending
    WHERE id = p_product_id;

    -- Delete existing images if new images are provided
    IF p_images IS NOT NULL AND array_length(p_images, 1) > 0 THEN
        DELETE FROM product_images WHERE product_id = p_product_id;

        -- Insert new images
        FOREACH image_url IN ARRAY p_images
        LOOP
            image_counter := image_counter + 1;
            INSERT INTO product_images (product_id, image_url, display_order, is_main)
            VALUES (p_product_id, image_url, image_counter, image_counter = 1);
        END LOOP;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 3. FUNCTION TO GET PRODUCTS WITH PAGINATION
-- ============================================
CREATE OR REPLACE FUNCTION get_products_paginated(
    p_page_number INT DEFAULT 1,
    p_items_per_page INT DEFAULT 6,
    p_category_id BIGINT DEFAULT NULL,
    p_is_trending BOOLEAN DEFAULT NULL
)
RETURNS TABLE (
    id BIGINT,
    name VARCHAR(255),
    code VARCHAR(100),
    price DECIMAL(10, 2),
    description TEXT,
    category_id BIGINT,
    category_name VARCHAR(255),
    is_trending BOOLEAN,
    main_image_url TEXT,
    images JSON,
    total_count BIGINT
) AS $$
DECLARE
    v_offset INT;
    v_total_count BIGINT;
BEGIN
    -- Calculate offset
    v_offset := (p_page_number - 1) * p_items_per_page;

    -- Get total count based on filters
    SELECT COUNT(*) INTO v_total_count
    FROM products p
    WHERE p.is_active = true
        AND (p_category_id IS NULL OR p.category_id = p_category_id)
        AND (p_is_trending IS NULL OR p.is_trending = p_is_trending);

    -- Return paginated results with images
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.code,
        p.price,
        p.description,
        p.category_id,
        c.name as category_name,
        p.is_trending,
        (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_main = true LIMIT 1) as main_image_url,
        COALESCE(
            json_agg(
                json_build_object(
                    'id', pi.id,
                    'image_url', pi.image_url,
                    'is_main', pi.is_main,
                    'display_order', pi.display_order
                ) ORDER BY pi.display_order
            ) FILTER (WHERE pi.id IS NOT NULL),
            '[]'::json
        ) as images,
        v_total_count as total_count
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_images pi ON p.id = pi.product_id
    WHERE p.is_active = true
        AND (p_category_id IS NULL OR p.category_id = p_category_id)
        AND (p_is_trending IS NULL OR p.is_trending = p_is_trending)
    GROUP BY p.id, c.name
    ORDER BY p.created_at DESC
    LIMIT p_items_per_page
    OFFSET v_offset;
END;
$$ LANGUAGE plpgsql;

-- 4. FUNCTION TO DELETE PRODUCT (SOFT DELETE)
-- ============================================
CREATE OR REPLACE FUNCTION soft_delete_product(p_product_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE products
    SET is_active = false,
        updated_at = NOW()
    WHERE id = p_product_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 5. FUNCTION TO GET DASHBOARD STATISTICS
-- ============================================
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
    total_products BIGINT,
    active_products BIGINT,
    trending_products BIGINT,
    total_categories BIGINT,
    total_product_images BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM products) as total_products,
        (SELECT COUNT(*) FROM products WHERE is_active = true) as active_products,
        (SELECT COUNT(*) FROM products WHERE is_trending = true AND is_active = true) as trending_products,
        (SELECT COUNT(*) FROM categories) as total_categories,
        (SELECT COUNT(*) FROM product_images) as total_product_images;
END;
$$ LANGUAGE plpgsql;

-- 6. FUNCTION TO TOGGLE PRODUCT TRENDING STATUS
-- ============================================
CREATE OR REPLACE FUNCTION toggle_product_trending(p_product_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE products
    SET is_trending = NOT is_trending,
        updated_at = NOW()
    WHERE id = p_product_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 7. FUNCTION TO SEARCH PRODUCTS
-- ============================================
CREATE OR REPLACE FUNCTION search_products(
    p_search_term VARCHAR(255),
    p_page_number INT DEFAULT 1,
    p_items_per_page INT DEFAULT 6
)
RETURNS TABLE (
    id BIGINT,
    name VARCHAR(255),
    code VARCHAR(100),
    price DECIMAL(10, 2),
    description TEXT,
    category_name VARCHAR(255),
    is_trending BOOLEAN,
    main_image_url TEXT,
    total_count BIGINT
) AS $$
DECLARE
    v_offset INT;
    v_total_count BIGINT;
BEGIN
    -- Calculate offset
    v_offset := (p_page_number - 1) * p_items_per_page;

    -- Get total count of search results
    SELECT COUNT(*) INTO v_total_count
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = true
        AND (
            p.name ILIKE '%' || p_search_term || '%'
            OR p.code ILIKE '%' || p_search_term || '%'
            OR p.description ILIKE '%' || p_search_term || '%'
            OR c.name ILIKE '%' || p_search_term || '%'
        );

    -- Return search results
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.code,
        p.price,
        p.description,
        c.name as category_name,
        p.is_trending,
        (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_main = true LIMIT 1) as main_image_url,
        v_total_count as total_count
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = true
        AND (
            p.name ILIKE '%' || p_search_term || '%'
            OR p.code ILIKE '%' || p_search_term || '%'
            OR p.description ILIKE '%' || p_search_term || '%'
            OR c.name ILIKE '%' || p_search_term || '%'
        )
    ORDER BY
        CASE
            WHEN p.name ILIKE p_search_term || '%' THEN 1
            WHEN p.code ILIKE p_search_term || '%' THEN 2
            ELSE 3
        END,
        p.created_at DESC
    LIMIT p_items_per_page
    OFFSET v_offset;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions on all functions
GRANT EXECUTE ON FUNCTION add_product_with_images TO authenticated;
GRANT EXECUTE ON FUNCTION update_product_with_images TO authenticated;
GRANT EXECUTE ON FUNCTION get_products_paginated TO anon, authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_product TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_stats TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_product_trending TO authenticated;
GRANT EXECUTE ON FUNCTION search_products TO anon, authenticated;