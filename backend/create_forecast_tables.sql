-- =====================================================
-- Create Forecast Data Storage Tables
-- =====================================================

-- 1. Create forecast_data table to store daily forecasts
CREATE TABLE IF NOT EXISTS forecast_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    forecast_date DATE NOT NULL,
    forecast_period VARCHAR(10) NOT NULL DEFAULT '30d',
    category_filter VARCHAR(100),
    overall_accuracy DECIMAL(5,2),
    total_items_forecasted INTEGER,
    ai_model_version VARCHAR(100) DEFAULT 'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, forecast_date, forecast_period, category_filter)
);

-- 2. Create forecast_items table to store individual item forecasts
CREATE TABLE IF NOT EXISTS forecast_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forecast_id UUID REFERENCES forecast_data(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    item_category VARCHAR(100),
    current_stock INTEGER,
    predicted_demand INTEGER NOT NULL,
    confidence_score INTEGER,
    risk_level VARCHAR(20) DEFAULT 'low',
    recommendation TEXT,
    trend VARCHAR(20) DEFAULT 'stable',
    difference INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create forecast_insights table to store AI insights
CREATE TABLE IF NOT EXISTS forecast_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forecast_id UUID REFERENCES forecast_data(id) ON DELETE CASCADE,
    insight_type VARCHAR(100) NOT NULL,
    title VARCHAR(255),
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    category VARCHAR(100),
    action_required BOOLEAN DEFAULT false,
    action_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create forecast_charts table to store chart data
CREATE TABLE IF NOT EXISTS forecast_charts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forecast_id UUID REFERENCES forecast_data(id) ON DELETE CASCADE,
    chart_type VARCHAR(50) NOT NULL,
    chart_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forecast_data_org_date ON forecast_data(organization_id, forecast_date);
CREATE INDEX IF NOT EXISTS idx_forecast_data_period ON forecast_data(forecast_period);
CREATE INDEX IF NOT EXISTS idx_forecast_items_forecast_id ON forecast_items(forecast_id);
CREATE INDEX IF NOT EXISTS idx_forecast_insights_forecast_id ON forecast_insights(forecast_id);
CREATE INDEX IF NOT EXISTS idx_forecast_charts_forecast_id ON forecast_charts(forecast_id);

-- 6. Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Create triggers for updated_at
CREATE TRIGGER update_forecast_data_updated_at 
    BEFORE UPDATE ON forecast_data 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Add RLS (Row Level Security) policies
ALTER TABLE forecast_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_charts ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies
CREATE POLICY "Users can view their organization's forecast data" ON forecast_data
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can insert their organization's forecast data" ON forecast_data
    FOR INSERT WITH CHECK (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can view their organization's forecast items" ON forecast_items
    FOR SELECT USING (forecast_id IN (
        SELECT id FROM forecast_data WHERE organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Users can insert their organization's forecast items" ON forecast_items
    FOR INSERT WITH CHECK (forecast_id IN (
        SELECT id FROM forecast_data WHERE organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Users can view their organization's forecast insights" ON forecast_insights
    FOR SELECT USING (forecast_id IN (
        SELECT id FROM forecast_data WHERE organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Users can insert their organization's forecast insights" ON forecast_insights
    FOR INSERT WITH CHECK (forecast_id IN (
        SELECT id FROM forecast_data WHERE organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Users can view their organization's forecast charts" ON forecast_charts
    FOR SELECT USING (forecast_id IN (
        SELECT id FROM forecast_data WHERE organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Users can insert their organization's forecast charts" ON forecast_charts
    FOR INSERT WITH CHECK (forecast_id IN (
        SELECT id FROM forecast_data WHERE organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    )); 