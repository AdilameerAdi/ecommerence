# Analytics Troubleshooting Guide

## Problem: Analytics showing zero counts

### Step 1: Run ALL SQL Updates in Supabase

Go to your Supabase Dashboard > SQL Editor and run this ENTIRE SQL block:

```sql
-- Fix RLS Policies for Analytics Tables
-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations on user_analytics" ON user_analytics;
DROP POLICY IF EXISTS "Allow all operations on product_analytics" ON product_analytics;
DROP POLICY IF EXISTS "Allow all operations on search_analytics" ON search_analytics;
DROP POLICY IF EXISTS "Allow all operations on page_analytics" ON page_analytics;

-- Disable RLS temporarily for testing
ALTER TABLE user_analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE search_analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE page_analytics DISABLE ROW LEVEL SECURITY;

-- Grant all permissions
GRANT ALL ON user_analytics TO anon, authenticated;
GRANT ALL ON product_analytics TO anon, authenticated;
GRANT ALL ON search_analytics TO anon, authenticated;
GRANT ALL ON page_analytics TO anon, authenticated;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Drop and recreate functions with correct action types
DROP FUNCTION IF EXISTS get_product_analytics_summary(DATE, DATE);

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

### Step 2: Test Direct Insert

Open the test file at `/src/test-analytics.html` in your browser and click the test button. This will directly test if data can be inserted into the analytics tables.

### Step 3: Check Browser Console

1. Open your app (http://localhost:5174)
2. Open Developer Tools (F12)
3. Go to Console tab
4. Click on a product card
5. Look for these console messages:
   - "Tracking product analytics:"
   - "Got IP from ipify:"
   - Any error messages

### Step 4: Verify in Supabase Table Editor

1. Go to Supabase Dashboard
2. Navigate to Table Editor
3. Check these tables:
   - `product_analytics` - Should have records with action_type: 'card_click', 'view_details', 'dm_click'
   - `user_analytics` - Should have visitor records
   - `search_analytics` - Should have search records

### Step 5: Manual Test Query

Run this in Supabase SQL Editor to check if data exists:

```sql
-- Check if any analytics data exists
SELECT 'product_analytics' as table_name, COUNT(*) as count FROM product_analytics
UNION ALL
SELECT 'user_analytics', COUNT(*) FROM user_analytics
UNION ALL
SELECT 'search_analytics', COUNT(*) FROM search_analytics
UNION ALL
SELECT 'page_analytics', COUNT(*) FROM page_analytics;

-- Check recent product analytics
SELECT * FROM product_analytics
ORDER BY created_at DESC
LIMIT 10;

-- Test the function directly
SELECT * FROM get_product_analytics_summary(
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE
);
```

### Step 6: Clear Browser Cache

Sometimes cached JavaScript prevents updates from working:
1. Open Developer Tools
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Step 7: Check Network Tab

1. Open Developer Tools > Network tab
2. Click on a product
3. Look for requests to Supabase
4. Check if they return success (200) or error (4xx/5xx)

## Common Issues and Solutions

### Issue: IP Address fetching fails
**Solution**: The code now falls back to '127.0.0.1' if IP fetching fails

### Issue: RLS policies blocking inserts
**Solution**: We've disabled RLS temporarily for testing

### Issue: Functions returning empty data
**Solution**: The functions have been updated to handle the new action types

### Issue: Old action types in database
**Solution**: Clear old data:
```sql
DELETE FROM product_analytics WHERE action_type IN ('view', 'click');
```

## Still Not Working?

If analytics are still showing zero:

1. **Check Supabase Logs**
   - Go to Supabase Dashboard > Logs > Postgres Logs
   - Look for any errors related to analytics tables

2. **Enable Verbose Logging**
   - The code now includes console.log statements
   - Check browser console for all tracking attempts

3. **Test with Simple Insert**
   - Use the test HTML file to verify basic insert works
   - If test file works but app doesn't, issue is in the app code
   - If test file doesn't work, issue is in database/permissions

4. **Verify Product IDs**
   - Make sure products in your database have valid IDs
   - Run: `SELECT id, name FROM products LIMIT 10;`

Report any error messages you see in the console or Supabase logs!