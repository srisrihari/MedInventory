-- MedInventory Database Schema
-- Run this script in your Supabase SQL editor to create all necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================
-- INVENTORY MANAGEMENT TABLES
-- ========================

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    address TEXT,
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    response_time_hours INTEGER DEFAULT 48,
    delivery_performance VARCHAR(50) DEFAULT 'good',
    price_competitiveness VARCHAR(50) DEFAULT 'medium',
    on_time_delivery_rate DECIMAL(5,2) DEFAULT 0 CHECK (on_time_delivery_rate >= 0 AND on_time_delivery_rate <= 100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'under_review')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory items table
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    unit VARCHAR(50) NOT NULL,
    batch_number VARCHAR(100),
    batch_id VARCHAR(50),
    expiry_date DATE,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    price DECIMAL(10,2) CHECK (price >= 0),
    location VARCHAR(200),
    reorder_level INTEGER DEFAULT 0 CHECK (reorder_level >= 0),
    status VARCHAR(20) DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory transactions table
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('add', 'subtract', 'adjust')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    reference_type VARCHAR(50), -- 'purchase', 'usage', 'adjustment', 'waste', etc.
    reference_id VARCHAR(100),
    notes TEXT,
    performed_by UUID, -- user_id for future use
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- BIDDING SYSTEM TABLES
-- ========================

-- Bid requests table
CREATE TABLE IF NOT EXISTS bid_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    items JSONB NOT NULL, -- Array of items with specifications
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    estimated_value DECIMAL(12,2) CHECK (estimated_value >= 0),
    deadline DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'awarded')),
    created_by UUID, -- user_id for future use
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bids table
CREATE TABLE IF NOT EXISTS bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES bid_requests(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount > 0),
    delivery_time_days INTEGER CHECK (delivery_time_days > 0),
    valid_until DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    notes TEXT,
    ai_score DECIMAL(5,2) DEFAULT 0, -- AI evaluation score
    ai_recommendation TEXT,
    submitted_via VARCHAR(20) DEFAULT 'email' CHECK (submitted_via IN ('email', 'whatsapp', 'manual', 'api')),
    raw_communication TEXT, -- Original email/message content
    decision_notes TEXT,
    parsed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- EQUIPMENT MANAGEMENT TABLES
-- ========================

-- Equipment table
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    type VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100) UNIQUE,
    install_date DATE,
    warranty_expiry DATE,
    status VARCHAR(20) DEFAULT 'operational' CHECK (status IN ('operational', 'maintenance', 'critical', 'offline')),
    health_score INTEGER DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
    utilization_rate DECIMAL(5,2) DEFAULT 0 CHECK (utilization_rate >= 0 AND utilization_rate <= 100),
    last_maintenance DATE,
    next_maintenance DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment sensors table
CREATE TABLE IF NOT EXISTS equipment_sensors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    sensor_type VARCHAR(50) NOT NULL, -- 'temperature', 'vibration', 'power', 'pressure'
    current_value DECIMAL(10,3),
    unit VARCHAR(20),
    normal_min DECIMAL(10,3),
    normal_max DECIMAL(10,3),
    warning_min DECIMAL(10,3),
    warning_max DECIMAL(10,3),
    critical_min DECIMAL(10,3),
    critical_max DECIMAL(10,3),
    last_reading TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'normal' CHECK (status IN ('normal', 'warning', 'critical')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance tasks table
CREATE TABLE IF NOT EXISTS maintenance_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    task_type VARCHAR(20) CHECK (task_type IN ('preventive', 'corrective', 'emergency')),
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    assigned_to UUID, -- user_id for future use
    scheduled_date DATE,
    estimated_duration_hours INTEGER CHECK (estimated_duration_hours > 0),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'overdue')),
    completed_date DATE,
    actual_duration_hours INTEGER,
    notes TEXT,
    cost DECIMAL(10,2) CHECK (cost >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI predictions table
CREATE TABLE IF NOT EXISTS ai_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    prediction_type VARCHAR(50) NOT NULL, -- 'failure', 'maintenance', 'performance'
    risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    predicted_date DATE,
    confidence_score DECIMAL(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
    recommendation TEXT,
    ai_insight TEXT,
    model_version VARCHAR(50),
    input_features JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- AI AGENT LOGGING TABLE
-- ========================

-- AI agent logs table
CREATE TABLE IF NOT EXISTS ai_agent_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_type VARCHAR(50) NOT NULL, -- 'email', 'whatsapp', 'decision', 'parser'
    action VARCHAR(100) NOT NULL,
    reference_type VARCHAR(50), -- 'bid_request', 'bid', 'supplier', 'inventory_item'
    reference_id UUID,
    input_data JSONB,
    output_data JSONB,
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'error', 'processing')),
    error_message TEXT,
    execution_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- INDEXES FOR PERFORMANCE
-- ========================

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_inventory_items_supplier ON inventory_items(supplier_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_expiry ON inventory_items(expiry_date);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item ON inventory_transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_date ON inventory_transactions(created_at);

-- Bidding indexes
CREATE INDEX IF NOT EXISTS idx_bid_requests_status ON bid_requests(status);
CREATE INDEX IF NOT EXISTS idx_bid_requests_category ON bid_requests(category);
CREATE INDEX IF NOT EXISTS idx_bid_requests_deadline ON bid_requests(deadline);
CREATE INDEX IF NOT EXISTS idx_bids_request ON bids(request_id);
CREATE INDEX IF NOT EXISTS idx_bids_supplier ON bids(supplier_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);

-- Equipment indexes
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_type ON equipment(type);
CREATE INDEX IF NOT EXISTS idx_equipment_next_maintenance ON equipment(next_maintenance);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_equipment ON maintenance_tasks(equipment_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_status ON maintenance_tasks(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_scheduled ON maintenance_tasks(scheduled_date);

-- AI logs indexes
CREATE INDEX IF NOT EXISTS idx_ai_logs_agent_type ON ai_agent_logs(agent_type);
CREATE INDEX IF NOT EXISTS idx_ai_logs_reference ON ai_agent_logs(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created ON ai_agent_logs(created_at);

-- ========================
-- SAMPLE DATA INSERTION
-- ========================

-- Insert sample suppliers
INSERT INTO suppliers (name, email, phone, whatsapp, rating, response_time_hours, delivery_performance, price_competitiveness, on_time_delivery_rate, status) VALUES
('MediTech Pharmaceuticals', 'orders@meditech.com', '+91-9876543210', '+91-9876543210', 4.8, 24, 'excellent', 'high', 98.5, 'active'),
('Global Health Supplies', 'procurement@globalhealth.com', '+91-9876543211', '+91-9876543211', 4.5, 48, 'good', 'medium', 92.7, 'active'),
('PharmaPlus Inc.', 'sales@pharmaplus.com', '+91-9876543212', '+91-9876543212', 4.2, 36, 'good', 'medium', 90.2, 'active'),
('Healthcare Products Co.', 'orders@healthcareproducts.com', '+91-9876543213', '+91-9876543213', 4.7, 24, 'excellent', 'high', 97.8, 'active'),
('MedEquip Solutions', 'support@medequip.com', '+91-9876543214', '+91-9876543214', 3.9, 72, 'average', 'low', 85.4, 'under_review');

-- Insert sample inventory items
INSERT INTO inventory_items (name, category, quantity, unit, batch_number, batch_id, expiry_date, supplier_id, price, location, reorder_level, status) VALUES
('Paracetamol 500mg', 'Pain Relief', 2500, 'Tablets', 'BATCH-123', 'B123', '2024-12-15', (SELECT id FROM suppliers WHERE name = 'MediTech Pharmaceuticals' LIMIT 1), 0.15, 'Warehouse A, Shelf 3', 500, 'in_stock'),
('Amoxicillin 250mg', 'Antibiotics', 1800, 'Capsules', 'BATCH-456', 'B456', '2024-01-10', (SELECT id FROM suppliers WHERE name = 'Global Health Supplies' LIMIT 1), 0.28, 'Warehouse A, Shelf 5', 2000, 'low_stock'),
('Insulin Glargine', 'Diabetes', 500, 'Vials', 'BATCH-789', 'B789', '2023-12-28', (SELECT id FROM suppliers WHERE name = 'PharmaPlus Inc.' LIMIT 1), 35.99, 'Cold Storage, Section 2', 100, 'in_stock'),
('Vitamin B Complex', 'Supplements', 1200, 'Tablets', 'BATCH-012', 'B012', '2023-12-08', (SELECT id FROM suppliers WHERE name = 'Healthcare Products Co.' LIMIT 1), 0.10, 'Warehouse B, Shelf 1', 300, 'in_stock'),
('Ibuprofen 400mg', 'Pain Relief', 150, 'Tablets', 'BATCH-678', 'B678', '2024-03-20', (SELECT id FROM suppliers WHERE name = 'Global Health Supplies' LIMIT 1), 0.18, 'Warehouse A, Shelf 3', 300, 'low_stock');

-- Insert sample equipment
INSERT INTO equipment (name, type, location, manufacturer, model, serial_number, install_date, status, health_score, utilization_rate, last_maintenance, next_maintenance) VALUES
('MRI Scanner Alpha', 'Diagnostic Imaging', 'Radiology - Room 101', 'Siemens', 'MAGNETOM Vida 3T', 'SMN-2023-001', '2023-03-15', 'operational', 87, 78, '2024-01-10', '2024-04-10'),
('CT Scanner Beta', 'Diagnostic Imaging', 'Radiology - Room 102', 'GE Healthcare', 'Revolution CT', 'GE-2023-002', '2023-05-20', 'maintenance', 65, 0, '2024-01-15', '2024-03-15'),
('Ventilator Unit-A1', 'Life Support', 'ICU - Bay 3', 'Philips', 'Respironics V680', 'PH-2023-003', '2023-01-10', 'operational', 92, 95, '2024-01-20', '2024-02-20'),
('X-Ray Machine Gamma', 'Diagnostic Imaging', 'Emergency - Room 205', 'Canon', 'CXDI-820C', 'CN-2023-004', '2023-06-12', 'critical', 45, 25, '2023-12-15', '2024-03-15');

-- Insert sample maintenance tasks
INSERT INTO maintenance_tasks (equipment_id, task_type, priority, title, description, scheduled_date, estimated_duration_hours, status) VALUES
((SELECT id FROM equipment WHERE name = 'CT Scanner Beta' LIMIT 1), 'corrective', 'high', 'Replace cooling fan', 'Replace cooling fan and calibrate temperature sensors', '2024-02-08', 4, 'in_progress'),
((SELECT id FROM equipment WHERE name = 'X-Ray Machine Gamma' LIMIT 1), 'emergency', 'critical', 'Critical overheating issue', 'Critical overheating issue - immediate attention required', '2024-02-06', 6, 'scheduled'),
((SELECT id FROM equipment WHERE name = 'Ventilator Unit-A1' LIMIT 1), 'preventive', 'medium', 'Routine maintenance', 'Routine filter replacement and performance check', '2024-02-20', 2, 'scheduled');

-- Insert sample AI predictions
INSERT INTO ai_predictions (equipment_id, prediction_type, risk_level, predicted_date, confidence_score, recommendation, ai_insight, model_version, is_active) VALUES
((SELECT id FROM equipment WHERE name = 'X-Ray Machine Gamma' LIMIT 1), 'Component Failure', 'critical', '2024-02-15', 94, 'Replace power supply unit immediately', 'Temperature and vibration patterns indicate imminent power supply failure. Historical data shows 94% accuracy for this prediction type.', 'v1.0', true),
((SELECT id FROM equipment WHERE name = 'MRI Scanner Alpha' LIMIT 1), 'Performance Degradation', 'medium', '2024-03-20', 76, 'Schedule gradient coil maintenance', 'Gradual decline in magnetic field uniformity detected. Preventive maintenance recommended within 6 weeks.', 'v1.0', true);

-- ========================
-- TRIGGERS FOR UPDATED_AT
-- ========================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 
CREATE TRIGGER update_bid_requests_updated_at BEFORE UPDATE ON bid_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON bids FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_tasks_updated_at BEFORE UPDATE ON maintenance_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'MedInventory database schema created successfully!' as status;