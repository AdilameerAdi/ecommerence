-- Fix RLS policies for analytics tables to allow inserts and selects

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