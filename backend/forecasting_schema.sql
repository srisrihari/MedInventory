-- =====================================================
-- Enhanced Forecasting Database Schema
-- =====================================================
-- This schema supports daily forecasting, saved predictions, and historical accuracy

-- 1. Create forecast_sessions table to track daily forecast runs
CREATE TABLE IF NOT EXISTS forecast_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    forecast_date DATE NOT NULL,
    forecast_period VARCHAR(10) NOT NULL DEFAULT '30d', -- 7d, 30d, 90d, 6m, 1y
    category_filter VARCHAR(100), -- NULL for all categories
    start_date DATE,
    end_date DATE,
    ai_model VARCHAR(100) DEFAULT 'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8',
    overall_accuracy DECIMAL(5,2),
    total_items_forecasted INTEGER,
    status VARCHAR(20) DEFAULT 'completed', -- pending, processing, completed, failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, forecast_date, forecast_period, category_filter)
);

-- 2. Create forecast_predictions table to store individual item predictions
CREATE TABLE IF NOT EXISTS forecast_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forecast_session_id UUID NOT NULL REFERENCES forecast_sessions(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
    item_name VARCHAR(255) NOT NULL,
    item_category VARCHAR(100),
    current_stock INTEGER NOT NULL,
    predicted_demand INTEGER NOT NULL,
    confidence_score DECIMAL(5,2) NOT NULL,
    risk_level VARCHAR(20) NOT NULL, -- low, medium, high, critical
    recommendation TEXT,
    trend VARCHAR(20), -- increasing, decreasing, stable
    difference INTEGER, -- predicted_demand - current_stock
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create forecast_insights table to store AI-generated insights
CREATE TABLE IF NOT EXISTS forecast_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forecast_session_id UUID NOT NULL REFERENCES forecast_sessions(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL, -- Stock Alert, Seasonal Trend, Market Trend, Price Forecast
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL, -- low, medium, high, critical
    category VARCHAR(50), -- Stock Alert, Seasonal Trend, etc.
    action_required BOOLEAN DEFAULT false,
    action_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create forecast_accuracy_history table to track historical accuracy
CREATE TABLE IF NOT EXISTS forecast_accuracy_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    forecast_date DATE NOT NULL,
    actual_date DATE NOT NULL,
    item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
    item_name VARCHAR(255) NOT NULL,
    predicted_demand INTEGER NOT NULL,
    actual_demand INTEGER NOT NULL,
    accuracy_percentage DECIMAL(5,2),
    variance INTEGER, -- actual_demand - predicted_demand
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create forecast_charts_data table to store chart data for UI
CREATE TABLE IF NOT EXISTS forecast_charts_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forecast_session_id UUID NOT NULL REFERENCES forecast_sessions(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    chart_type VARCHAR(50) NOT NULL, -- demand_overview, accuracy_trend, seasonal_pattern
    period_label VARCHAR(20) NOT NULL, -- Week 1, Week 2, etc. or Jan, Feb, etc.
    forecasted_value DECIMAL(10,2),
    actual_value DECIMAL(10,2),
    period_order INTEGER NOT NULL, -- for sorting
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forecast_sessions_org_date ON forecast_sessions(organization_id, forecast_date);
CREATE INDEX IF NOT EXISTS idx_forecast_sessions_org_period ON forecast_sessions(organization_id, forecast_period);
CREATE INDEX IF NOT EXISTS idx_forecast_predictions_session ON forecast_predictions(forecast_session_id);
CREATE INDEX IF NOT EXISTS idx_forecast_predictions_org ON forecast_predictions(organization_id);
CREATE INDEX IF NOT EXISTS idx_forecast_insights_session ON forecast_insights(forecast_session_id);
CREATE INDEX IF NOT EXISTS idx_forecast_insights_priority ON forecast_insights(priority);
CREATE INDEX IF NOT EXISTS idx_forecast_accuracy_org_date ON forecast_accuracy_history(organization_id, forecast_date);
CREATE INDEX IF NOT EXISTS idx_forecast_charts_session ON forecast_charts_data(forecast_session_id);

-- 7. Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_forecast_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_forecast_sessions_updated_at 
    BEFORE UPDATE ON forecast_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_forecast_updated_at();

-- 8. Create view for daily forecast summary
CREATE OR REPLACE VIEW daily_forecast_summary AS
SELECT 
    fs.organization_id,
    fs.forecast_date,
    fs.forecast_period,
    fs.overall_accuracy,
    fs.total_items_forecasted,
    COUNT(fp.id) as total_predictions,
    COUNT(CASE WHEN fp.risk_level IN ('high', 'critical') THEN 1 END) as high_risk_items,
    COUNT(CASE WHEN fi.priority IN ('high', 'critical') THEN 1 END) as critical_insights,
    fs.created_at
FROM forecast_sessions fs
LEFT JOIN forecast_predictions fp ON fs.id = fp.forecast_session_id
LEFT JOIN forecast_insights fi ON fs.id = fi.forecast_session_id
GROUP BY fs.id, fs.organization_id, fs.forecast_date, fs.forecast_period, fs.overall_accuracy, fs.total_items_forecasted, fs.created_at;

-- 9. Create view for stock alerts
CREATE OR REPLACE VIEW stock_alerts AS
SELECT 
    fp.organization_id,
    fp.item_name,
    fp.item_category,
    fp.current_stock,
    fp.predicted_demand,
    fp.difference,
    fp.risk_level,
    fp.recommendation,
    fp.confidence_score,
    fs.forecast_date,
    CASE 
        WHEN fp.difference < 0 AND fp.risk_level IN ('high', 'critical') THEN 'Immediate Action Required'
        WHEN fp.difference < 0 THEN 'Stock Insufficient'
        WHEN fp.current_stock <= 0 THEN 'Out of Stock'
        ELSE 'Monitor'
    END as alert_type
FROM forecast_predictions fp
JOIN forecast_sessions fs ON fp.forecast_session_id = fs.id
WHERE fp.difference < 0 OR fp.risk_level IN ('high', 'critical')
ORDER BY fp.risk_level DESC, ABS(fp.difference) DESC;

-- 10. Insert sample data for testing
INSERT INTO forecast_sessions (
    id, organization_id, created_by, forecast_date, forecast_period, 
    overall_accuracy, total_items_forecasted, status
) VALUES (
    '550e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440001',
    CURRENT_DATE,
    '30d',
    87.5,
    50,
    'completed'
) ON CONFLICT (organization_id, forecast_date, forecast_period, category_filter) DO NOTHING; 