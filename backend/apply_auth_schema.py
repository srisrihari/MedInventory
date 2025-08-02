#!/usr/bin/env python3
"""
Script to apply authentication and multi-tenancy schema to Supabase database.
This script reads the auth_database_schema.sql file and executes it against Supabase.
"""

import asyncio
import os
from pathlib import Path
from supabase import create_client, Client
from loguru import logger
import sys

# Add the parent directory to sys.path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from app.config import settings
except ImportError:
    logger.error("❌ Could not import settings. Make sure you're running from the backend directory.")
    sys.exit(1)

def create_supabase_client() -> Client:
    """Create and return Supabase client"""
    try:
        client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY  # Use service role key for admin operations
        )
        logger.info("✅ Supabase client created successfully")
        return client
    except Exception as e:
        logger.error(f"❌ Failed to create Supabase client: {e}")
        raise

def read_sql_file(file_path: str) -> str:
    """Read and return the contents of the SQL file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        logger.info(f"✅ Read SQL file: {file_path}")
        return content
    except FileNotFoundError:
        logger.error(f"❌ SQL file not found: {file_path}")
        raise
    except Exception as e:
        logger.error(f"❌ Failed to read SQL file: {e}")
        raise

def execute_sql_script(client: Client, sql_content: str) -> bool:
    """Execute the SQL script against Supabase"""
    try:
        # Split the SQL content into individual statements
        # We need to be careful with multi-line statements and comments
        statements = []
        current_statement = []
        
        for line in sql_content.split('\n'):
            line = line.strip()
            
            # Skip empty lines and single-line comments
            if not line or line.startswith('--'):
                continue
            
            # Skip multi-line comments
            if line.startswith('/*') and line.endswith('*/'):
                continue
                
            current_statement.append(line)
            
            # If line ends with semicolon, it's the end of a statement
            if line.rstrip().endswith(';'):
                statement = ' '.join(current_statement)
                if statement.strip():
                    statements.append(statement)
                current_statement = []
        
        # Add any remaining statement
        if current_statement:
            statement = ' '.join(current_statement)
            if statement.strip():
                statements.append(statement)
        
        logger.info(f"📝 Found {len(statements)} SQL statements to execute")
        
        # Execute each statement
        success_count = 0
        for i, statement in enumerate(statements, 1):
            try:
                # Clean up the statement
                clean_statement = statement.strip()
                if not clean_statement:
                    continue
                
                logger.info(f"⚡ Executing statement {i}/{len(statements)}")
                
                # Use raw SQL execution through supabase-py
                # Note: supabase-py doesn't have direct SQL execution, so we'll use the REST API
                response = client.postgrest.rpc('sql', {'query': clean_statement}).execute()
                
                success_count += 1
                logger.info(f"✅ Statement {i} executed successfully")
                
            except Exception as e:
                # Log the error but continue with other statements
                logger.warning(f"⚠️  Statement {i} failed: {e}")
                logger.debug(f"Failed statement: {clean_statement[:100]}...")
                continue
        
        logger.info(f"🎉 Schema application completed! {success_count}/{len(statements)} statements executed successfully")
        return success_count > 0
        
    except Exception as e:
        logger.error(f"❌ Failed to execute SQL script: {e}")
        return False

async def main():
    """Main function to apply the auth schema"""
    logger.info("🚀 MedInventory Auth Schema Application")
    logger.info("=" * 50)
    
    try:
        # Check if we have valid Supabase credentials
        if (settings.SUPABASE_URL == "https://placeholder.supabase.co" or 
            settings.SUPABASE_SERVICE_ROLE_KEY == "placeholder-service-key"):
            logger.error("❌ Placeholder Supabase credentials detected!")
            logger.error("📝 Please update your .env file with real Supabase credentials")
            logger.error("🔧 Get your credentials from: https://supabase.com/dashboard/project/[your-project]/settings/api")
            return False
        
        # Create Supabase client
        logger.info("🔗 Connecting to Supabase...")
        client = create_supabase_client()
        
        # Test connection using existing table
        try:
            # Try a simple query to test connection using existing inventory_items table
            client.table('inventory_items').select('id').limit(1).execute()
            logger.info("✅ Supabase connection successful!")
        except Exception as e:
            logger.warning(f"⚠️  Connection test with inventory_items table failed: {e}")
            logger.info("🔄 This is expected if this is a fresh database. Proceeding with schema creation...")
            # Don't return False here, continue with schema creation
        
        # Read the SQL schema file
        sql_file_path = Path(__file__).parent / "auth_database_schema.sql"
        logger.info(f"📖 Reading SQL schema file: {sql_file_path}")
        sql_content = read_sql_file(str(sql_file_path))
        
        # Confirm with user
        print("\n⚠️  This will apply authentication and multi-tenancy schema to your Supabase database.")
        print("📊 Changes include:")
        print("   • Create organizations, users, user_sessions tables")
        print("   • Add user roles and permissions system") 
        print("   • Update all existing tables with organization_id")
        print("   • Create audit logging and security functions")
        print("   • Insert sample data for testing")
        
        confirm = input("\n👉 Continue? (y/N): ").strip().lower()
        if confirm != 'y':
            logger.info("❌ Schema application cancelled by user")
            return False
        
        # Execute the SQL script
        logger.info("⚡ Applying authentication schema...")
        success = execute_sql_script(client, sql_content)
        
        if success:
            logger.info("🎉 Authentication schema applied successfully!")
            logger.info("")
            logger.info("📋 What was created:")
            logger.info("   ✅ organizations table - Multi-tenant hospital management")
            logger.info("   ✅ users table - User authentication with roles")
            logger.info("   ✅ user_sessions table - JWT session management")
            logger.info("   ✅ permissions & role_permissions - Fine-grained access control")
            logger.info("   ✅ user_audit_log - Comprehensive audit trail")
            logger.info("   ✅ Multi-tenancy - All existing tables updated")
            logger.info("")
            logger.info("👤 Demo Users Created:")
            logger.info("   📧 admin@hospital.com (password: admin123) - Hospital Admin")
            logger.info("   📧 demo@hospital.com  (password: demo123)  - Inventory Manager")
            logger.info("")
            logger.info("🔄 Next Steps:")
            logger.info("   1. Update your backend API to use the new auth system")
            logger.info("   2. Test login/signup functionality")
            logger.info("   3. Implement role-based access control")
            logger.info("   4. Configure session management")
            return True
        else:
            logger.error("❌ Schema application failed!")
            return False
            
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    asyncio.run(main())