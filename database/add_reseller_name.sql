-- Add reseller_name column to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS reseller_name VARCHAR(255) NOT NULL DEFAULT 'Default Reseller';

-- Remove the default constraint after adding the column
-- This ensures existing rows have a value but new rows require it
ALTER TABLE products
ALTER COLUMN reseller_name DROP DEFAULT;

-- Add index for reseller_name for faster queries
CREATE INDEX IF NOT EXISTS idx_products_reseller ON products(reseller_name);