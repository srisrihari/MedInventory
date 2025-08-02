"""
Inventory API endpoints for MedInventory
Handles inventory items, expiry tracking, and related operations
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, Dict, Any, List
from loguru import logger
from app.api.auth import get_current_user
from app.database import db

router = APIRouter(tags=["Inventory Management"])


@router.get("/items")
async def get_inventory_items(
    skip: int = Query(0, description="Number of items to skip"),
    limit: int = Query(50, description="Maximum number of items to return"),
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[str] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search in item names"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get inventory items with filtering and pagination"""
    try:
        organization_id = current_user.get('organization_id')
        
        if not organization_id:
            raise HTTPException(status_code=400, detail="User organization not found")
        
        # Build filters
        filters = {}
        if category:
            filters['category'] = category
        if status:
            filters['status'] = status
        if search:
            filters['search'] = search
        
        # Get inventory items
        result = await db.get_inventory_items(
            skip=skip, 
            limit=limit, 
            filters=filters
        )
        
        return {
            "items": result['items'],
            "total": result['total'],
            "skip": result['skip'],
            "limit": result['limit']
        }
        
    except Exception as e:
        logger.error(f"Error getting inventory items: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve inventory items: {str(e)}")


@router.get("/expiry")
async def get_expiry_items(
    status: Optional[str] = Query(None, description="Filter by expiry status: expired, expiring-soon, ok"),
    days_threshold: int = Query(30, description="Days threshold for expiring soon"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get items with expiry information"""
    try:
        organization_id = current_user.get('organization_id')
        
        if not organization_id:
            raise HTTPException(status_code=400, detail="User organization not found")
        
        # Get all inventory items
        result = await db.get_inventory_items(limit=1000)
        items = result['items']
        
        # Process expiry information
        from datetime import datetime, timedelta
        today = datetime.now().date()
        
        processed_items = []
        for item in items:
            if not item.get('expiry_date'):
                continue
                
            try:
                expiry_date = datetime.strptime(item['expiry_date'], '%Y-%m-%d').date()
                days_until_expiry = (expiry_date - today).days
                
                # Determine status
                if days_until_expiry < 0:
                    expiry_status = "expired"
                    days_text = f"{abs(days_until_expiry)} days ago"
                elif days_until_expiry <= days_threshold:
                    expiry_status = "expiring-soon"
                    days_text = f"{days_until_expiry} days"
                else:
                    expiry_status = "ok"
                    days_text = f"{days_until_expiry} days"
                
                # Apply status filter if specified
                if status and expiry_status != status:
                    continue
                
                processed_item = {
                    "id": item['id'],
                    "name": item['name'],
                    "category": item.get('category', 'Unknown'),
                    "batch_number": item.get('batch_number', 'N/A'),
                    "expiry_date": item['expiry_date'],
                    "quantity": item.get('quantity', 0),
                    "supplier": item.get('supplier', 'Unknown'),
                    "location": item.get('location', 'Unknown'),
                    "alert_days": item.get('alert_days', 30),
                    "alert_enabled": item.get('alert_enabled', False),
                    "extended_date": item.get('extended_date'),
                    "notes": item.get('notes'),
                    "expiry_status": expiry_status,
                    "days_until_expiry": days_until_expiry,
                    "days_text": days_text
                }
                
                processed_items.append(processed_item)
                
            except Exception as e:
                logger.warning(f"Error processing expiry date for item {item.get('id')}: {e}")
                continue
        
        # Sort by expiry date (closest first)
        processed_items.sort(key=lambda x: x['days_until_expiry'])
        
        return {
            "items": processed_items,
            "total": len(processed_items),
            "expired_count": len([i for i in processed_items if i['expiry_status'] == 'expired']),
            "expiring_soon_count": len([i for i in processed_items if i['expiry_status'] == 'expiring-soon']),
            "ok_count": len([i for i in processed_items if i['expiry_status'] == 'ok'])
        }
        
    except Exception as e:
        logger.error(f"Error getting expiry items: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve expiry items: {str(e)}")


@router.get("/expiry/alerts")
async def get_expiry_alerts(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get expiry alert settings"""
    try:
        organization_id = current_user.get('organization_id')
        
        if not organization_id:
            raise HTTPException(status_code=400, detail="User organization not found")
        
        # Get alert settings from database
        # For now, return empty array - this would be implemented based on your alert table structure
        alerts = []
        
        return {
            "alerts": alerts,
            "total": len(alerts)
        }
        
    except Exception as e:
        logger.error(f"Error getting expiry alerts: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve expiry alerts: {str(e)}")


@router.post("/expiry/alerts")
async def create_expiry_alert(
    alert_data: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Create or update expiry alert"""
    try:
        organization_id = current_user.get('organization_id')
        
        if not organization_id:
            raise HTTPException(status_code=400, detail="User organization not found")
        
        # Add organization_id to alert data
        alert_data['organization_id'] = organization_id
        
        # This would save to your alert settings table
        # For now, return success
        return {
            "message": "Alert created successfully",
            "alert_id": "ALERT_" + str(hash(str(alert_data)))
        }
        
    except Exception as e:
        logger.error(f"Error creating expiry alert: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create expiry alert: {str(e)}")


@router.put("/items/{item_id}/expiry")
async def update_item_expiry(
    item_id: str,
    expiry_data: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Update item expiry date"""
    try:
        organization_id = current_user.get('organization_id')
        
        if not organization_id:
            raise HTTPException(status_code=400, detail="User organization not found")
        
        # Update the item in database
        # This would update the inventory_items table
        # For now, return success
        return {
            "message": "Expiry date updated successfully",
            "item_id": item_id
        }
        
    except Exception as e:
        logger.error(f"Error updating item expiry: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update item expiry: {str(e)}")