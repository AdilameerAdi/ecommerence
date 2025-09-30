-- ============================================
-- INITIAL DATA MIGRATION
-- ============================================
-- This file populates the database with initial data from the static website
-- Execute this after creating the schema (01_schema.sql)

-- 1. INSERT INITIAL CATEGORIES
-- ============================================
INSERT INTO categories (name) VALUES
    ('Electronics'),
    ('Fashion'),
    ('Watches'),
    ('Bags'),
    ('Clothing'),
    ('Accessories')
ON CONFLICT (name) DO NOTHING;

-- 2. INSERT INITIAL PRODUCTS
-- ============================================
-- Note: We'll get category IDs dynamically to avoid hardcoding
INSERT INTO products (name, code, price, description, category_id, is_trending, is_active)
VALUES
    -- Classic Watch
    ('Classic Watch', 'P-001', 1200.00,
     'Elegant classic watch with stainless steel design.',
     (SELECT id FROM categories WHERE name = 'Watches'),
     false, true),

    -- Leather Bag
    ('Leather Bag', 'P-002', 2500.00,
     'Premium quality leather bag for casual and formal use.',
     (SELECT id FROM categories WHERE name = 'Bags'),
     false, true),

    -- Sample Electronics Products
    ('Apple iPhone 15', 'IP15', 1200.00,
     'Latest Apple iPhone 15 with A17 Bionic chip.',
     (SELECT id FROM categories WHERE name = 'Electronics'),
     true, true),

    -- Sample Fashion Products
    ('Nike Air Max', 'NAMX', 180.00,
     'Comfortable sneakers for running and casual wear.',
     (SELECT id FROM categories WHERE name = 'Fashion'),
     false, true),

    -- Sample Watch Products
    ('Rolex Submariner', 'RLX01', 8500.00,
     'Luxury Rolex watch with automatic movement.',
     (SELECT id FROM categories WHERE name = 'Watches'),
     true, true),

    -- Additional Products
    ('Samsung Galaxy S24', 'SGS24', 999.00,
     'Latest Samsung flagship with AI features.',
     (SELECT id FROM categories WHERE name = 'Electronics'),
     true, true),

    ('Louis Vuitton Handbag', 'LV001', 3500.00,
     'Iconic luxury handbag with signature monogram.',
     (SELECT id FROM categories WHERE name = 'Bags'),
     false, true),

    ('Adidas Ultraboost', 'ADU22', 150.00,
     'High-performance running shoes with boost technology.',
     (SELECT id FROM categories WHERE name = 'Fashion'),
     false, true),

    ('Apple Watch Ultra', 'AWU2', 799.00,
     'Advanced smartwatch for extreme sports.',
     (SELECT id FROM categories WHERE name = 'Watches'),
     true, true),

    ('Sony WH-1000XM5', 'SNY5', 399.00,
     'Premium noise-canceling headphones.',
     (SELECT id FROM categories WHERE name = 'Electronics'),
     false, true)
ON CONFLICT (code) DO NOTHING;

-- 3. INSERT PRODUCT IMAGES
-- ============================================
-- Classic Watch Images
INSERT INTO product_images (product_id, image_url, display_order, is_main)
VALUES
    ((SELECT id FROM products WHERE code = 'P-001'),
     'https://www.shutterstock.com/image-photo/gold-fashionable-elegant-watch-classic-600nw-2477327319.jpg',
     1, true),
    ((SELECT id FROM products WHERE code = 'P-001'),
     'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJl3b-S1cWsP-KOnDEmO4wD89VNAMhqnBt0VqywlfNpu7zI-7anh3FVkqMSY8L2h__X-w&usqp=CAU',
     2, false),
    ((SELECT id FROM products WHERE code = 'P-001'),
     'https://usercontent.one/wp/www.reuvenwatches.com/wp-content/uploads/2023/02/KD13789-845x562-1.jpg',
     3, false);

-- Leather Bag Images
INSERT INTO product_images (product_id, image_url, display_order, is_main)
VALUES
    ((SELECT id FROM products WHERE code = 'P-002'),
     'https://media.istockphoto.com/id/1271796113/photo/women-is-holding-handbag-near-luxury-car.jpg?s=612x612&w=0&k=20&c=-jtXLmexNgRa-eKqA1X8UJ8QYWhW7XgDiWNmzuuCHmM=',
     1, true),
    ((SELECT id FROM products WHERE code = 'P-002'),
     'https://img.drz.lazcdn.com/static/pk/p/b3d6d98af28fb1e015362b1d7f0484ed.jpg_720x720q80.jpg',
     2, false),
    ((SELECT id FROM products WHERE code = 'P-002'),
     'https://milanoleathers.com/cdn/shop/files/421509684_18409301293001835_2836428067153985979_n.png?v=1716032361',
     3, false),
    ((SELECT id FROM products WHERE code = 'P-002'),
     'https://image.made-in-china.com/318f0j00SEbUVOTZghqY/%E8%A7%86%E9%A2%91-1100128642440.mp4.webp',
     4, false);

-- iPhone 15 Images
INSERT INTO product_images (product_id, image_url, display_order, is_main)
VALUES
    ((SELECT id FROM products WHERE code = 'IP15'),
     'https://www.apple.com/newsroom/images/2023/09/apple-unveils-iphone-15-pro-and-iphone-15-pro-max/article/Apple-iPhone-15-Pro-lineup-hero-230912_inline.jpg.large.jpg',
     1, true),
    ((SELECT id FROM products WHERE code = 'IP15'),
     'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-pink?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1692923780378',
     2, false);

-- Nike Air Max Images
INSERT INTO product_images (product_id, image_url, display_order, is_main)
VALUES
    ((SELECT id FROM products WHERE code = 'NAMX'),
     'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/99486859-0ff3-46b4-949b-2d16af2ad421/custom-nike-air-max-90-by-you.png',
     1, true),
    ((SELECT id FROM products WHERE code = 'NAMX'),
     'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/4f37fca8-6bce-43e7-ad07-f57ae3c13142/air-max-270-mens-shoes-KkLcGR.png',
     2, false);

-- Rolex Submariner Images
INSERT INTO product_images (product_id, image_url, display_order, is_main)
VALUES
    ((SELECT id FROM products WHERE code = 'RLX01'),
     'https://www.rolex.com/content/dam/rolex-58/new-watches-2023/family-pages/classic-watches/family-page-classic-watches-submariner_m126610ln-0001_2309jva_001.jpg',
     1, true),
    ((SELECT id FROM products WHERE code = 'RLX01'),
     'https://www.rolex.com/content/dam/rolex-58/watches/family-pages/submariner/family-page-submariner-share.jpg',
     2, false);

-- Samsung Galaxy S24 Images
INSERT INTO product_images (product_id, image_url, display_order, is_main)
VALUES
    ((SELECT id FROM products WHERE code = 'SGS24'),
     'https://images.samsung.com/is/image/samsung/p6pim/pk/2401/gallery/pk-galaxy-s24-s928-sm-s928bztqmea-539305754?$650_519_PNG$',
     1, true),
    ((SELECT id FROM products WHERE code = 'SGS24'),
     'https://images.samsung.com/pk/smartphones/galaxy-s24/images/galaxy-s24-highlights-color-yellow-back-mo.jpg',
     2, false);

-- Louis Vuitton Images
INSERT INTO product_images (product_id, image_url, display_order, is_main)
VALUES
    ((SELECT id FROM products WHERE code = 'LV001'),
     'https://eu.louisvuitton.com/images/is/image/lv/1/PP_VP_L/louis-vuitton-neverfull-mm-monogram-handbags--M40995_PM2_Front%20view.jpg',
     1, true),
    ((SELECT id FROM products WHERE code = 'LV001'),
     'https://eu.louisvuitton.com/images/is/image/lv/1/PP_VP_L/louis-vuitton-speedy-bandouliere-25-monogram-handbags--M45957_PM2_Front%20view.jpg',
     2, false);

-- Adidas Ultraboost Images
INSERT INTO product_images (product_id, image_url, display_order, is_main)
VALUES
    ((SELECT id FROM products WHERE code = 'ADU22'),
     'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/37ced897315845eaa8f5af0100b53f55_9366/Ultraboost_22_Shoes_Black_HQ3519_01_standard.jpg',
     1, true),
    ((SELECT id FROM products WHERE code = 'ADU22'),
     'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/fbaf991a78bc4896a3e9ad7800abcec6_9366/Ultraboost_22_Shoes_Black_GZ0127_01_standard.jpg',
     2, false);

-- Apple Watch Ultra Images
INSERT INTO product_images (product_id, image_url, display_order, is_main)
VALUES
    ((SELECT id FROM products WHERE code = 'AWU2'),
     'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-ultra-2-49mm-titanium-blue-ocean-band-vray-tile?wid=490&hei=490&fmt=p-jpg&qlt=95&.v=1693594924198',
     1, true),
    ((SELECT id FROM products WHERE code = 'AWU2'),
     'https://www.apple.com/newsroom/images/2023/09/apple-unveils-apple-watch-ultra-2/article/Apple-Watch-Ultra-2-hero-230912_inline.jpg.large.jpg',
     2, false);

-- Sony Headphones Images
INSERT INTO product_images (product_id, image_url, display_order, is_main)
VALUES
    ((SELECT id FROM products WHERE code = 'SNY5'),
     'https://www.sony.com/image/5d02da5df552836db894cead8a68f5f3?fmt=pjpeg&wid=330&bgcolor=FFFFFF&bgc=FFFFFF',
     1, true),
    ((SELECT id FROM products WHERE code = 'SNY5'),
     'https://m.media-amazon.com/images/I/51aXvjzcukL._AC_SL1500_.jpg',
     2, false);

-- 4. INSERT TRENDING BANNER
-- ============================================
INSERT INTO trending_banner (title, subtitle, discount_text, button_text, banner_image_url, is_active)
VALUES
    ('🔥 Trending Sale Products',
     'Get up to 50% OFF on best sellers',
     '50% OFF',
     'Shop Now',
     'https://www.shutterstock.com/image-photo/gold-fashionable-elegant-watch-classic-600nw-2477327319.jpg',
     true)
ON CONFLICT DO NOTHING;

-- 5. INSERT INITIAL ADMIN SETTINGS
-- ============================================
INSERT INTO admin_settings (setting_key, setting_value)
VALUES
    ('site_name', 'E-Commerce Store'),
    ('items_per_page', '6'),
    ('enable_trending_banner', 'true'),
    ('max_product_images', '4')
ON CONFLICT (setting_key) DO NOTHING;

-- 6. VERIFY DATA INSERTION
-- ============================================
-- Run these queries to verify data has been inserted correctly:

-- Check categories count
-- SELECT COUNT(*) as total_categories FROM categories;

-- Check products count
-- SELECT COUNT(*) as total_products FROM products;

-- Check product images count
-- SELECT COUNT(*) as total_images FROM product_images;

-- Check products with images
-- SELECT p.name, COUNT(pi.id) as image_count
-- FROM products p
-- LEFT JOIN product_images pi ON p.id = pi.product_id
-- GROUP BY p.id, p.name;

-- View all products with their main images
-- SELECT * FROM products_with_main_image;

-- View trending products
-- SELECT * FROM products WHERE is_trending = true;