-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name);
CREATE INDEX IF NOT EXISTS idx_brands_active ON brands(is_active);

-- Add brand_id to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL;

-- Add index for brand_id in products table
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);

-- Insert some sample brands
INSERT INTO brands (name, description) VALUES
  ('Nike', 'Leading sports apparel and footwear brand'),
  ('Adidas', 'Global sports and lifestyle brand'),
  ('Louis Vuitton', 'Luxury fashion and leather goods'),
  ('Gucci', 'Italian luxury fashion house'),
  ('Sony', 'Electronics and entertainment brand'),
  ('Apple', 'Technology and consumer electronics')
ON CONFLICT (name) DO NOTHING;