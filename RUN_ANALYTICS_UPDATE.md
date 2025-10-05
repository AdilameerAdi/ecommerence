# Analytics Update Instructions

## IMPORTANT: SQL Changes to Apply in Supabase

The analytics tracking has been updated to properly track different types of user interactions. You need to run ALL of the following SQL in your Supabase SQL Editor:

### 1. Drop and recreate the product analytics function

Run this SQL in your Supabase SQL Editor:

```sql
-- STEP 1: Fix RLS Policies for Analytics Tables
-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations on user_analytics" ON user_analytics;
DROP POLICY IF EXISTS "Allow all operations on product_analytics" ON product_analytics;
DROP POLICY IF EXISTS "Allow all operations on search_analytics" ON search_analytics;
DROP POLICY IF EXISTS "Allow all operations on page_analytics" ON page_analytics;

-- Create more permissive policies for analytics tables
-- User Analytics
CREATE POLICY "Enable insert for all users" ON user_analytics
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Enable select for all users" ON user_analytics
    FOR SELECT TO anon, authenticated
    USING (true);

-- Product Analytics
CREATE POLICY "Enable insert for all users" ON product_analytics
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Enable select for all users" ON product_analytics
    FOR SELECT TO anon, authenticated
    USING (true);

-- Search Analytics
CREATE POLICY "Enable insert for all users" ON search_analytics
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Enable select for all users" ON search_analytics
    FOR SELECT TO anon, authenticated
    USING (true);

-- Page Analytics
CREATE POLICY "Enable insert for all users" ON page_analytics
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Enable select for all users" ON page_analytics
    FOR SELECT TO anon, authenticated
    USING (true);

-- Grant necessary permissions
GRANT INSERT, SELECT ON user_analytics TO anon, authenticated;
GRANT INSERT, SELECT ON product_analytics TO anon, authenticated;
GRANT INSERT, SELECT ON search_analytics TO anon, authenticated;
GRANT INSERT, SELECT ON page_analytics TO anon, authenticated;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- STEP 2: Drop and recreate functions
-- Drop the existing function
DROP FUNCTION IF EXISTS get_product_analytics_summary(DATE, DATE);

-- Recreate with updated action types
CREATE OR REPLACE FUNCTION get_product_analytics_summary(
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    product_id INTEGER,
    product_name TEXT,
    total_views BIGINT,
    total_clicks BIGINT,
    total_dm_clicks BIGINT,
    total_modal_opens BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id as product_id,
        p.name as product_name,
        COUNT(CASE WHEN pa.action_type = 'card_click' THEN 1 END) as total_views,
        COUNT(CASE WHEN pa.action_type = 'view_details' THEN 1 END) as total_clicks,
        COUNT(CASE WHEN pa.action_type = 'dm_click' THEN 1 END) as total_dm_clicks,
        COUNT(CASE WHEN pa.action_type = 'modal_open' THEN 1 END) as total_modal_opens
    FROM products p
    LEFT JOIN product_analytics pa ON p.id = pa.product_id
    WHERE (start_date IS NULL OR pa.action_timestamp::DATE >= start_date)
      AND (end_date IS NULL OR pa.action_timestamp::DATE <= end_date)
    GROUP BY p.id, p.name
    ORDER BY total_views DESC;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate daily analytics overview
DROP FUNCTION IF EXISTS get_daily_analytics_overview(DATE);

CREATE OR REPLACE FUNCTION get_daily_analytics_overview(
    target_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_page_views BIGINT,
    unique_visitors BIGINT,
    total_searches BIGINT,
    total_product_views BIGINT,
    total_dm_clicks BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM page_analytics WHERE page_timestamp::DATE = target_date) as total_page_views,
        (SELECT COUNT(DISTINCT ip_address) FROM user_analytics WHERE visit_date = target_date) as unique_visitors,
        (SELECT COUNT(*) FROM search_analytics WHERE search_timestamp::DATE = target_date) as total_searches,
        (SELECT COUNT(*) FROM product_analytics WHERE action_type = 'card_click' AND action_timestamp::DATE = target_date) as total_product_views,
        (SELECT COUNT(*) FROM product_analytics WHERE action_type = 'dm_click' AND action_timestamp::DATE = target_date) as total_dm_clicks;
END;
$$ LANGUAGE plpgsql;
```

## Changes Made to the Code

### 1. **Fixed Product Click Tracking**
   - Changed from generic 'view' and 'click' to specific action types:
     - `card_click`: When user clicks on a product card
     - `view_details`: When user clicks the "View Details" button
     - `dm_click`: When user clicks the DM button in modal
     - `modal_open`: When product modal opens

### 2. **Fixed Search Tracking**
   - Now tracks actual result count when searching
   - Removed duplicate tracking from navbar
   - Search is tracked in products.jsx with correct results count

### 3. **Updated Analytics Display**
   - Analytics dashboard now shows:
     - "Card Clicks" instead of "Views"
     - "View Details" instead of "Clicks"
     - Proper DM click counts
     - Search queries with result counts

### 4. **Made Tracking Asynchronous**
   - All tracking calls are now properly awaited
   - Prevents race conditions and ensures data is saved

## Testing the Analytics

1. **Test Product Interactions:**
   - Click on product cards
   - Click "View Details" buttons
   - Click DM buttons in modals
   - Check if counts appear in Admin Dashboard > Analytics

2. **Test Search Analytics:**
   - Search for different products
   - Check if searches appear with correct result counts

3. **Check Admin Dashboard:**
   - Go to `/admindashboard`
   - Click on Analytics
   - Verify all metrics are showing correctly

## Note
Make sure to run the SQL updates above in your Supabase database for the analytics to work correctly.