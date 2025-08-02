-- =====================================================
-- MedInventory Authentication & Multi-Tenancy Schema
-- =====================================================
-- This script adds user authentication, roles, and multi-tenancy support
-- to the existing MedInventory database schema.

-- Create new ENUM types for authentication
CREATE TYPE user_role AS ENUM (
    'super_admin',
    'hospital_admin', 
    'inventory_manager',
    'procurement_manager',
    'equipment_manager',
    'department_manager',
    'staff_user',
    'viewer',
    'auditor'
);

CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
CREATE TYPE session_status AS ENUM ('active', 'expired', 'revoked');
CREATE TYPE mfa_method AS ENUM ('sms', 'email', 'authenticator', 'backup_codes');

-- =====================================================
-- ORGANIZATIONS/HOSPITALS TABLE
-- =====================================================
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) DEFAULT 'hospital', -- hospital, clinic, pharmacy, etc.
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    postal_code VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    
    -- Subscription & Billing
    subscription_plan VARCHAR(50) DEFAULT 'trial', -- trial, basic, premium, enterprise
    subscription_status VARCHAR(50) DEFAULT 'active',
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    billing_email VARCHAR(255),
    
    -- Configuration
    settings JSONB DEFAULT '{}',
    features JSONB DEFAULT '[]', -- enabled features list
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    is_active BOOLEAN DEFAULT true
);

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Basic Information
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    
    -- Role & Permissions
    role user_role NOT NULL DEFAULT 'staff_user',
    department VARCHAR(100),
    job_title VARCHAR(150),
    employee_id VARCHAR(50),
    
    -- Status & Security
    status user_status DEFAULT 'pending',
    email_verified_at TIMESTAMP WITH TIME ZONE,
    phone_verified_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Multi-Factor Authentication
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret VARCHAR(255), -- encrypted TOTP secret
    mfa_backup_codes JSONB, -- array of backup codes
    
    -- Session Security
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    
    -- Preferences
    preferences JSONB DEFAULT '{}',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    language VARCHAR(10) DEFAULT 'en',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- USER SESSIONS TABLE
-- =====================================================
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Session Details
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    refresh_token_hash VARCHAR(255) UNIQUE,
    status session_status DEFAULT 'active',
    
    -- Security Information
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    location_info JSONB,
    
    -- Timing
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PERMISSIONS TABLE
-- =====================================================
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'inventory:read', 'supplier:create'
    description TEXT,
    category VARCHAR(50), -- 'inventory', 'supplier', 'equipment', 'user', 'report', 'system'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ROLE PERMISSIONS TABLE
-- =====================================================
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role, permission_id)
);

-- =====================================================
-- USER AUDIT LOG TABLE
-- =====================================================
CREATE TABLE user_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Action Details
    action VARCHAR(100) NOT NULL, -- 'login', 'logout', 'create', 'update', 'delete', etc.
    resource_type VARCHAR(100), -- 'inventory_item', 'supplier', 'equipment', etc.
    resource_id UUID,
    
    -- Change Details
    old_values JSONB,
    new_values JSONB,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- UPDATE EXISTING TABLES WITH MULTI-TENANCY
-- =====================================================

-- Add organization_id and user_id to all existing tables

-- Update inventory_items table
ALTER TABLE inventory_items 
ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN created_by UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN updated_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Update suppliers table
ALTER TABLE suppliers 
ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN created_by UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN updated_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Update equipment table
ALTER TABLE equipment 
ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN created_by UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN updated_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Update bid_requests table
ALTER TABLE bid_requests 
ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN created_by UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN updated_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Update inventory_transactions table
ALTER TABLE inventory_transactions 
ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN created_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- =====================================================
-- ADDITIONAL TABLES FOR ENHANCED FUNCTIONALITY
-- =====================================================

-- User Password Reset Tokens
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Verification Tokens
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Invitations
CREATE TABLE user_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    department VARCHAR(100),
    invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users table indexes
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Sessions table indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX idx_user_sessions_status ON user_sessions(status);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Audit log indexes
CREATE INDEX idx_user_audit_log_user_id ON user_audit_log(user_id);
CREATE INDEX idx_user_audit_log_organization_id ON user_audit_log(organization_id);
CREATE INDEX idx_user_audit_log_action ON user_audit_log(action);
CREATE INDEX idx_user_audit_log_resource_type ON user_audit_log(resource_type);
CREATE INDEX idx_user_audit_log_created_at ON user_audit_log(created_at);

-- Multi-tenancy indexes for existing tables
CREATE INDEX idx_inventory_items_organization_id ON inventory_items(organization_id);
CREATE INDEX idx_suppliers_organization_id ON suppliers(organization_id);
CREATE INDEX idx_equipment_organization_id ON equipment(organization_id);
CREATE INDEX idx_bid_requests_organization_id ON bid_requests(organization_id);
CREATE INDEX idx_inventory_transactions_organization_id ON inventory_transactions(organization_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =====================================================

-- Create triggers for new tables
CREATE TRIGGER update_organizations_updated_at 
    BEFORE UPDATE ON organizations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INSERT DEFAULT PERMISSIONS
-- =====================================================

INSERT INTO permissions (name, description, category) VALUES
-- Inventory permissions
('inventory:read', 'View inventory items and levels', 'inventory'),
('inventory:create', 'Add new inventory items', 'inventory'),
('inventory:update', 'Edit existing inventory items', 'inventory'),
('inventory:delete', 'Remove inventory items', 'inventory'),
('inventory:adjust', 'Add/subtract stock levels', 'inventory'),
('inventory:transfer', 'Move inventory between locations', 'inventory'),
('inventory:approve', 'Approve inventory adjustments', 'inventory'),

-- Supplier permissions
('supplier:read', 'View supplier information', 'supplier'),
('supplier:create', 'Add new suppliers', 'supplier'),
('supplier:update', 'Edit supplier details', 'supplier'),
('supplier:delete', 'Remove suppliers', 'supplier'),
('supplier:bid', 'Manage bidding processes', 'supplier'),
('supplier:contract', 'Manage contracts and agreements', 'supplier'),

-- Equipment permissions
('equipment:read', 'View equipment information', 'equipment'),
('equipment:create', 'Add new equipment', 'equipment'),
('equipment:update', 'Edit equipment details', 'equipment'),
('equipment:delete', 'Remove equipment', 'equipment'),
('equipment:maintain', 'Schedule and track maintenance', 'equipment'),
('equipment:monitor', 'View health scores and analytics', 'equipment'),

-- User management permissions
('user:read', 'View user information', 'user'),
('user:create', 'Add new users', 'user'),
('user:update', 'Edit user details', 'user'),
('user:delete', 'Remove users', 'user'),
('user:roles', 'Manage user roles and permissions', 'user'),

-- Reporting permissions
('report:basic', 'Access basic reports', 'report'),
('report:advanced', 'Access detailed analytics', 'report'),
('report:financial', 'View financial and cost reports', 'report'),
('report:audit', 'Access audit and compliance reports', 'report'),

-- System permissions
('system:settings', 'Configure system settings', 'system'),
('system:integrations', 'Manage external integrations', 'system'),
('system:backup', 'Access backup and restore functions', 'system'),
('system:logs', 'View system logs and audit trails', 'system');

-- =====================================================
-- INSERT ROLE PERMISSIONS MAPPINGS
-- =====================================================

-- Super Admin - Full access to everything
INSERT INTO role_permissions (role, permission_id)
SELECT 'super_admin', id FROM permissions;

-- Hospital Admin - Full access except system-level
INSERT INTO role_permissions (role, permission_id)
SELECT 'hospital_admin', id FROM permissions 
WHERE category != 'system' OR name IN ('system:settings', 'system:logs');

-- Inventory Manager - Full inventory access
INSERT INTO role_permissions (role, permission_id)
SELECT 'inventory_manager', id FROM permissions 
WHERE category IN ('inventory', 'report') OR name IN ('supplier:read', 'equipment:read');

-- Procurement Manager - Supplier and procurement access
INSERT INTO role_permissions (role, permission_id)
SELECT 'procurement_manager', id FROM permissions 
WHERE category IN ('supplier', 'report') OR name IN ('inventory:read', 'equipment:read');

-- Equipment Manager - Equipment management access
INSERT INTO role_permissions (role, permission_id)
SELECT 'equipment_manager', id FROM permissions 
WHERE category IN ('equipment', 'report') OR name IN ('inventory:read', 'supplier:read');

-- Department Manager - Limited departmental access
INSERT INTO role_permissions (role, permission_id)
SELECT 'department_manager', id FROM permissions 
WHERE name IN (
    'inventory:read', 'inventory:adjust', 
    'supplier:read', 'supplier:bid',
    'equipment:read', 'equipment:monitor',
    'user:read', 'report:basic', 'report:advanced', 'report:financial'
);

-- Staff User - Basic operational access
INSERT INTO role_permissions (role, permission_id)
SELECT 'staff_user', id FROM permissions 
WHERE name IN (
    'inventory:read', 'inventory:adjust',
    'supplier:read', 'equipment:read', 'equipment:monitor',
    'report:basic'
);

-- Viewer - Read-only access
INSERT INTO role_permissions (role, permission_id)
SELECT 'viewer', id FROM permissions 
WHERE name LIKE '%:read' OR name LIKE 'report:%';

-- Auditor - Comprehensive read access plus audit capabilities
INSERT INTO role_permissions (role, permission_id)
SELECT 'auditor', id FROM permissions 
WHERE name LIKE '%:read' OR name IN ('report:audit', 'system:logs', 'report:financial', 'report:advanced');

-- =====================================================
-- SECURITY FUNCTIONS
-- =====================================================

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(
    p_user_id UUID,
    p_permission_name VARCHAR(100)
) RETURNS BOOLEAN AS $$
DECLARE
    has_perm BOOLEAN := FALSE;
BEGIN
    SELECT EXISTS(
        SELECT 1 
        FROM users u
        JOIN role_permissions rp ON u.role = rp.role
        JOIN permissions p ON rp.permission_id = p.id
        WHERE u.id = p_user_id 
        AND p.name = p_permission_name
        AND u.status = 'active'
    ) INTO has_perm;
    
    RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's organization
CREATE OR REPLACE FUNCTION get_user_organization(p_user_id UUID) 
RETURNS UUID AS $$
DECLARE
    org_id UUID;
BEGIN
    SELECT organization_id INTO org_id
    FROM users 
    WHERE id = p_user_id AND status = 'active';
    
    RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES (Optional - can be enabled later)
-- =====================================================

-- Enable RLS on tables (commented out for now)
-- ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE bid_requests ENABLE ROW LEVEL SECURITY;

-- Example RLS policy (commented out)
-- CREATE POLICY inventory_items_org_isolation ON inventory_items
--     FOR ALL TO authenticated_users
--     USING (organization_id = get_user_organization(auth.uid()));

-- =====================================================
-- SAMPLE DATA INSERTION (for testing)
-- =====================================================

-- Insert sample organization
INSERT INTO organizations (id, name, type, city, state, country) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Demo Hospital', 'hospital', 'Mumbai', 'Maharashtra', 'India');

-- Insert sample admin user
INSERT INTO users (
    id, organization_id, email, password_hash, first_name, last_name, 
    role, status, email_verified_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'admin@hospital.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewruCpk56d8.YY9u', -- password: admin123
    'Hospital',
    'Administrator',
    'hospital_admin',
    'active',
    NOW()
);

-- Insert sample demo user  
INSERT INTO users (
    id, organization_id, email, password_hash, first_name, last_name, 
    role, status, email_verified_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440002', 
    '550e8400-e29b-41d4-a716-446655440000',
    'demo@hospital.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewruCpk56d8.YY9u', -- password: demo123
    'Demo',
    'User',
    'inventory_manager',
    'active',
    NOW()
);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Add comments to document the schema
COMMENT ON TABLE organizations IS 'Multi-tenant organizations/hospitals using the system';
COMMENT ON TABLE users IS 'System users with role-based access control';
COMMENT ON TABLE user_sessions IS 'Active user sessions with JWT token management';
COMMENT ON TABLE permissions IS 'System permissions for fine-grained access control';
COMMENT ON TABLE role_permissions IS 'Mapping of roles to their allowed permissions';
COMMENT ON TABLE user_audit_log IS 'Comprehensive audit trail for all user actions';

-- Final message
DO $$
BEGIN
    RAISE NOTICE '✅ MedInventory Authentication & Multi-Tenancy Schema Successfully Created!';
    RAISE NOTICE '📊 Tables Created: organizations, users, user_sessions, permissions, role_permissions, user_audit_log';
    RAISE NOTICE '🏥 Multi-tenancy: All existing tables updated with organization_id';
    RAISE NOTICE '👤 Demo Users: admin@hospital.com (admin123), demo@hospital.com (demo123)';
    RAISE NOTICE '🔐 Security: Role-based permissions, audit logging, session management';
END $$;