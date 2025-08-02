"""
Mock Database Service for Testing
This provides a simple in-memory database for testing without Supabase
"""

import json
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)

class MockDatabase:
    """Simple in-memory database for testing"""
    
    def __init__(self):
        self.inventory_items = []
        self.suppliers = []
        self.equipment = []
        self.bid_requests = []
        self.bids = []
        self.transactions = []
        
        # Load synthetic data if available
        self.load_synthetic_data()
    
    def load_synthetic_data(self):
        """Load synthetic data from JSON file if available"""
        try:
            with open('synthetic_data.json', 'r') as f:
                data = json.load(f)
                
            # Convert and load inventory items
            for item in data.get('inventory_items', []):
                item['id'] = str(uuid.uuid4())
                item['created_at'] = datetime.now().isoformat()
                item['updated_at'] = datetime.now().isoformat()
                self.inventory_items.append(item)
            
            # Load suppliers
            for supplier in data.get('suppliers', []):
                supplier['id'] = str(uuid.uuid4())
                supplier['created_at'] = datetime.now().isoformat()
                supplier['updated_at'] = datetime.now().isoformat()
                self.suppliers.append(supplier)
            
            # Load equipment
            for equipment in data.get('equipment', []):
                equipment['id'] = str(uuid.uuid4())
                equipment['created_at'] = datetime.now().isoformat()
                equipment['updated_at'] = datetime.now().isoformat()
                self.equipment.append(equipment)
                
            logger.info(f"✅ Loaded synthetic data: {len(self.inventory_items)} items, {len(self.suppliers)} suppliers, {len(self.equipment)} equipment")
            
        except FileNotFoundError:
            logger.info("📝 No synthetic data file found, starting with empty database")
        except Exception as e:
            logger.error(f"❌ Error loading synthetic data: {e}")
    
    # Inventory operations
    async def get_inventory_items(self, skip: int = 0, limit: int = 20, filters: Dict = None) -> Dict:
        """Get inventory items with pagination and filters"""
        items = self.inventory_items.copy()
        
        # Apply filters
        if filters:
            if filters.get('category'):
                items = [item for item in items if item['category'] == filters['category']]
            if filters.get('status'):
                items = [item for item in items if item['status'] == filters['status']]
            if filters.get('search'):
                search_term = filters['search'].lower()
                items = [item for item in items if search_term in item['name'].lower()]
        
        # Apply pagination
        total = len(items)
        paginated_items = items[skip:skip + limit]
        
        return {
            'items': paginated_items,
            'total': total,
            'skip': skip,
            'limit': limit
        }
    
    async def create_inventory_item(self, item_data: Dict) -> Dict:
        """Create new inventory item"""
        new_item = item_data.copy()
        new_item['id'] = str(uuid.uuid4())
        new_item['created_at'] = datetime.now().isoformat()
        new_item['updated_at'] = datetime.now().isoformat()
        
        # Set initial status
        quantity = new_item.get('quantity', 0)
        reorder_level = new_item.get('reorder_level', 0)
        
        if quantity == 0:
            new_item['status'] = 'out_of_stock'
        elif quantity <= reorder_level:
            new_item['status'] = 'low_stock'
        else:
            new_item['status'] = 'in_stock'
        
        self.inventory_items.append(new_item)
        logger.info(f"Created inventory item: {new_item['id']}")
        return new_item
    
    async def update_inventory_quantity(self, item_id: str, quantity_change: int, transaction_type: str, reference: str = None) -> Dict:
        """Update inventory quantity with transaction logging"""
        # Find the item
        item = None
        for i, inv_item in enumerate(self.inventory_items):
            if inv_item['id'] == item_id:
                item = inv_item
                break
        
        if not item:
            raise ValueError(f"Item {item_id} not found")
        
        # Update quantity
        old_quantity = item['quantity']
        new_quantity = max(0, old_quantity + quantity_change)
        item['quantity'] = new_quantity
        item['updated_at'] = datetime.now().isoformat()
        
        # Update status
        reorder_level = item.get('reorder_level', 0)
        if new_quantity == 0:
            item['status'] = 'out_of_stock'
        elif new_quantity <= reorder_level:
            item['status'] = 'low_stock'
        else:
            item['status'] = 'in_stock'
        
        # Log transaction
        transaction = {
            'id': str(uuid.uuid4()),
            'item_id': item_id,
            'transaction_type': transaction_type,
            'quantity': abs(quantity_change),
            'reference_type': reference or 'manual',
            'notes': f"Quantity changed from {old_quantity} to {new_quantity}",
            'created_at': datetime.now().isoformat()
        }
        self.transactions.append(transaction)
        
        logger.info(f"Updated inventory {item_id}: {old_quantity} → {new_quantity}")
        return item
    
    # Bidding operations
    async def create_bid_request(self, request_data: Dict) -> Dict:
        """Create new bid request"""
        new_request = request_data.copy()
        new_request['id'] = str(uuid.uuid4())
        new_request['created_at'] = datetime.now().isoformat()
        new_request['updated_at'] = datetime.now().isoformat()
        
        # Convert date objects to strings
        if 'deadline' in new_request and hasattr(new_request['deadline'], 'isoformat'):
            new_request['deadline'] = new_request['deadline'].isoformat()
        
        self.bid_requests.append(new_request)
        logger.info(f"Created bid request: {new_request['id']}")
        return new_request
    
    async def get_bid_requests(self, skip: int = 0, limit: int = 20, filters: Dict = None) -> Dict:
        """Get bid requests with pagination"""
        requests = self.bid_requests.copy()
        
        if filters:
            if filters.get('status'):
                requests = [req for req in requests if req['status'] == filters['status']]
            if filters.get('category'):
                requests = [req for req in requests if req['category'] == filters['category']]
        
        total = len(requests)
        paginated_requests = requests[skip:skip + limit]
        
        return {
            'requests': paginated_requests,
            'total': total,
            'skip': skip,
            'limit': limit
        }
    
    async def get_suppliers(self, active_only: bool = True) -> List[Dict]:
        """Get suppliers"""
        suppliers = self.suppliers.copy()
        if active_only:
            suppliers = [s for s in suppliers if s.get('status') == 'active']
        return suppliers
    
    async def get_equipment(self, skip: int = 0, limit: int = 20, filters: Dict = None) -> Dict:
        """Get equipment with pagination"""
        equipment = self.equipment.copy()
        
        if filters:
            if filters.get('status'):
                equipment = [eq for eq in equipment if eq['status'] == filters['status']]
            if filters.get('type'):
                equipment = [eq for eq in equipment if eq['type'] == filters['type']]
        
        total = len(equipment)
        paginated_equipment = equipment[skip:skip + limit]
        
        return {
            'equipment': paginated_equipment,
            'total': total,
            'skip': skip,
            'limit': limit
        }
    
    # Client property for compatibility
    @property
    def client(self):
        """Compatibility property"""
        return self

# Global mock database instance
mock_db = MockDatabase()

# Function to check database connection (always returns True for mock)
async def check_database_connection() -> bool:
    """Mock database connection check"""
    return True