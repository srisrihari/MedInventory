"""
Pydantic models for inventory management
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime, date
from enum import Enum

class InventoryStatus(str, Enum):
    IN_STOCK = "in_stock"
    LOW_STOCK = "low_stock"
    OUT_OF_STOCK = "out_of_stock"

class TransactionType(str, Enum):
    ADD = "add"
    SUBTRACT = "subtract"
    ADJUST = "adjust"

class ReferenceType(str, Enum):
    PURCHASE = "purchase"
    USAGE = "usage"
    ADJUSTMENT = "adjustment"
    WASTE = "waste"
    TRANSFER = "transfer"
    RETURN = "return"

# Base models
class InventoryItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    category: str = Field(..., min_length=1, max_length=100)
    quantity: int = Field(default=0, ge=0)
    unit: str = Field(..., max_length=50)
    batch_number: Optional[str] = Field(None, max_length=100)
    batch_id: Optional[str] = Field(None, max_length=50)
    expiry_date: Optional[date] = None
    supplier_id: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    location: Optional[str] = Field(None, max_length=200)
    reorder_level: int = Field(default=0, ge=0)

class InventoryItemCreate(InventoryItemBase):
    """Model for creating new inventory items"""
    
    @validator('expiry_date')
    def expiry_date_must_be_future(cls, v):
        if v and v <= datetime.now().date():
            raise ValueError('Expiry date must be in the future')
        return v

class InventoryItemUpdate(BaseModel):
    """Model for updating inventory items"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    unit: Optional[str] = Field(None, max_length=50)
    batch_number: Optional[str] = Field(None, max_length=100)
    batch_id: Optional[str] = Field(None, max_length=50)
    expiry_date: Optional[date] = None
    supplier_id: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    location: Optional[str] = Field(None, max_length=200)
    reorder_level: Optional[int] = Field(None, ge=0)

class InventoryItem(InventoryItemBase):
    """Complete inventory item model"""
    id: str
    status: InventoryStatus
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Transaction models
class InventoryTransactionBase(BaseModel):
    item_id: str
    transaction_type: TransactionType
    quantity: int = Field(..., gt=0)
    reference_type: Optional[ReferenceType] = None
    reference_id: Optional[str] = None
    notes: Optional[str] = Field(None, max_length=500)

class InventoryTransactionCreate(InventoryTransactionBase):
    """Model for creating inventory transactions"""
    pass

class InventoryTransaction(InventoryTransactionBase):
    """Complete inventory transaction model"""
    id: str
    performed_by: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Request/Response models
class InventoryQuantityUpdate(BaseModel):
    """Model for updating inventory quantity"""
    quantity_change: int = Field(..., description="Positive to add, negative to subtract")
    transaction_type: TransactionType
    reference_type: Optional[ReferenceType] = None
    reference_id: Optional[str] = None
    notes: Optional[str] = Field(None, max_length=500)
    
    @validator('quantity_change')
    def quantity_change_not_zero(cls, v):
        if v == 0:
            raise ValueError('Quantity change cannot be zero')
        return v

class InventoryItemFilter(BaseModel):
    """Model for filtering inventory items"""
    category: Optional[str] = None
    status: Optional[InventoryStatus] = None
    supplier_id: Optional[str] = None
    search: Optional[str] = Field(None, max_length=200)
    expiry_before: Optional[date] = None
    expiry_after: Optional[date] = None
    low_stock_only: Optional[bool] = False
    out_of_stock_only: Optional[bool] = False

class InventoryItemsResponse(BaseModel):
    """Response model for inventory items list"""
    items: List[InventoryItem]
    total: int
    skip: int
    limit: int
    
class InventoryTransactionsResponse(BaseModel):
    """Response model for inventory transactions list"""
    transactions: List[InventoryTransaction]
    total: int
    skip: int
    limit: int

# Statistics models
class InventoryStats(BaseModel):
    """Inventory statistics model"""
    total_items: int
    total_value: float
    low_stock_items: int
    out_of_stock_items: int
    expired_items: int
    expiring_soon_items: int
    categories_count: int
    suppliers_count: int
    
class CategoryStats(BaseModel):
    """Statistics by category"""
    category: str
    item_count: int
    total_quantity: int
    total_value: float
    low_stock_count: int
    
class InventoryOverview(BaseModel):
    """Complete inventory overview"""
    stats: InventoryStats
    categories: List[CategoryStats]
    recent_transactions: List[InventoryTransaction]
    low_stock_alerts: List[InventoryItem]
    expiry_alerts: List[InventoryItem]

# API Response models
class APIResponse(BaseModel):
    """Standard API response wrapper"""
    success: bool = True
    message: str = "Operation completed successfully"
    data: Optional[dict] = None

class ErrorResponse(BaseModel):
    """Error response model"""
    success: bool = False
    message: str
    error_code: Optional[str] = None
    details: Optional[dict] = None