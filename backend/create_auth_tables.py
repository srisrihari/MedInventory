#!/usr/bin/env python3
"""
Script to create authentication tables in Supabase using the SQL editor manually.
This script generates the SQL commands that you can copy-paste into Supabase SQL editor.
"""

import os
import sys
from pathlib import Path
from loguru import logger

# Add the parent directory to sys.path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from app.config import settings
except ImportError:
    logger.error("❌ Could not import settings. Make sure you're running from the backend directory.")
    sys.exit(1)

def generate_sql_commands():
    """Generate SQL commands for manual execution in Supabase"""
    
    sql_commands = """
-- =====================================================
-- MedInventory Authentication Schema - Manual Creation
-- =====================================================
-- Copy and paste these commands into your Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/[your-project]/sql

-- 1. Create ENUM types
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

-- 2. Create organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) DEFAULT 'hospital',
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    phone VARCHAR(50),
    email VARCHAR(255),
    subscription_plan VARCHAR(50) DEFAULT 'trial',
    subscription_status VARCHAR(50) DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- 3. Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    role user_role NOT NULL DEFAULT 'staff_user',
    department VARCHAR(100),
    job_title VARCHAR(150),
    status user_status DEFAULT 'pending',
    email_verified_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    mfa_enabled BOOLEAN DEFAULT false,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{}',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create user sessions table
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    refresh_token_hash VARCHAR(255) UNIQUE,
    status session_status DEFAULT 'active',
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create permissions table
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create role permissions table
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role, permission_id)
);

-- 7. Create audit log table
CREATE TABLE user_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Add multi-tenant columns to existing tables
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE suppliers 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE equipment 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE bid_requests 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE inventory_transactions 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- 9. Create indexes
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_inventory_items_organization_id ON inventory_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_organization_id ON suppliers(organization_id);
CREATE INDEX IF NOT EXISTS idx_equipment_organization_id ON equipment(organization_id);

-- 10. Create updated_at trigger for new tables
CREATE TRIGGER update_organizations_updated_at 
    BEFORE UPDATE ON organizations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Insert sample organization and users
INSERT INTO organizations (id, name, type, city, state, country) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Demo Hospital', 'hospital', 'Mumbai', 'Maharashtra', 'India')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (
    id, organization_id, email, password_hash, first_name, last_name, 
    role, status, email_verified_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'admin@hospital.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewruCpk56d8.YY9u',
    'Hospital',
    'Administrator',
    'hospital_admin',
    'active',
    NOW()
) ON CONFLICT (email) DO NOTHING;

INSERT INTO users (
    id, organization_id, email, password_hash, first_name, last_name, 
    role, status, email_verified_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440002', 
    '550e8400-e29b-41d4-a716-446655440000',
    'demo@hospital.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewruCpk56d8.YY9u',
    'Demo',
    'User',
    'inventory_manager',
    'active',
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- 12. Update existing data with organization_id
UPDATE inventory_items SET organization_id = '550e8400-e29b-41d4-a716-446655440000' WHERE organization_id IS NULL;
UPDATE suppliers SET organization_id = '550e8400-e29b-41d4-a716-446655440000' WHERE organization_id IS NULL;
UPDATE equipment SET organization_id = '550e8400-e29b-41d4-a716-446655440000' WHERE organization_id IS NULL;
UPDATE bid_requests SET organization_id = '550e8400-e29b-41d4-a716-446655440000' WHERE organization_id IS NULL;
UPDATE inventory_transactions SET organization_id = '550e8400-e29b-41d4-a716-446655440000' WHERE organization_id IS NULL;
"""

    return sql_commands

def main():
    """Main function to generate and display SQL commands"""
    logger.info("🚀 MedInventory Authentication Schema Generator")
    logger.info("=" * 60)
    
    # Check credentials
    if (settings.SUPABASE_URL == "https://placeholder.supabase.co" or 
        settings.SUPABASE_SERVICE_ROLE_KEY == "placeholder-service-key"):
        logger.error("❌ Placeholder Supabase credentials detected!")
        logger.error("📝 Please update your .env file with real Supabase credentials")
        return False
    
    logger.info(f"🔗 Target Database: {settings.SUPABASE_URL}")
    logger.info("")
    
    # Generate SQL commands
    sql_commands = generate_sql_commands()
    
    # Write to file
    output_file = Path(__file__).parent / "supabase_auth_schema.sql"
    with open(output_file, 'w') as f:
        f.write(sql_commands)
    
    logger.info("📄 SQL commands generated and saved to: supabase_auth_schema.sql")
    logger.info("")
    logger.info("🔧 MANUAL STEPS TO APPLY SCHEMA:")
    logger.info("=" * 40)
    logger.info("1. Go to your Supabase dashboard:")
    logger.info(f"   {settings.SUPABASE_URL.replace('https://', 'https://supabase.com/dashboard/project/')}/sql")
    logger.info("")
    logger.info("2. Copy the SQL commands from: supabase_auth_schema.sql")
    logger.info("3. Paste them into the SQL Editor")
    logger.info("4. Click 'Run' to execute the schema")
    logger.info("")
    logger.info("👤 Demo Users (after schema creation):")
    logger.info("   📧 admin@hospital.com (password: admin123) - Hospital Admin")
    logger.info("   📧 demo@hospital.com  (password: demo123)  - Inventory Manager")
    logger.info("")
    logger.info("✅ The schema will add:")
    logger.info("   • User authentication with roles")
    logger.info("   • Multi-tenant organization support")
    logger.info("   • Session management")
    logger.info("   • Audit logging")
    logger.info("   • All existing data will be preserved")
    
    print("\n" + "="*60)
    print("📋 SQL COMMANDS TO COPY:")
    print("="*60)
    print(sql_commands)
    print("="*60)
    
    return True

if __name__ == "__main__":
    main()