-- Add retail_price and ending_price columns to products table
ALTER TABLE products
ADD COLUMN retail_price DECIMAL(10, 2),
ADD COLUMN ending_price DECIMAL(10, 2);

-- Update the column comments for clarity
COMMENT ON COLUMN products.retail_price IS 'Retail price of the product';
COMMENT ON COLUMN products.price IS 'Starting price of the product';
COMMENT ON COLUMN products.ending_price IS 'Ending price of the product (for price range display)';

-- Rename the existing price column to starting_price for clarity (optional)
-- ALTER TABLE products RENAME COLUMN price TO starting_price;