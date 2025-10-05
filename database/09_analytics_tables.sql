-- Analytics Tables for Admin Dashboard
-- This file creates tables to track user behavior, product interactions, and search analytics

-- User Analytics Table - Track unique visitors by IP and session
CREATE TABLE IF NOT EXISTS user_analytics (
    id SERIAL PRIMARY KEY,
    ip_address INET NOT NULL,
    user_agent TEXT,
    session_id VARCHAR(255),
    page_views INTEGER DEFAULT 1,
    first_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    visit_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Analytics Table - Track product interactions
CREATE TABLE IF NOT EXISTS product_analytics (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    ip_address INET NOT NULL,
    session_id VARCHAR(255),
    action_type VARCHAR(50) NOT NULL, -- 'card_click', 'view_details', 'dm_click', 'modal_open'
    action_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search Analytics Table - Track search queries and results
CREATE TABLE IF NOT EXISTS search_analytics (
    id SERIAL PRIMARY KEY,
    search_query TEXT NOT NULL,
    ip_address INET NOT NULL,
    session_id VARCHAR(255),
    results_count INTEGER DEFAULT 0,
    search_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_agent TEXT,
    search_source VARCHAR(50) DEFAULT 'navbar', -- 'navbar', 'filter', 'page_search'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Page Analytics Table - Track page views and navigation
CREATE TABLE IF NOT EXISTS page_analytics (
    id SERIAL PRIMARY KEY,
    page_path VARCHAR(255) NOT NULL,
    page_title VARCHAR(255),
    ip_address INET NOT NULL,
    session_id VARCHAR(255),
    visit_duration INTEGER DEFAULT 0, -- in seconds
    page_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_analytics_ip_date ON user_analytics(ip_address, visit_date);
CREATE INDEX IF NOT EXISTS idx_user_analytics_date ON user_analytics(visit_date);
CREATE INDEX IF NOT EXISTS idx_product_analytics_product_id ON product_analytics(product_id);
CREATE INDEX IF NOT EXISTS idx_product_analytics_action_type ON product_analytics(action_type);
CREATE INDEX IF NOT EXISTS idx_product_analytics_timestamp ON product_analytics(action_timestamp);
CREATE INDEX IF NOT EXISTS idx_search_analytics_query ON search_analytics(search_query);
CREATE INDEX IF NOT EXISTS idx_search_analytics_timestamp ON search_analytics(search_timestamp);
CREATE INDEX IF NOT EXISTS idx_page_analytics_path ON page_analytics(page_path);
CREATE INDEX IF NOT EXISTS idx_page_analytics_timestamp ON page_analytics(page_timestamp);

-- Function to get unique visitors by time period
CREATE OR REPLACE FUNCTION get_unique_visitors(
    start_date DATE,
    end_date DATE
)
RETURNS TABLE (
    visit_date DATE,
    unique_visitors BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ua.visit_date,
        COUNT(DISTINCT ua.ip_address) as unique_visitors
    FROM user_analytics ua
    WHERE ua.visit_date BETWEEN start_date AND end_date
    GROUP BY ua.visit_date
    ORDER BY ua.visit_date;
END;
$$ LANGUAGE plpgsql;

-- Function to get product analytics summary
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

-- Function to get search analytics summary
CREATE OR REPLACE FUNCTION get_search_analytics_summary(
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    search_query TEXT,
    search_count BIGINT,
    avg_results_count NUMERIC,
    last_searched TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sa.search_query,
        COUNT(*) as search_count,
        AVG(sa.results_count) as avg_results_count,
        MAX(sa.search_timestamp) as last_searched
    FROM search_analytics sa
    WHERE (start_date IS NULL OR sa.search_timestamp::DATE >= start_date)
      AND (end_date IS NULL OR sa.search_timestamp::DATE <= end_date)
    GROUP BY sa.search_query
    ORDER BY search_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get daily analytics overview
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

-- Enable Row Level Security
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics tables (allow all operations for now, can be restricted later)
CREATE POLICY "Allow all operations on user_analytics" ON user_analytics FOR ALL USING (true);
CREATE POLICY "Allow all operations on product_analytics" ON product_analytics FOR ALL USING (true);
CREATE POLICY "Allow all operations on search_analytics" ON search_analytics FOR ALL USING (true);
CREATE POLICY "Allow all operations on page_analytics" ON page_analytics FOR ALL USING (true);
