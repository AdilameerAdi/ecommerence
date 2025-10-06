-- ANALYTICS FIX - RUN THIS ENTIRE BLOCK IN SUPABASE SQL EDITOR

-- 1. Drop ALL existing functions (with all possible parameter combinations to avoid errors)
DROP FUNCTION IF EXISTS get_product_analytics_summary();
DROP FUNCTION IF EXISTS get_product_analytics_summary(DATE);
DROP FUNCTION IF EXISTS get_product_analytics_summary(DATE, DATE);
DROP FUNCTION IF EXISTS get_product_analytics_summary(TIMESTAMP, DATE);
DROP FUNCTION IF EXISTS get_product_analytics_summary(TIMESTAMP WITHOUT TIME ZONE, DATE);

DROP FUNCTION IF EXISTS get_unique_visitors();
DROP FUNCTION IF EXISTS get_unique_visitors(DATE);
DROP FUNCTION IF EXISTS get_unique_visitors(DATE, DATE);

DROP FUNCTION IF EXISTS get_search_analytics_summary();
DROP FUNCTION IF EXISTS get_search_analytics_summary(DATE);
DROP FUNCTION IF EXISTS get_search_analytics_summary(DATE, DATE);

DROP FUNCTION IF EXISTS get_daily_analytics_overview();
DROP FUNCTION IF EXISTS get_daily_analytics_overview(DATE);

DROP FUNCTION IF EXISTS get_analytics_totals();
DROP FUNCTION IF EXISTS get_analytics_totals(DATE);
DROP FUNCTION IF EXISTS get_analytics_totals(DATE, DATE);
DROP FUNCTION IF EXISTS get_analytics_totals(TIMESTAMP WITHOUT TIME ZONE, DATE);

-- 2. Disable RLS
ALTER TABLE user_analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE search_analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE page_analytics DISABLE ROW LEVEL SECURITY;

-- 3. Grant permissions
GRANT ALL ON user_analytics TO anon, authenticated;
GRANT ALL ON product_analytics TO anon, authenticated;
GRANT ALL ON search_analytics TO anon, authenticated;
GRANT ALL ON page_analytics TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 4. Create functions with EXPLICIT casting
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
        p.id::INTEGER as product_id,
        p.name::TEXT as product_name,
        COUNT(CASE WHEN pa.action_type IN ('card_click', 'view') THEN 1 END)::BIGINT as total_views,
        COUNT(CASE WHEN pa.action_type IN ('view_details', 'click') THEN 1 END)::BIGINT as total_clicks,
        COUNT(CASE WHEN pa.action_type = 'dm_click' THEN 1 END)::BIGINT as total_dm_clicks,
        COUNT(CASE WHEN pa.action_type = 'modal_open' THEN 1 END)::BIGINT as total_modal_opens
    FROM products p
    LEFT JOIN product_analytics pa ON p.id = pa.product_id
        AND (start_date IS NULL OR pa.action_timestamp::DATE >= start_date)
        AND (end_date IS NULL OR pa.action_timestamp::DATE <= end_date)
    GROUP BY p.id, p.name
    ORDER BY COUNT(CASE WHEN pa.action_type IN ('card_click', 'view') THEN 1 END) DESC;
END;
$$ LANGUAGE plpgsql;

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
        ua.visit_date::DATE,
        COUNT(DISTINCT ua.ip_address)::BIGINT as unique_visitors
    FROM user_analytics ua
    WHERE ua.visit_date >= start_date::DATE AND ua.visit_date <= end_date::DATE
    GROUP BY ua.visit_date
    ORDER BY ua.visit_date;
END;
$$ LANGUAGE plpgsql;

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
        sa.search_query::TEXT,
        COUNT(*)::BIGINT as search_count,
        AVG(sa.results_count)::NUMERIC as avg_results_count,
        MAX(sa.search_timestamp) as last_searched
    FROM search_analytics sa
    WHERE (start_date IS NULL OR sa.search_timestamp::DATE >= start_date)
      AND (end_date IS NULL OR sa.search_timestamp::DATE <= end_date)
    GROUP BY sa.search_query
    ORDER BY COUNT(*) DESC;
END;
$$ LANGUAGE plpgsql;

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
        (SELECT COUNT(*)::BIGINT FROM page_analytics WHERE page_timestamp::DATE = target_date::DATE),
        (SELECT COUNT(DISTINCT ip_address)::BIGINT FROM user_analytics WHERE visit_date = target_date::DATE),
        (SELECT COUNT(*)::BIGINT FROM search_analytics WHERE search_timestamp::DATE = target_date::DATE),
        (SELECT COUNT(*)::BIGINT FROM product_analytics WHERE action_type IN ('card_click', 'view') AND action_timestamp::DATE = target_date::DATE),
        (SELECT COUNT(*)::BIGINT FROM product_analytics WHERE action_type = 'dm_click' AND action_timestamp::DATE = target_date::DATE);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_analytics_totals(
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    total_product_views BIGINT,
    total_dm_clicks BIGINT,
    total_searches BIGINT,
    unique_visitors BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*)::BIGINT FROM product_analytics
         WHERE action_type IN ('card_click', 'view', 'view_details', 'click')
         AND (start_date IS NULL OR action_timestamp::DATE >= start_date::DATE)
         AND (end_date IS NULL OR action_timestamp::DATE <= end_date::DATE)),

        (SELECT COUNT(*)::BIGINT FROM product_analytics
         WHERE action_type = 'dm_click'
         AND (start_date IS NULL OR action_timestamp::DATE >= start_date::DATE)
         AND (end_date IS NULL OR action_timestamp::DATE <= end_date::DATE)),

        (SELECT COUNT(*)::BIGINT FROM search_analytics
         WHERE (start_date IS NULL OR search_timestamp::DATE >= start_date::DATE)
         AND (end_date IS NULL OR search_timestamp::DATE <= end_date::DATE)),

        (SELECT COUNT(DISTINCT ip_address)::BIGINT FROM user_analytics
         WHERE (start_date IS NULL OR visit_date >= start_date::DATE)
         AND (end_date IS NULL OR visit_date <= end_date::DATE));
END;
$$ LANGUAGE plpgsql;

-- 5. Test queries (with EXPLICIT date casting)
SELECT * FROM get_analytics_totals(
    (CURRENT_DATE - 30)::DATE,
    CURRENT_DATE::DATE
);

SELECT * FROM get_product_analytics_summary(
    (CURRENT_DATE - 30)::DATE,
    CURRENT_DATE::DATE
) LIMIT 5;