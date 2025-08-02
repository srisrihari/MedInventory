"""
Database connection and utilities for MedInventory
Uses Supabase as the primary database
"""

from supabase import create_client, Client
from app.config import settings
import asyncio
from typing import Dict, List, Any, Optional
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SupabaseClient:
    """Singleton Supabase client wrapper"""
    
    _instance: Optional[Client] = None
    
    @classmethod
    def get_client(cls) -> Client:
        """Get or create Supabase client"""
        if cls._instance is None:
            try:
                cls._instance = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_SERVICE_ROLE_KEY  # Using service role for full access
                )
                logger.info("✅ Supabase client initialized successfully")
            except Exception as e:
                logger.error(f"❌ Failed to initialize Supabase client: {e}")
                raise
        return cls._instance

# Global client instance
supabase: Client = SupabaseClient.get_client()

class DatabaseService:
    """Database service with common operations"""
    
    def __init__(self):
        self.client = supabase
    
    async def execute_query(self, query: str, params: Dict = None) -> List[Dict[str, Any]]:
        """Execute raw SQL query"""
        try:
            result = self.client.rpc('execute_sql', {'query': query, 'params': params or {}})
            return result.data
        except Exception as e:
            logger.error(f"Database query failed: {e}")
            raise
    
    # Inventory Operations
    async def get_inventory_items(self, skip: int = 0, limit: int = 20, filters: Dict = None) -> Dict:
        """Get inventory items with pagination and filters"""
        try:
            query = self.client.table('inventory_items').select('*')
            
            # Apply filters
            if filters:
                if filters.get('category'):
                    query = query.eq('category', filters['category'])
                if filters.get('status'):
                    query = query.eq('status', filters['status'])
                if filters.get('search'):
                    query = query.ilike('name', f"%{filters['search']}%")
            
            # Apply pagination
            result = query.range(skip, skip + limit - 1).execute()
            
            # Get total count
            count_result = self.client.table('inventory_items').select('id', count='exact').execute()
            
            return {
                'items': result.data,
                'total': count_result.count,
                'skip': skip,
                'limit': limit
            }
        except Exception as e:
            logger.error(f"Failed to get inventory items: {e}")
            raise
    
    async def create_inventory_item(self, item_data: Dict) -> Dict:
        """Create new inventory item"""
        try:
            result = self.client.table('inventory_items').insert(item_data).execute()
            logger.info(f"Created inventory item: {result.data[0]['id']}")
            return result.data[0]
        except Exception as e:
            logger.error(f"Failed to create inventory item: {e}")
            raise
    
    async def update_inventory_quantity(self, item_id: str, quantity_change: int, transaction_type: str, reference: str = None) -> Dict:
        """Update inventory quantity with transaction logging"""
        try:
            # Start transaction
            # Get current item
            current_item = self.client.table('inventory_items').select('*').eq('id', item_id).execute()
            if not current_item.data:
                raise ValueError(f"Item {item_id} not found")
            
            item = current_item.data[0]
            new_quantity = max(0, item['quantity'] + quantity_change)
            
            # Determine new status
            if new_quantity == 0:
                new_status = 'out_of_stock'
            elif new_quantity <= item['reorder_level']:
                new_status = 'low_stock'
            else:
                new_status = 'in_stock'
            
            # Update item
            updated_item = self.client.table('inventory_items').update({
                'quantity': new_quantity,
                'status': new_status,
                'updated_at': 'now()'
            }).eq('id', item_id).execute()
            
            # Log transaction
            transaction_data = {
                'item_id': item_id,
                'transaction_type': transaction_type,
                'quantity': abs(quantity_change),
                'reference_type': reference or 'manual',
                'notes': f"Quantity changed from {item['quantity']} to {new_quantity}"
            }
            
            self.client.table('inventory_transactions').insert(transaction_data).execute()
            
            logger.info(f"Updated inventory {item_id}: {item['quantity']} → {new_quantity}")
            return updated_item.data[0]
            
        except Exception as e:
            logger.error(f"Failed to update inventory quantity: {e}")
            raise
    
    # Bidding Operations
    async def create_bid_request(self, request_data: Dict) -> Dict:
        """Create new bid request"""
        try:
            result = self.client.table('bid_requests').insert(request_data).execute()
            logger.info(f"Created bid request: {result.data[0]['id']}")
            return result.data[0]
        except Exception as e:
            logger.error(f"Failed to create bid request: {e}")
            raise
    
    async def get_bid_requests(self, skip: int = 0, limit: int = 20, filters: Dict = None) -> Dict:
        """Get bid requests with pagination"""
        try:
            query = self.client.table('bid_requests').select('*')
            
            if filters:
                if filters.get('status'):
                    query = query.eq('status', filters['status'])
                if filters.get('category'):
                    query = query.eq('category', filters['category'])
            
            result = query.order('created_at', desc=True).range(skip, skip + limit - 1).execute()
            count_result = self.client.table('bid_requests').select('id', count='exact').execute()
            
            return {
                'requests': result.data,
                'total': count_result.count,
                'skip': skip,
                'limit': limit
            }
        except Exception as e:
            logger.error(f"Failed to get bid requests: {e}")
            raise
    
    async def create_bid(self, bid_data: Dict) -> Dict:
        """Create new bid"""
        try:
            result = self.client.table('bids').insert(bid_data).execute()
            logger.info(f"Created bid: {result.data[0]['id']}")
            return result.data[0]
        except Exception as e:
            logger.error(f"Failed to create bid: {e}")
            raise
    
    async def get_bids_for_request(self, request_id: str) -> List[Dict]:
        """Get all bids for a specific request"""
        try:
            result = self.client.table('bids').select('*, suppliers(name, rating)').eq('request_id', request_id).order('created_at', desc=True).execute()
            return result.data
        except Exception as e:
            logger.error(f"Failed to get bids for request {request_id}: {e}")
            raise
    
    # Supplier Operations
    async def get_suppliers(self, active_only: bool = True) -> List[Dict]:
        """Get suppliers"""
        try:
            query = self.client.table('suppliers').select('*')
            if active_only:
                query = query.eq('status', 'active')
            
            result = query.order('name').execute()
            return result.data
        except Exception as e:
            logger.error(f"Failed to get suppliers: {e}")
            raise
    
    async def get_supplier(self, supplier_id: str) -> Dict:
        """Get supplier by ID"""
        try:
            result = self.client.table('suppliers').select('*').eq('id', supplier_id).execute()
            if result.data:
                return result.data[0]
            return None
        except Exception as e:
            logger.error(f"Failed to get supplier {supplier_id}: {e}")
            raise
    
    async def get_bid_request(self, request_id: str) -> Dict:
        """Get bid request by ID"""
        try:
            result = self.client.table('bid_requests').select('*').eq('id', request_id).execute()
            if result.data:
                return result.data[0]
            return None
        except Exception as e:
            logger.error(f"Failed to get bid request {request_id}: {e}")
            raise
    
    # Equipment Operations
    async def get_equipment(self, skip: int = 0, limit: int = 20, filters: Dict = None) -> Dict:
        """Get equipment with pagination"""
        try:
            query = self.client.table('equipment').select('*')
            
            if filters:
                if filters.get('status'):
                    query = query.eq('status', filters['status'])
                if filters.get('type'):
                    query = query.eq('type', filters['type'])
            
            result = query.range(skip, skip + limit - 1).execute()
            count_result = self.client.table('equipment').select('id', count='exact').execute()
            
            return {
                'equipment': result.data,
                'total': count_result.count,
                'skip': skip,
                'limit': limit
            }
        except Exception as e:
            logger.error(f"Failed to get equipment: {e}")
            raise
    
    # AI Agent Logging
    async def log_ai_agent_action(self, agent_type: str, action: str, reference_type: str = None, reference_id: str = None, input_data: Dict = None, output_data: Dict = None, status: str = "success", error_message: str = None, execution_time_ms: int = None):
        """Log AI agent actions for monitoring and debugging"""
        try:
            log_data = {
                'agent_type': agent_type,
                'action': action,
                'reference_type': reference_type,
                'reference_id': reference_id,
                'input_data': input_data,
                'output_data': output_data,
                'status': status,
                'error_message': error_message,
                'execution_time_ms': execution_time_ms
            }
            
            result = self.client.table('ai_agent_logs').insert(log_data).execute()
            logger.info(f"Logged AI agent action: {agent_type}.{action}")
            return result.data[0]
        except Exception as e:
            logger.error(f"Failed to log AI agent action: {e}")
            # Don't raise here to avoid breaking the main workflow
            pass

# Global database service instance
# For testing, use mock database by default
try:
    # Check if we have valid Supabase credentials
    if (settings.SUPABASE_URL != "https://placeholder.supabase.co" and 
        settings.SUPABASE_ANON_KEY != "placeholder-anon-key"):
        db = DatabaseService()
        logger.info("✅ Using real Supabase database")
    else:
        raise Exception("Using placeholder credentials, switching to mock database")
except Exception as e:
    logger.info(f"🔄 Using mock database for testing: {e}")
    from app.mock_database import mock_db
    db = mock_db

# Initialize auth database service
try:
    from app.services.auth_database import AuthDatabaseService
    auth_db = AuthDatabaseService(db.client if hasattr(db, 'client') else None)
    logger.info("✅ Auth database service initialized")
except Exception as e:
    logger.warning(f"⚠️  Auth database service initialization failed: {e}")
    auth_db = None

# Health check function
async def check_database_connection() -> bool:
    """Check if database connection is healthy"""
    try:
        if hasattr(db, 'client') and hasattr(db.client, 'table'):
            # Real Supabase connection
            result = db.client.table('inventory_items').select('id').limit(1).execute()
        else:
            # Mock database - always healthy
            pass
        return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False